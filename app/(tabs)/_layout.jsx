import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.secondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.lightbackground,
          borderTopWidth: 1,
          paddingBottom: hp('1%'),
          height: hp('7.5%')
        },
        tabBarLabelStyle: {
          fontSize: wp('3%'),
          marginTop: 0,
          paddingBottom: hp('0.5%')
        },
        tabBarInactiveTintColor: COLORS.text.secondary,
        safeAreaInsets: { bottom: true },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={wp('6%')} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color }) => (
            <Ionicons name="pie-chart" size={wp('6%')} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={wp('6%')} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={wp('6%')} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => (
            <Ionicons name="pricetags" size={wp('6%')} color={color} />
          ),
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}