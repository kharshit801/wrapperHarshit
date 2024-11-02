import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Modal, TextInput, Alert 
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../../../components/commonheader';
import { useGlobalContext } from '../../../components/globalProvider';
import { useTranslation } from 'react-i18next';

const iconMap = {
  'Salary': 'money-check-alt',
  'Freelancing': 'laptop-code',
  'Rental Income': 'home',
  'Investment': 'chart-line',
  'Grocery': 'shopping-basket',
  'Entertainment': 'film',
  'Transport': 'bus-alt',
  'Healthcare': 'heartbeat',
  'Utilities': 'lightbulb',
  'Shopping': 'shopping-cart',
};

const getCategoryIcon = (category) => {
  return iconMap[category] || 'tag';
};

const CategoryScreen = () => {
  const { state, dispatch } = useGlobalContext();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    title: '',
    icon: 'tag',
    type: 'EXPENSE'
  });


  const getCategoryColor = (type) => {
    return type === 'INCOME' ? '#51cf66' : '#ff6b6b';
  };


  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    
    // Add categories from transactions
    state.transactions.forEach(transaction => {
      uniqueCategories.add(transaction.category);
    });
    
    // Add categories from state.categories
    if (state.categories) {
      state.categories.forEach(category => {
        uniqueCategories.add(category.title);
      });
    }

    const categoryData = Array.from(uniqueCategories).map(categoryTitle => {
      const categoryTransactions = state.transactions.filter(t => t.category === categoryTitle);
      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const type = categoryTransactions[0]?.type || 
                   (state.categories?.find(c => c.title === categoryTitle)?.type) || 
                   'EXPENSE';
      
      return {
        id: categoryTitle.toLowerCase().replace(/\s+/g, '-'),
        title: categoryTitle,
        icon: getCategoryIcon(categoryTitle),
        type,
        amount,
        transactions: categoryTransactions.length
      };
    });

    return categoryData;
  }, [state.transactions, state.categories]);

  // Calculate totals using useMemo
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    const income = categories
      .filter(cat => cat.type === 'INCOME')
      .reduce((sum, cat) => sum + cat.amount, 0);
    
    const expense = categories
      .filter(cat => cat.type === 'EXPENSE')
      .reduce((sum, cat) => sum + cat.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense
    };
  }, [categories]);

  // Optimized add category handler
  const handleAddCategory = useCallback(() => {
    if (!newCategory.title.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      const payload = {
        ...newCategory,
        id: newCategory.title.toLowerCase().replace(/\s+/g, '-'),
        icon: getCategoryIcon(newCategory.title)
      };

      // Check for duplicate category
      const categoryExists = categories.some(
        cat => cat.title.toLowerCase() === newCategory.title.toLowerCase()
      );

      if (categoryExists) {
        Alert.alert('Error', 'Category already exists');
        return;
      }

      dispatch({ 
        type: editingCategory ? 'UPDATE_CATEGORY' : 'ADD_CATEGORY', 
        payload 
      });

      setModalVisible(false);
      setEditingCategory(null);
      setNewCategory({ title: '', icon: 'tag', type: 'EXPENSE' });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [newCategory, editingCategory, categories, dispatch]);

  const handleDeleteCategory = useCallback((category) => {
    console.log("Category", category);
    const hasTransactions = state.transactions.some(
      t => t.category.toLowerCase() === category.title.toLowerCase()
    );
    if (hasTransactions) {
      Alert.alert(
        'Cannot Delete Category',
        'This category has existing transactions. Please delete those transactions first.'
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => dispatch({ type: 'DELETE_CATEGORY', payload: category.id }),
          style: 'destructive'
        }
      ]
    );
  }, [state.transactions, dispatch]);

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      title: category.title,
      icon: category.icon,
      type: category.type
    });
    setModalVisible(true);
  };

  const renderCategoryItem = (category) => (
    <TouchableOpacity 
      key={category.id} 
      style={styles.categoryCard}
      onLongPress={() => handleEditCategory(category)}
    >
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIconContainer, { borderColor: getCategoryColor(category.type) }]}>
          <FontAwesome5 name={category.icon} size={wp('6%')} color={COLORS.text.primary} />
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.categoryStats}>
            <Text style={[styles.categoryAmount, { color: getCategoryColor(category.type) }]}>
              {category.type === 'INCOME' ? '+' : '-'}₹{category.amount.toLocaleString()}
            </Text>
            <Text style={styles.transactionCount}>
              {category.transactions} {category.transactions === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.categoryMenu}
        onPress={() => handleDeleteCategory(category.id)}
      >
        <Ionicons name="trash-outline" size={wp('5%')} color={COLORS.text.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setModalVisible(false);
        setEditingCategory(null);
        setNewCategory({ title: '', icon: 'tag', type: 'EXPENSE' });
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Category Name"
            value={newCategory.title}
            onChangeText={(text) => setNewCategory({ ...newCategory, title: text })}
          />

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newCategory.type === 'INCOME' && styles.selectedType
              ]}
              onPress={() => setNewCategory({ ...newCategory, type: 'INCOME' })}
            >
              <Text style={styles.typeText}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newCategory.type === 'EXPENSE' && styles.selectedType
              ]}
              onPress={() => setNewCategory({ ...newCategory, type: 'EXPENSE' })}
            >
              <Text style={styles.typeText}>Expense</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setModalVisible(false);
                setEditingCategory(null);
                setNewCategory({ title: '', icon: 'tag', type: 'EXPENSE' });
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddCategory}
            >
              <Text style={styles.buttonText}>
                {editingCategory ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setNewCategory({ title: '', icon: 'tag', type: 'INCOME' });
                setModalVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryList}>
            {categories
              .filter(cat => cat.type === 'INCOME')
              .map(renderCategoryItem)
            }
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setNewCategory({ title: '', icon: 'tag', type: 'EXPENSE' });
                setModalVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryList}>
            {categories
              .filter(cat => cat.type === 'EXPENSE')
              .map(renderCategoryItem)
            }
          </View>
        </View>
      </ScrollView>
      {renderCategoryModal()}
    </SafeAreaView>
  );
};const additionalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: wp('4%')
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: wp('4%'),
    padding: wp('6%'),
    width: '90%'
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: hp('2%'),
    textAlign: 'center'
  },
  input: {
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginBottom: hp('2%'),
    color: COLORS.text.primary
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: hp('2%')
  },
  typeButton: {
    flex: 1,
    padding: wp('3%'),
    borderRadius: wp('2%'),
    marginHorizontal: wp('1%'),
    backgroundColor: COLORS.lightbackground,
    alignItems: 'center'
  },
  selectedType: {
    backgroundColor: COLORS.primary
  },
  typeText: {
    color: COLORS.text.primary
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    padding: wp('3%'),
    borderRadius: wp('2%'),
    marginHorizontal: wp('1%'),
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: COLORS.lightbackground
  },
  saveButton: {
    backgroundColor: COLORS.primary
  },
  buttonText: {
    color: COLORS.text.primary,
    fontWeight: '500'
  },
  ...additionalStyles

});


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