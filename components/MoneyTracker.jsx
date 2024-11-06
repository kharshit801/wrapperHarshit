// MoneyTracker.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ExpenseCalculator from "./ExpenseCalculator";
import TransactionRecord from "./TransactionRecord";
import { useNavigation } from "@react-navigation/native";
import Header from "./commonheader";
import { useGlobalContext } from "./globalProvider";
import { ScrollView } from "react-native-gesture-handler";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { useTranslation } from "react-i18next";

const MoneyTracker = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useGlobalContext();
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    
    if (state.language && i18n.language !== state.language) {
      i18n.changeLanguage(state.language);
    }
    else{
      i18n.changeLanguage(state.language);
    }
  }, [state.language]);

  const showImageSourceOptions = () => {
    Alert.alert(
      "Select Image Source",
      "Choose where you want to pick the image from",
      [
        {
          text: "Camera",
          onPress: () => pickImage('camera')
        },
        {
          text: "Gallery",
          onPress: () => pickImage('gallery')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      let permissionResult;
      let result;

      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Permission Error", "Permission to access camera is required!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.01,
          base64: true,
          aspect: [4, 3],
          maxWidth: 600,
          maxHeight: 450
        });
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Permission Error", "Permission to access gallery is required!");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.01,
          base64: true,
          aspect: [4, 3],
          maxWidth: 600,
          maxHeight: 450
        });
      }

      if (!result.canceled) {
        await handleOCR(result.assets[0].base64);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to capture/select image");
    }
  };
  
  const handleOCR = async (base64Image) => {
    try {
      const apiKey = 'K82750295688957';
  
      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
      formData.append('language', 'eng');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');
  
      const response = await axios.post(
        'https://api.ocr.space/parse/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'apikey': apiKey
          }
        }
      );
  
      if (response.data.IsErroredOnProcessing) {
        throw new Error(response.data.ErrorMessage || "OCR processing failed");
      }
  
      if (!response.data.ParsedResults || response.data.ParsedResults.length === 0) {
        throw new Error("No text was extracted from the image");
      }
  
      const parsedText = response.data.ParsedResults[0].ParsedText;
      console.log('OCR Extracted Text:', parsedText);
      
      // Parse the expense data
      const expenseData = parseExpenseData(parsedText);
      console.log(expenseData);
      
      Alert.alert(
        "Receipt Processed",
        `Extracted Amount: ₹${expenseData.amount}\n\nFull Text:\n${parsedText}`,
        [
          {
            text: "Add Transaction",
            onPress: () => {
              setEditingTransaction({
                amount: parseFloat(expenseData.amount),
                type: "EXPENSE",
                date: new Date().toISOString(),
                description: "Receipt Scan"
              });
              setShowCalculator(true);
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
  
    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert("OCR Error", error.message || "Failed to process receipt");
    }
  };
  
  const parseExpenseData = (text) => {
    // Improved regex to find amount - looks for currency symbols and numbers
    const amountRegex = /(?:₹|RS|INR|Rs)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i;
    const match = text.match(amountRegex);
    const amount = match ? match[1].replace(/,/g, '') : "0.00";
    
    return {
      amount: amount,
      text: text
    };
  };
  
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowCalculator(true);
  };

  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      dispatch({
        type: "EDIT_TRANSACTION",
        payload: { id: editingTransaction.id, ...transactionData },
      });
      setEditingTransaction(null);
    } else {
      const newTransaction = {
        id: Date.now(),
        ...transactionData,
      };
      dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
    }
    setShowCalculator(false);
  };

  // Filter transactions for current month
  const currentMonthTransactions = state.transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    const monthStart = startOfMonth(parseISO(state.currentMonth));
    const monthEnd = endOfMonth(parseISO(state.currentMonth));

    return isWithinInterval(transactionDate, {
      start: monthStart,
      end: monthEnd,
    });
  });

  // Calculate summary for current month
  const currentMonthSummary = {
    expense: currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0),
    income: currentMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0),
  };
  currentMonthSummary.total =
    currentMonthSummary.income - currentMonthSummary.expense;

  const handlePreviousMonth = () => {
    dispatch({ type: "PREVIOUS_MONTH" });
  };

  const handleNextMonth = () => {
    dispatch({ type: "NEXT_MONTH" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Header  seachIconShown={true}/>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Ionicons
            name="chevron-back"
            size={wp("6%")}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(parseISO(state.currentMonth), "MMMM, yyyy")}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons
            name="chevron-forward"
            size={wp("6%")}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={wp("6%")} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("Expenses")}</Text>
          <Text style={[styles.summaryAmount, { color: "#ff6b6b" }]}>
            ₹{currentMonthSummary.expense.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("Income")}</Text>
          <Text style={[styles.summaryAmount, { color: "#51cf66" }]}>
            ₹{currentMonthSummary.income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("Total")}</Text>
          <Text
            style={[
              styles.summaryAmount,
              { color: currentMonthSummary.total >= 0 ? "#51cf66" : "#ff6b6b" },
            ]}
          >
            ₹{currentMonthSummary.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.transactionList}>
        {currentMonthTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={wp("12%")}
              color={COLORS.text.secondary}
            />
            <Text style={styles.emptyStateText}>{t("No Record Text")}</Text>
          </View>
        ) : (
          currentMonthTransactions.map((transaction) => (
            <TransactionRecord
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEdit}
            />
          ))
        )}
      </ScrollView>

      {/* Add Transaction Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCalculator(true)}
        onLongPress={showImageSourceOptions}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

  
      <Modal
        visible={showCalculator}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCalculator(false);
          setEditingTransaction(null);
        }}
      >
        <ExpenseCalculator
          onClose={() => {
            setShowCalculator(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          initialData={editingTransaction}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("4%"),
    backgroundColor: COLORS.lightbackground,
  },
  monthText: {
    fontSize: wp("4.5%"),
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
    color: COLORS.text.primary,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: wp("4%"),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground,
    backgroundColor: COLORS.background,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: {
    fontSize: wp("3%"),
    color: COLORS.text.secondary,
    marginBottom: hp("0.5%"),
  },
  summaryAmount: { fontSize: wp("4%"), fontWeight: "500" },
  transactionList: { flex: 1, backgroundColor: COLORS.background },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp("8%"),
    backgroundColor: COLORS.background,
    minHeight: hp("50%"),
  },
  emptyStateText: {
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: hp("2%"),
    fontSize: wp("4%"),
  },
  addButton: {
    position: "absolute",
    right: wp("7%"),
    bottom: hp("8%"),
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  addButtonText: { fontSize: wp("8%"), color: "#fff", fontWeight: "bold" },
  filterButton: { marginLeft: wp("4%") },
});

export default MoneyTracker;
