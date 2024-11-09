import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignup = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://172.29.49.198:8001/user/signup', {
        username,
        password
      });

      // Store user data securely
      await SecureStore.setItemAsync('userData', JSON.stringify({
        userId: response.data.userId,
        username: response.data.username,
        token: response.data.token
      }));

      setQrCode(response.data.qrCode);
      setShowQR(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Signup Failed',
        error.response?.data?.message || 'Please try again later'
      );
    }
  };

  const handleContinue = () => {
    setShowQR(false);
    router.replace('(drawer)');
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={[styles.input, { marginTop: hp(3), color: COLORS.text.primary }]}
            placeholder="Enter username"
            placeholderTextColor={COLORS.text.secondary}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.input, { marginTop: hp(2), color: COLORS.text.primary }]}
            placeholder="Enter password"
            placeholderTextColor={COLORS.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Modal visible={showQR} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Your Backup QR Code</Text>
              <Text style={styles.modalSubtitle}>
                Save this QR code to share your data with other devices
              </Text>
              {qrCode && (
                <Image
                  source={{ uri: qrCode }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logo: {
    width: wp('72%'),
    height: wp('30%'),
    resizeMode: 'contain',
    marginBottom: hp('3%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: hp('3%'),
  },
  input: {
    width: wp('80%'),
    height: hp('6%'),
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    marginVertical: hp('1.5%'),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    padding: wp(5),
    borderRadius: wp(3),
    alignItems: 'center',
    width: wp(90),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: hp(1),
  },
  modalSubtitle: {
    fontSize: wp(3.5),
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  qrCode: {
    width: wp(60),
    height: wp(60),
    marginBottom: hp(2),
  },
});

export default Signup;
