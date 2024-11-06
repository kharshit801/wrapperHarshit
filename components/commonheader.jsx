import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function Header({seachIconShown}) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={false} backgroundColor={COLORS.background} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={wp('6%')} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        {seachIconShown == true ?  <TouchableOpacity onPress ={() => Alert.alert("Search")} style={styles.searchButton}>
          <Ionicons name="search" size={wp('6%')} color={  COLORS.text.primary} />
        </TouchableOpacity> : <View/>}
       
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
  
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent:'auto',
    gap:wp("26%"),
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: COLORS.background,
  },
  logo: {
    width: wp('20%'),
    height: wp('8%'),
  },
  menuButton: {
    padding: wp('2%'),
  },
  searchButton: {
    padding: wp('2%'),
  },
});
