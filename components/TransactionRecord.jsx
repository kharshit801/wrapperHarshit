import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { format, parseISO } from 'date-fns';
import { useGlobalContext } from './globalProvider';

const TransactionRecord = ({ transaction }) => {
  const { formatDate } = useGlobalContext();

  const styles = StyleSheet.create({
    container: {
      padding: wp('4%'),
      backgroundColor: COLORS.background,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightbackground,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp('1%'),
    },
    category: {
      fontSize: wp('4%'),
      fontWeight: '500',
      color: COLORS.text.primary,
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    amount: {
      fontSize: wp('4%'),
      fontWeight: '500',
    },
    note: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
    },
    account: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
    },
    date: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
      marginTop: hp('0.5%'),
    },
  });

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return 'Invalid date';
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
      <View style={styles.details}>
        <Text style={styles.note}>{transaction.note || 'No note'}</Text>
        <Text style={styles.account}>{transaction.account}</Text>
      </View>
      <Text style={styles.date}>
        {formatDateTime(transaction.date)}
      </Text>
    </View>
  );
};

export default TransactionRecord;