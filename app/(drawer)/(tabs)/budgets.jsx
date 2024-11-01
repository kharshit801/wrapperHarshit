import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';

const BudgetsScreen = () => {
  const [budgets, setBudgets] = useState([
    { id: 'food', title: 'Food & Grocery', icon: 'shopping-basket', limit: 5000, spent: 2500, budgeted: true, category: 'essential' },
    { id: 'bills', title: 'Bills', icon: 'file-invoice-dollar', limit: 3000, spent: 1800, budgeted: true, category: 'essential' },
    { id: 'car', title: 'Car', icon: 'car', limit: 2000, spent: 500, budgeted: true, category: 'transport' },
    { id: 'clothing', title: 'Clothing', icon: 'tshirt', limit: 1500, spent: 1200, budgeted: true, category: 'personal' },
    { id: 'education', title: 'Education', icon: 'graduation-cap', limit: 4000, spent: 3800, budgeted: true, category: 'personal' },
  ]);

  const totalBudget = budgets.reduce((total, budget) => total + budget.limit, 0);
  const totalSpent = budgets.reduce((total, budget) => total + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const getBudgetStatus = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return { color: '#ff6b6b', message: 'Critical' };
    if (percentage >= 75) return { color: '#ffd43b', message: 'Warning' };
    return { color: '#51cf66', message: 'On Track' };
  };

  const renderProgressBar = (spent, limit) => {
    const percentage = Math.min((spent / limit) * 100, 100);
    const status = getBudgetStatus(spent, limit);
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: status.color }]} />
      </View>
    );
  };

  const renderBudgetCard = (budget) => {
    const status = getBudgetStatus(budget.spent, budget.limit);
    const percentageUsed = ((budget.spent / budget.limit) * 100).toFixed(0);

    return (
      <TouchableOpacity key={budget.id} style={styles.budgetCard}>
        <View style={styles.budgetInfo}>
          <View style={[styles.budgetIconContainer, { borderColor: status.color }]}>
            <FontAwesome5 name={budget.icon} size={wp('6%')} color={COLORS.text.primary} />
          </View>
          <View style={styles.budgetDetails}>
            <Text style={styles.budgetType}>{budget.title}</Text>
            <View style={styles.budgetProgressInfo}>
              <Text style={styles.budgetProgress}>
                ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
              </Text>
              <Text style={[styles.budgetStatus, { color: status.color }]}>
                {status.message}
              </Text>
            </View>
            {renderProgressBar(budget.spent, budget.limit)}
            <Text style={styles.percentageText}>{percentageUsed}% used</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.totalBalance}>
          <Text style={styles.totalBalanceLabel}>Monthly Budget Overview</Text>
          <Text style={styles.totalBalanceAmount}>₹{totalBudget.toLocaleString()}</Text>
          <View style={styles.overallProgress}>
            {renderProgressBar(totalSpent, totalBudget)}
            <Text style={styles.overallProgressText}>
              {spentPercentage.toFixed(0)}% of total budget used
            </Text>
          </View>
        </View>
        
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>SPENT</Text>
            <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
              ₹{totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>REMAINING</Text>
            <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
              ₹{totalRemaining.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Essential Expenses</Text>
        <View style={styles.budgetsList}>
          {budgets.filter(b => b.category === 'essential').map(renderBudgetCard)}
        </View>

        <Text style={styles.sectionTitle}>Transport</Text>
        <View style={styles.budgetsList}>
          {budgets.filter(b => b.category === 'transport').map(renderBudgetCard)}
        </View>

        <Text style={styles.sectionTitle}>Personal</Text>
        <View style={styles.budgetsList}>
          {budgets.filter(b => b.category === 'personal').map(renderBudgetCard)}
        </View>

        <TouchableOpacity style={styles.addBudgetButton}>
          <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
          <Text style={styles.addBudgetText}>ADD NEW CATEGORY</Text>
        </TouchableOpacity>
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
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: hp('2%')
  },
  overallProgress: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: wp('4%')
  },
  overallProgressText: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
    marginTop: hp('1%')
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
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '500',
    color: COLORS.text.primary,
    padding: wp('4%'),
    paddingBottom: wp('2%')
  },
  budgetsList: {
    paddingHorizontal: wp('4%')
  },
  budgetCard: {
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginBottom: wp('3%')
  },
  budgetInfo: {
    flexDirection: 'row',
  },
  budgetIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
    borderWidth: 2,
  },
  budgetDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  budgetType: {
    fontSize: wp('4.5%'),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: hp('0.5%')
  },
  budgetProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%')
  },
  budgetProgress: {
    fontSize: wp('4%'),
    color: COLORS.text.secondary,
    fontWeight: '500'
  },
  budgetStatus: {
    fontSize: wp('3.5%'),
    fontWeight: '500'
  },
  progressBarContainer: {
    height: hp('1%'),
    backgroundColor: COLORS.background,
    borderRadius: wp('1%'),
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: wp('1%')
  },
  percentageText: {
    fontSize: wp('3.5%'),
    color: COLORS.text.secondary,
    marginTop: hp('0.5%')
  },
  addBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    margin: wp('4%')
  },
  addBudgetText: {
    color: COLORS.text.primary,
    fontSize: wp('4%'),
    fontWeight: '500',
    marginLeft: wp('2%')
  }
});

export default BudgetsScreen;