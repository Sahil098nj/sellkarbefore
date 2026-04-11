import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, NAVIGATION_ROUTES } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}> 
        <View style={styles.logoWrap}>
          <Image
            source={require('../../sellkar-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>SellkarIndia</Text>
        <Text style={styles.subtitle}>Premium Device Buyback</Text>
      </Animated.View>
      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.footerText}>Secure & Reliable</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.12,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.SECONDARY,
    opacity: 0.14,
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  logoWrap: {
    backgroundColor: COLORS.WHITE,
    padding: 8,
    borderRadius: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 12,
  },
  logo: {
    width: 138,
    height: 138,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.GRAY_DARK,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    width: 120,
    height: 4,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
});

export default SplashScreen;
