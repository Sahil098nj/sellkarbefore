import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type PriceUnlockScreenRouteProp = RouteProp<RootStackParamList, 'PriceUnlock'>;

const PriceUnlockScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<PriceUnlockScreenRouteProp>();
  const { variant, conditionData, accessoriesData } = route.params;

  const finalPrice = variant?.base_price ? Math.round(variant.base_price * 1.12) : 41200;
  const startPrice = Math.floor((finalPrice - 800) / 100) * 100;

  const [displayPrice, setDisplayPrice] = useState(startPrice);
  const [priceAnimDone, setPriceAnimDone] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const lockScale = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(startPrice)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(iconScale, { toValue: 1, duration: 360, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();

    // Price counter animation after short delay
    const listenerId = priceAnim.addListener(({ value }) => {
      setDisplayPrice(Math.round(value));
    });

    const timer = setTimeout(() => {
      Animated.timing(priceAnim, {
        toValue: finalPrice,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayPrice(finalPrice);
          setPriceAnimDone(true);
          // Animate lock icon and button in
          Animated.parallel([
            Animated.spring(lockScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
            Animated.timing(buttonFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]).start();
        }
        priceAnim.removeListener(listenerId);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      priceAnim.removeListener(listenerId);
    };
  }, [fade, slideY, iconScale, priceAnim, lockScale, buttonFade, finalPrice]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: slideY }] }]}>
        <Animated.View style={[styles.successWrap, { transform: [{ scale: iconScale }] }]}>
          <View style={styles.successInner}>
            <Text style={styles.successTick}>✓</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>Price Unlocked!</Text>
        <Text style={styles.subtitle}>Your device valuation is complete.</Text>

        <View style={styles.priceCard}>
          <View style={styles.priceTopLine} />
          <Text style={styles.priceLabelFinal}>YOUR BUYBACK PRICE</Text>
          <Text style={styles.priceValue}>
            ₹{displayPrice.toLocaleString('en-IN')}
          </Text>
          {priceAnimDone ? (
            <Animated.View style={[styles.lockedRow, { transform: [{ scale: lockScale }] }]}>
              <MaterialCommunityIcons name="lock-check" size={16} color="#16A34A" />
              <Text style={styles.lockedText}>Price Locked</Text>
            </Animated.View>
          ) : (
            <View style={styles.countingRow}>
              <MaterialCommunityIcons name="chart-line" size={14} color="#64748B" />
              <Text style={styles.countingText}>Calculating best value…</Text>
            </View>
          )}
          <Text style={styles.priceNote}>Valid for 7 days</Text>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureCardLeft}>
            <MaterialCommunityIcons name="truck-fast-outline" size={18} color="#0F4FA8" />
            <Text style={styles.featureTextLeft}>Free Pickup</Text>
          </View>
          <View style={styles.featureCardRight}>
            <MaterialCommunityIcons name="shield-check-outline" size={18} color="#9333EA" />
            <Text style={styles.featureTextRight}>Secure Pay</Text>
          </View>
        </View>

        <View style={styles.metaBox}>
          <Text style={styles.metaText} numberOfLines={1}>
            Condition: {conditionData?.overallCondition ?? 'good'} | Accessories: {(accessoriesData?.length ?? 0)} selected
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: buttonFade }}>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.nextButton,
            !priceAnimDone && styles.nextButtonDisabled,
            pressed && priceAnimDone ? styles.nextButtonPressed : null,
          ]}
          disabled={!priceAnimDone}
          onPress={() =>
            navigation.navigate('AddressPickup', {
              variant,
              finalPrice,
              conditionData,
              accessoriesData,
            })
          }
        >
          <Text style={styles.nextText}>Schedule Free Pickup</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF2F7',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  body: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  successWrap: {
    alignSelf: 'center',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#D8F5E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  successInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTick: {
    color: '#16A34A',
    fontSize: 20,
    fontWeight: '900',
    marginTop: -1,
  },
  title: {
    marginTop: 18,
    fontSize: 38,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    color: '#64748B',
    textAlign: 'center',
    fontSize: 15,
  },
  priceCard: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: '#F3F6FB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    paddingVertical: 16,
    overflow: 'hidden',
  },
  priceTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#BFD4F8',
  },
  priceLabelFinal: {
    marginTop: 6,
    fontSize: 11,
    color: '#91A4BF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  priceValue: {
    marginTop: 6,
    fontSize: 52,
    fontWeight: '900',
    color: '#0F4FA8',
    letterSpacing: -0.8,
  },
  lockedRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  lockedText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 13,
  },
  countingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  countingText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  priceNote: {
    marginTop: 6,
    fontSize: 12,
    color: '#7B8DAA',
    fontWeight: '600',
  },
  featureRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  featureCardLeft: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    paddingVertical: 14,
  },
  featureCardRight: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F5ECFF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'center',
    paddingVertical: 14,
  },
  featureTextLeft: {
    marginTop: 6,
    color: '#0F4FA8',
    fontWeight: '700',
    fontSize: 13,
  },
  featureTextRight: {
    marginTop: 6,
    color: '#9333EA',
    fontWeight: '700',
    fontSize: 13,
  },
  metaBox: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 14,
    backgroundColor: '#0F4FA8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0F4FA8',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  nextButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  nextText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default PriceUnlockScreen;
