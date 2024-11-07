import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { format, parseISO } from 'date-fns';
import { useGlobalContext } from './globalProvider';

const TransactionRecord = ({ transaction, onEdit }) => {
  const { deleteExpense, loadExpensesFromDB } = useGlobalContext();

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return 'No date';
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleDelete = async (e) => {
    // Prevent the edit action from triggering when delete is pressed
    e.stopPropagation();
    
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteExpense(transaction.id);
              await loadExpensesFromDB(); // Reload transactions after deletion
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert(
                "Error",
                "Failed to delete transaction. Please try again."
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onEdit && onEdit(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text
          style={[
            styles.amount,
            { color: transaction.type === 'EXPENSE' ? '#ff6b6b' : '#51cf66' },
          ]}
        >
          ₹{transaction.amount !== null && transaction.amount !== undefined
            ? transaction.amount.toFixed(2)
            : '0.00'}
        </Text>
      </View>

      <Text style={styles.note}>{transaction.note || 'No note'}</Text>

      <View style={styles.bottomRow}>
        <View style={styles.leftInfo}>
          <Text style={styles.account}>{transaction.account}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{formatDateTime(transaction.date)}</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.deleteButton}
        >
          <Ionicons 
            name="trash-outline" 
            size={wp('3.8%')} 
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp('4%'),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  category: {
    fontSize: wp('4%'),
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  amount: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  note: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
    marginBottom: hp('1%'),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  account: {
    fontSize: wp('3.2%'),
    color: COLORS.text.secondary,
  },
  dot: {
    fontSize: wp('3.2%'),
    color: COLORS.text.secondary,
    marginHorizontal: wp('1.5%'),
  },
  date: {
    fontSize: wp('3.2%'),
    color: COLORS.text.secondary,
  },
  deleteButton: {
    opacity: 0.6,
    padding: wp('1%'),
  }
});

export default TransactionRecord;