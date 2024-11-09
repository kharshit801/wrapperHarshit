import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Animated, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalProvider } from '../components/globalProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/language/i18config';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { COLORS } from '../constants';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const slideAnim = new Animated.Value(0);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        await SplashScreen.hideAsync();

        // Start slide-up animation
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(async () => {
          setShowSplash(false);
          if (hasLaunched === null) {
            // First launch - route to index
            await AsyncStorage.setItem('hasLaunched', 'true');
            router.replace('index');
          } else {
            // Not first launch - route directly to drawer
            router.replace('(drawer)');
          }
        });
      } catch (error) {
        console.error('Error checking first launch:', error);
        await SplashScreen.hideAsync();
        setShowSplash(false);
      }
    };

    if (loaded) {
      checkFirstLaunch();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <GlobalProvider>
        <GestureHandlerRootView style={styles.container}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {showSplash ? (
              <Animated.View
                style={[
                  styles.splashContainer,
                  {
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -hp('100%')],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.splashContent}>
                  <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.splashImage}
                  />
                </View>
              </Animated.View>
            ) : null}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ gestureEnabled: true }} />
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </GlobalProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 1,
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: wp('50%'),
    height: wp('50%'),
    resizeMode: 'contain',
  },
});