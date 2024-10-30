import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

const MoneyTracker = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background
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
      right: wp('6%'),
      bottom: hp('10%'),
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
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Wrapper</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>October, 2024</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* summary section */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EXPENSE</Text>
          <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>₹0.00</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>INCOME</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>₹0.00</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>₹0.00</Text>
        </View>
      </View>

      {/* empty state */}
      <View style={styles.emptyState}>
        <Ionicons name="document-text-outline" size={wp('12%')} color={COLORS.text.secondary} />
        <Text style={styles.emptyStateText}>
          No record in this month. Tap + to add new expense or income.
        </Text>
      </View>

      {/* floating action button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MoneyTracker;