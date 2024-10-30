import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';

const CategoryScreen = () => {
  const categories = [
    { id: 'salary', title: 'Salary', icon: 'money-check-alt', type: 'income' },
    { id: 'freelancing', title: 'Freelancing', icon: 'laptop-code', type: 'income' },
    { id: 'rental', title: 'Rental Income', icon: 'home', type: 'income' },
    { id: 'investment', title: 'Investment', icon: 'chart-line', type: 'income' },
    { id: 'grocery', title: 'Grocery', icon: 'shopping-basket', type: 'expense' },
    { id: 'entertainment', title: 'Entertainment', icon: 'film', type: 'expense' },
    { id: 'transport', title: 'Transport', icon: 'bus-alt', type: 'expense' },
    { id: 'healthcare', title: 'Healthcare', icon: 'heartbeat', type: 'expense' },
    { id: 'utilities', title: 'Utilities', icon: 'lightbulb', type: 'expense' },
    { id: 'shopping', title: 'Shopping', icon: 'shopping-cart', type: 'expense' }
  ];

  const totalIncome = 9696;   // jab implement karenge to ye values change kar dena state se lena
  const totalExpense = 6969; 

  const renderCategoryItem = (category) => (
    <TouchableOpacity key={category.id} style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <FontAwesome5 name={category.icon} size={wp('6%')} color={COLORS.text.primary} />
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>₹{totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={[styles.summaryValue, { color: '#ff6b6b' }]}>₹{totalExpense.toFixed(2)}</Text>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Income Categories</Text>
        <View style={styles.categoryList}>
          {categories.filter(cat => cat.type === 'income').map(renderCategoryItem)}
        </View>
        <Text style={styles.sectionTitle}>Expense Categories</Text>
        <View style={styles.categoryList}>
          {categories.filter(cat => cat.type === 'expense').map(renderCategoryItem)}
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
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.secondary,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: wp('4%'),
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: wp('5%'),
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: wp('4%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: wp('4%')
  },
  categoryList: {
    paddingHorizontal: wp('2%'),
    marginBottom: wp('6%')
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginBottom: wp('3%')
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryTitle: {
    fontSize: wp('4.5%'),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: wp('3%')
  },
});

export default CategoryScreen;
