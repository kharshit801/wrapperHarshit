import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, StatusBar, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExpenseCalculator from './ExpenseCalculator';
import TransactionRecord from './TransactionRecord';

const MoneyTracker = ({ navigation }) => {
  // State management
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [summary, setSummary] = useState({
    expense: 0,
    income: 0,
    total: 0
  });

  // Load transactions from AsyncStorage
  useEffect(() => {
    loadTransactions();
  }, [currentMonth]);

  // Calculate summary whenever transactions change
  useEffect(() => {
    calculateSummary();
  }, [transactions]);

  // Format date to "Month, Year"
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  // Load transactions from storage
  const loadTransactions = async () => {
    try {
      const monthKey = currentMonth.toISOString().slice(0, 7); // Format: YYYY-MM
      const storedTransactions = await AsyncStorage.getItem(`transactions_${monthKey}`);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    }
  };

  // Calculate summary from transactions
  const calculateSummary = () => {
    const newSummary = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount;
      if (transaction.type === 'EXPENSE') {
        acc.expense += amount;
        acc.total -= amount;
      } else {
        acc.income += amount;
        acc.total += amount;
      }
      return acc;
    }, { expense: 0, income: 0, total: 0 });

    setSummary(newSummary);
  };

  // Handle saving new transaction
  const handleSaveTransaction = async (transactionData) => {
    const newTransaction = {
      id: Date.now(),
      ...transactionData
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    const monthKey = currentMonth.toISOString().slice(0, 7);
    
    try {
      await AsyncStorage.setItem(
        `transactions_${monthKey}`,
        JSON.stringify(updatedTransactions)
      );
      setTransactions(updatedTransactions);
      setShowCalculator(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  // Handle search
  const handleSearch = () => {
    navigation.navigate('SearchTransactions');
  };

  // Handle filter
  const handleFilter = () => {
    navigation.navigate('FilterTransactions');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('4%'),
      backgroundColor: COLORS.background
    },
    menuButton: {
      padding: wp('2%')
    },
    searchButton: {
      padding: wp('2%')
    },
    title: {
      fontSize: wp('6%'),
      fontWeight: '500',
      color: COLORS.secondary
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('4%'),
      backgroundColor: COLORS.lightbackground
    },
    monthText: {
      fontSize: wp('4.5%'),
      fontWeight: '500',
      flex: 1,
      textAlign: 'center',
      color: COLORS.text.primary
    },
    filterButton: {
      marginLeft: wp('4%')
    },
    summary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground,
      backgroundColor: COLORS.background
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center'
    },
    summaryLabel: {
      fontSize: wp('3%'),
      color: COLORS.text.secondary,
      marginBottom: hp('0.5%')
    },
    summaryAmount: {
      fontSize: wp('4%'),
      fontWeight: '500'
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp('8%'),
      backgroundColor: COLORS.background
    },
    emptyStateText: {
      color: COLORS.text.secondary,
      textAlign: 'center',
      marginTop: hp('2%'),
      fontSize: wp('4%')
    },
    addButton: {
      position: 'absolute',
      right: wp('7%'),
      bottom: hp('8%'),
      width: wp('14%'),
      height: wp('14%'),
      borderRadius: wp('7%'),
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    addButtonText: {
      fontSize: wp('8%'),
      color: COLORS.whiteBg
    },
    transactionList: {
      flex: 1,
      backgroundColor: COLORS.background
    }
  });

  const renderContent = () => {
    if (transactions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={wp('12%')} color={COLORS.text.secondary} />
          <Text style={styles.emptyStateText}>
            No record in this month. Tap + to add new expense or income.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionList}>
        {transactions.map(transaction => (
          <TransactionRecord key={transaction.id} transaction={transaction} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Image source={require('../assets/images/logo.png')} style={{ width: wp('20%'), height: wp('8%') }} resizeMode='contain'/>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Ionicons name="chevron-back" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{formatMonth(currentMonth)}</Text>
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Ionicons name="chevron-forward" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
          <Ionicons name="filter" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EXPENSE</Text>
          <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
            ₹{summary.expense.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>INCOME</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
            ₹{summary.income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={[styles.summaryAmount, { color: summary.total >= 0 ? '#51cf66' : '#ff6b6b' }]}>
            ₹{summary.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {renderContent()}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowCalculator(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showCalculator}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalculator(false)}
      >
        <ExpenseCalculator
          onClose={() => setShowCalculator(false)}
          onSave={handleSaveTransaction}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default MoneyTracker;