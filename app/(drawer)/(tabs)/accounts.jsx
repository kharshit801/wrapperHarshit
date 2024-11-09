// AccountsScreen.jsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { 
  widthPercentageToDP as wp, 
  heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/commonheader';
import { useGlobalContext } from '../../../components/globalProvider';
import { useTranslation } from 'react-i18next';

const AccountsScreen = () => {
  const navigation = useNavigation();
  const { fetchExpenses, state, convertAmount } = useGlobalContext();
  const { defaultCurrency, currencies } = state;
  const currencySymbol = currencies[defaultCurrency]?.symbol || defaultCurrency;
  const [accountBalances, setAccountBalances] = useState({
    Card: 0,
    Cash: 0,
    Savings: 0
  });
  const [summary, setSummary] = useState({
    totalExpense: 0,
    totalIncome: 0
  });
  const { t } = useTranslation();

  useEffect(() => {
    loadAccountData();
  }, [state.transactions, defaultCurrency]);

  const loadAccountData = async () => {
    try {
      const transactions = await fetchExpenses();
      
      // Initialize balances for each account
      const balances = {
        Card: 0,
        Cash: 0,
        Savings: 0
      };
      
      let totalExpense = 0;
      let totalIncome = 0;

      transactions.forEach(transaction => {
        const originalAmount = parseFloat(transaction.amount);
        const amount = convertAmount(originalAmount, transaction.currency, defaultCurrency);
        const account = transaction.account || 'Cash'; // Default to Cash if no account specified

        if (transaction.type === 'EXPENSE') {
          balances[account] -= amount;
          totalExpense += amount;
        } else if (transaction.type === 'INCOME') {
          balances[account] += amount;
          totalIncome += amount;
        } else if (transaction.type === 'TRANSFER') {
          // Handle transfers between accounts
          const [fromAccount, toAccount] = transaction.note.split(' to ');
          if (fromAccount && toAccount) {
            const convertedAmount = amount; // Assuming the amount is already converted
            balances[fromAccount] -= convertedAmount;
            balances[toAccount] += convertedAmount;
          }
        }
      });

      setAccountBalances(balances);
      setSummary({
        totalExpense,
        totalIncome
      });
    } catch (error) {
      console.error(t('errorLoadingAccountData'), error);
    }
  };

  const accounts = [
    { id: 1, type: 'Card', balance: accountBalances.Card, icon: 'card-outline' },
    { id: 2, type: 'Cash', balance: accountBalances.Cash, icon: 'cash-outline' },
    { id: 3, type: 'Savings', balance: accountBalances.Savings, icon: 'wallet-outline' }
  ];

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const handleAddAccount = () => {
    // Navigate to add account screen or show modal
    // navigation.navigate('AddAccount');
    console.log(t('addAccountPressed'));
  };

  const handleAccountPress = (account) => {
    // Navigate to account details screen
    // navigation.navigate('AccountDetails', { account });
    console.log(t('accountPressed', { account: account.type }));
  };

  const renderAccountCard = (account) => (
    <TouchableOpacity 
      key={account.id} 
      style={styles.accountCard}
      onPress={() => handleAccountPress(account)}
    >
      <View style={styles.accountInfo}>
        <View style={styles.accountIconContainer}>
          <Ionicons name={account.icon} size={wp('6%')} color={COLORS.text.primary} />
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountType}>{t(account.type)}</Text>
          <Text style={[
            styles.accountBalance,
            { color: account.balance >= 0 ? '#51cf66' : '#ff6b6b' }
          ]}>
            {currencySymbol}{account.balance.toFixed(2)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.accountMenu}>
        <Ionicons name="ellipsis-horizontal" size={wp('6%')} color={COLORS.text.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header searchIconShown={false}/>
      <ScrollView style={styles.content}>
        <View style={styles.totalBalance}>
          <Text style={styles.totalBalanceLabel}>{t('All Accounts')}</Text>
          <Text style={[
            styles.totalBalanceAmount,
            { color: totalBalance >= 0 ? '#51cf66' : '#ff6b6b' }
          ]}>
            {currencySymbol}{totalBalance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('Expense Amount')}</Text>
            <Text style={[styles.summaryAmount, { color: '#ff6b6b' }]}>
              {currencySymbol}{summary.totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('Income Amount')}</Text>
            <Text style={[styles.summaryAmount, { color: '#51cf66' }]}>
              {currencySymbol}{summary.totalIncome.toFixed(2)}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>{t('accounts')}</Text>
        <View style={styles.accountsList}>
          {accounts.map(renderAccountCard)}
          <TouchableOpacity 
            style={styles.addAccountButton}
            onPress={handleAddAccount}
          >
            <Ionicons name="add-circle-outline" size={wp('6%')} color={COLORS.text.primary} />
            <Text style={styles.addAccountText}>{t('ADD NEW ACCOUNT')}</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '500',
    color: COLORS.text.primary,
    padding: wp('4%'),
    paddingBottom: wp('2%')
  },
  accountsList: {
    padding: wp('4%')
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginBottom: wp('3%')
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  accountIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%')
  },
  accountDetails: {
    justifyContent: 'center'
  },
  accountType: {
    fontSize: wp('4.5%'),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: hp('0.5%')
  },
  accountBalance: {
    fontSize: wp('4%'),
    fontWeight: '500'
  },
  accountMenu: {
    padding: wp('2%')
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp('3%'),
    marginTop: wp('2%')
  },
  addAccountText: {
    color: COLORS.text.primary,
    fontSize: wp('4%'),
    fontWeight: '500',
    marginLeft: wp('2%')
  },
});

export default AccountsScreen;
