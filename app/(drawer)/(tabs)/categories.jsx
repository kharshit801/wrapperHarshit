import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';

const CategoryScreen = () => {
  const categories = [
    { id: 'salary', title: 'Salary', icon: 'money-check-alt', type: 'income', amount: 5000, transactions: 1 },
    { id: 'freelancing', title: 'Freelancing', icon: 'laptop-code', type: 'income', amount: 2500, transactions: 3 },
    { id: 'rental', title: 'Rental Income', icon: 'home', type: 'income', amount: 1500, transactions: 1 },
    { id: 'investment', title: 'Investment', icon: 'chart-line', type: 'income', amount: 696, transactions: 2 },
    { id: 'grocery', title: 'Grocery', icon: 'shopping-basket', type: 'expense', amount: 2000, transactions: 8 },
    { id: 'entertainment', title: 'Entertainment', icon: 'film', type: 'expense', amount: 1000, transactions: 4 },
    { id: 'transport', title: 'Transport', icon: 'bus-alt', type: 'expense', amount: 800, transactions: 12 },
    { id: 'healthcare', title: 'Healthcare', icon: 'heartbeat', type: 'expense', amount: 1200, transactions: 2 },
    { id: 'utilities', title: 'Utilities', icon: 'lightbulb', type: 'expense', amount: 1500, transactions: 3 },
    { id: 'shopping', title: 'Shopping', icon: 'shopping-cart', type: 'expense', amount: 469, transactions: 5 }
  ];

  const totalIncome = categories.filter(cat => cat.type === 'income').reduce((sum, cat) => sum + cat.amount, 0);
  const totalExpense = categories.filter(cat => cat.type === 'expense').reduce((sum, cat) => sum + cat.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const getCategoryColor = (type) => {
    return type === 'income' ? '#51cf66' : '#ff6b6b';
  };

  const renderCategoryItem = (category) => (
    <TouchableOpacity key={category.id} style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIconContainer, { borderColor: getCategoryColor(category.type) }]}>
          <FontAwesome5 name={category.icon} size={wp('6%')} color={COLORS.text.primary} />
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.categoryStats}>
            <Text style={[styles.categoryAmount, { color: getCategoryColor(category.type) }]}>
              {category.type === 'income' ? '+' : '-'}₹{category.amount.toLocaleString()}
            </Text>
            <Text style={styles.transactionCount}>
              {category.transactions} {category.transactions === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.categoryMenu}>
        <Ionicons name="ellipsis-horizontal" size={wp('6%')} color={COLORS.text.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.totalBalance}>
          <Text style={styles.totalBalanceLabel}>Net Balance</Text>
          <Text style={[styles.totalBalanceAmount, { color: netBalance >= 0 ? '#51cf66' : '#ff6b6b' }]}>
            ₹{netBalance.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL INCOME</Text>
            <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
              ₹{totalIncome.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL EXPENSE</Text>
            <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
              ₹{totalExpense.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Income Categories</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryList}>
            {categories.filter(cat => cat.type === 'income').map(renderCategoryItem)}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryList}>
            {categories.filter(cat => cat.type === 'expense').map(renderCategoryItem)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  totalBalance: {
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.background
  },
  totalBalanceLabel: {
    fontSize: wp('4%'),
    color: COLORS.text.primary,
    marginBottom: hp('1%')
  },
  totalBalanceAmount: {
    fontSize: wp('7%'),
    fontWeight: '600'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: wp('4%'),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightbackground
  },
  summaryItem: {
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
  categoriesContainer: {
    padding: wp('4%')
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp('3%')
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '500',
    color: COLORS.text.primary
  },
  addButton: {
    padding: wp('2%')
  },
  categoryList: {
    marginBottom: wp('6%')
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginBottom: wp('3%')
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
    borderWidth: 2
  },
  categoryDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  categoryTitle: {
    fontSize: wp('4.5%'),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: hp('0.5%')
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryAmount: {
    fontSize: wp('4%'),
    fontWeight: '500'
  },
  transactionCount: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary
  },
  categoryMenu: {
    padding: wp('2%')
  }
});

export default CategoryScreen;