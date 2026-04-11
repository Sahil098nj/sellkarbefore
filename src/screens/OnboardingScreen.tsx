import React from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, NAVIGATION_ROUTES } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(14)).current;
  const idleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = React.useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const goHome = React.useCallback(() => {
    clearIdleTimer();
    navigation.navigate('Home');
  }, [clearIdleTimer, navigation]);

  const resetIdleTimer = React.useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => {
      navigation.navigate('Home');
    }, 3000);
  }, [clearIdleTimer, navigation]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    resetIdleTimer();

    return () => {
      clearIdleTimer();
    };
  }, [clearIdleTimer, fade, resetIdleTimer, slide]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../sellkar-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable
          onPress={goHome}
          onPressIn={resetIdleTimer}
        >
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.hero, { opacity: fade, transform: [{ translateY: slide }] }]}> 
        <View style={styles.heroGlow} />
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMs-1yORsIi4D0utyGIMTUfzT7VlodQlJg2LvNNCyDxw06kwoSrDQ6seNTrOE7mS36MBwCx8vIFErgS-g5rUvJcRJ5UpnLd-LeFsary4PqG9Zkkil07dLrhuH8kJfyYFyAXweYFFMcS3j2oGcgTHY9Oc2KU6cPj9zanEvSnMrgW_465sbuR2DdFJYDJvx-k2F36H4HAwYz0t1A8zwiGUbVGHlrymXnR-eqtI0PBFcxsI6FaOB3d-39mQ7exkAp6JSdNyQwkn4RObY',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroTagLeft}>
          <Text style={styles.heroTagText}>Verified</Text>
        </View>
        <View style={styles.heroTagRight}>
          <Text style={styles.heroTagText}>₹</Text>
        </View>
      </Animated.View>

      <View style={styles.content}>
        <Text style={styles.title}>Sell your device in{`\n`}3 easy steps</Text>
        <Text style={styles.subtitle}>
          Get the best market value for your old smartphone, laptop, or tablet in
          minutes. Transparent, fast, and secure.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progress}>
          <View style={styles.progressActive} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Pressable
          style={styles.nextButton}
          onPress={goHome}
          onPressIn={resetIdleTimer}
        >
          <Text style={styles.nextText}>Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  logo: {
    width: 80,
    height: 34,
    alignSelf: 'flex-start',
  },
  skip: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  hero: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E0ECFF',
    opacity: 0.6,
  },
  heroImage: {
    width: 250,
    height: 250,
    borderRadius: 40,
  },
  heroTagLeft: {
    position: 'absolute',
    bottom: 18,
    left: 6,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  heroTagRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  heroTagText: {
    color: COLORS.WHITE,
    fontWeight: '700',
  },
  content: {
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.BLACK,
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.GRAY_DARK,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
    gap: 18,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressActive: {
    width: 36,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.PRIMARY,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  nextButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
