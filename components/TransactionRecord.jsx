import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

const TransactionRecord = ({ transaction }) => {
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
    amount: {
      fontSize: wp('4%'),
      fontWeight: '500',
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
    date: {
      fontSize: wp('3.5%'),
      color: COLORS.text.secondary,
    },
  });

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
          ₹{transaction.amount !== null && transaction.amount !== undefined ? transaction.amount.toFixed(2) : '0.00'}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.note}>{transaction.note || 'No note'}</Text>
        <Text style={styles.account}>{transaction.account}</Text>
      </View>
      <Text style={styles.date}>
        {transaction.date ? new Date(transaction.date).toLocaleString() : 'Invalid date'}
      </Text>
    </View>
  );
};

export default TransactionRecord;