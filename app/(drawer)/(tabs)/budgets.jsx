import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';
import { useGlobalContext } from '../../../components/globalProvider';
import { useTranslation } from 'react-i18next';
import { useBudgetNotifications, BudgetNotificationListener } from '../../../components/Budgetnotification';

const BudgetsScreen = () => {
  const { state, dispatch, changeLanguage } = useGlobalContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (state.language && i18n.language !== state.language) {
      i18n.changeLanguage(state.language);
    } else {
      i18n.changeLanguage(state.language);
    }
  }, [state.language]); 

  // see ye notification wala part abhi jo spent data use kar rha hai vo static hai
  // jab async data milega tab use karna haito bas sate me lake rkahna hoga and jab limit exceed hogi notify ho jayega user
  // now work on fecthing data fro records to this spent data



  const [budgets, setBudgets] = useState([
    { id: 'food', title: 'Food & Grocery', icon: 'shopping-basket', limit: 5000, spent: 5000, budgeted: true, category: 'essential' },
    { id: 'bills', title: 'Bills', icon: 'file-invoice-dollar', limit: 3000, spent: 3000, budgeted: true, category: 'essential' },
    { id: 'car', title: 'Car', icon: 'car', limit: 2000, spent: 1800, budgeted: true, category: 'transport' },
    { id: 'clothing', title: 'Clothing', icon: 'tshirt', limit: 1500, spent: 1200, budgeted: true, category: 'personal' },
    { id: 'education', title: 'Education', icon: 'graduation-cap', limit: 4000, spent: 3800, budgeted: true, category: 'personal' },
  ]);

  const totalBudget = budgets.reduce((total, budget) => total + budget.limit, 0);
  const totalSpent = budgets.reduce((total, budget) => total + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

const { checkBudgetThresholds, sendBudgetNotification } = useBudgetNotifications();

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // budget pe nazar rakhenge yaha se
  useEffect(() => {
    checkBudgetThresholds(budgets);
  }, [budgets, checkBudgetThresholds]);

   // Handle incoming notifications
   const handleNotificationReceived = (notification) => {
    const { budgetId, percentage } = notification.request.content.data;
    console.log(`Received notification for budget ${budgetId} at ${percentage}%`);
    
  };

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setNewLimit(budget.limit.toString());
    setModalVisible(true);
  };

  const saveBudgetChange = () => {
    const updatedBudgets = budgets.map(budget => {
      if (budget.id === selectedBudget.id) {
        const updatedBudget = { ...budget, limit: parseInt(newLimit, 10) };
        // Check if the new limit triggers any notifications
        sendBudgetNotification(updatedBudget);
        return updatedBudget;
      }
      return budget;
    });
    
    setBudgets(updatedBudgets);
    setModalVisible(false);
  };

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.budgetType}>{budget.title}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(budget)}>
                <Ionicons name="pencil-outline" size={wp('5%')} color={COLORS.text.primary} />
                <Text style={styles.editButtonText}>Edit </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.budgetProgressInfo}>
              <Text style={styles.budgetProgress}>
                ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
              </Text>
              <Text style={[styles.budgetStatus, { color: status.color }]}>
                {status.message}
              </Text>
            </View>
            {renderProgressBar(budget.spent, budget.limit)}
            <Text style={styles.percentageText}>{percentageUsed}% {t('used')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
       <BudgetNotificationListener onNotificationReceived={handleNotificationReceived} />
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.totalBalance}>
          <Text style={styles.totalBalanceLabel}>{t('monthlyBudgetOverview')}</Text>
          <Text style={styles.totalBalanceAmount}>₹{totalBudget.toLocaleString()}</Text>
          <View style={styles.overallProgress}>
            {renderProgressBar(totalSpent, totalBudget)}
            <Text style={styles.overallProgressText}>
              {spentPercentage.toFixed(0)}{ " %   "}{t('ofTotalBudgetUsed')}
            </Text>
          </View>
        </View>
        
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('spent')}</Text>
            <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
              ₹{totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('remaining')}</Text>
            <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
              ₹{totalRemaining.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('essentialExpenses')}</Text>
        <View style={styles.budgetsList}>
          {budgets.filter(b => b.category === 'essential').map(renderBudgetCard)}
        </View>

        <Text style={styles.sectionTitle}>{t('transport')}</Text>
        <View style={styles.budgetsList}>
          {budgets.filter(b => b.category === 'transport').map(renderBudgetCard)}
        </View>

        <Text style={styles.sectionTitle}>{t('personal')}</Text>
        <View style={styles.budgetsList}>
          {budgets.filter(b => b.category === 'personal').map(renderBudgetCard)}
        </View>

        <TouchableOpacity style={styles.addBudgetButton}>
          <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
          <Text style={styles.addBudgetText}>{t('addNewCategory')}</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Budget Limit</Text>
              {selectedBudget && (
                <>
                  <Text style={styles.modalLabel}>{selectedBudget.title}</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={newLimit}
                    onChangeText={setNewLimit}
                    
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={saveBudgetChange}>
                      <Text style={styles.modalButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  },
  
 modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  width: wp('80%'),
  backgroundColor: 'rgba(0.5, 0, 0, 0.9)',
  padding: wp('5%'),
  borderRadius: 10,
},
modalTitle: {
  fontSize: wp('5%'),
  fontWeight: 'bold',
  marginBottom: hp('2%'),
  color: COLORS.text.primary,
},
modalLabel: {
  fontSize: wp('4%'),
  marginBottom: hp('1%'),
  color: COLORS.text.primary,
},
modalInput: {
  borderWidth: 1,
  borderColor: COLORS.text.secondary,
  padding: wp('2%'),
  borderRadius: 5,
  marginBottom: hp('2%'),
  color: COLORS.text.primary,
},
modalButtons: {
  flexDirection: 'row',
  gap: wp('2%'),
  justifyContent: 'center',
},
modalButton: {
  padding: wp('2%'),
  backgroundColor: COLORS.primary,
  borderRadius: 5,
},
modalButtonText: {
  color: COLORS.text.secondary,
  fontSize: wp('4%'),
},
editButton: {
  marginTop: hp('1%'),
  flexDirection: 'row',
  alignItems: 'center',
  padding: wp('1%'),
  paddingBottom: hp('1%'),
 
},
editButtonText: {
  marginLeft: wp('1%'),
  color: COLORS.text.primary,
},

});

export default BudgetsScreen;