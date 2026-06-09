import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, NAVIGATION_ROUTES } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Animate the progress bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['20%', '80%'],
  });

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
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
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
    width: 160,
    height: 160,
    backgroundColor: COLORS.WHITE,
    borderRadius: 28,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  logo: {
    width: 132,
    height: 132,
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
