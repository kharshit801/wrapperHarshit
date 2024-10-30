import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MoneyTracker = () => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#2f2f2f'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16
    },
    menuButton: {
      padding: 8
    },
    searchButton: {
      padding: 8
    },
    title: {
      fontSize: 24,
      fontWeight: '500',
      color: '#ffd43b'
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16
    },
    monthText: {
      fontSize: 18,
      fontWeight: '500',
      flex: 1,
      textAlign: 'center',
      color: '#fff'
    },
    filterButton: {
      marginLeft: 16
    },
    summary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#404040'
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center'
    },
    summaryLabel: {
      fontSize: 12,
      color: '#888',
      marginBottom: 4
    },
    summaryAmount: {
      fontSize: 16,
      fontWeight: '500'
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32
    },
    emptyStateText: {
      color: '#666',
      textAlign: 'center',
      marginTop: 16,
      fontSize: 16
    },
    addButton: {
      position: 'absolute',
      right: 24,
      bottom: 80,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#666',
      justifyContent: 'center',
      alignItems: 'center'
    },
    addButtonText: {
      fontSize: 32,
      color: '#fff'
    },
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 8,
      borderTopWidth: 1,
      borderTopColor: '#404040',
      backgroundColor: '#2f2f2f'
    },
    navItem: {
      alignItems: 'center',
      padding: 8
    },
    navText: {
      fontSize: 12,
      marginTop: 4,
      color: '#fff'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Wrapper</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.monthText}>October, 2024</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#fff" />
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

      {/* ded state */}
      <View style={styles.emptyState}>
        <Ionicons name="document-text-outline" size={48} color="#666" />
        <Text style={styles.emptyStateText}>
          No record in this month. Tap + to add new expense or income.
        </Text>
      </View>

      {/* add hover krne wala button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MoneyTracker;