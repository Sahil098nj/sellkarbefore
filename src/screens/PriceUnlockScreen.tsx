import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLiveWarrantyPricesQuery, useLiveLaptopPricesQuery, useSyncLeadQuoteMutation } from '../api';
import { calculateFinalPrice, calculateLaptopPrice, type ConditionData, type LaptopConditionData } from '../utils/priceCalculation';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store';

type PriceUnlockScreenRouteProp = RouteProp<RootStackParamList, 'PriceUnlock'>;

const PriceUnlockScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<PriceUnlockScreenRouteProp>();
  const { variant, conditionData, accessoriesData, questions, city, modelName, brandName, category } = route.params ?? {};
  const user = useAuthStore((state) => state.user);
  const setLeadId = useAuthStore((state) => state.setLeadId);
  const syncLeadQuoteMutation = useSyncLeadQuoteMutation();

  const isLaptop = category === 'laptop';
  
  // ── Fetch appropriate pricing based on device category ────────────────────
  const { data: warrantyPrices, isLoading: phoneRulesLoading } = useLiveWarrantyPricesQuery(variant?.id ?? null);
  const { data: laptopPrices, isLoading: laptopRulesLoading } = useLiveLaptopPricesQuery(variant?.id ?? null);
  
  const rulesLoading = isLaptop ? laptopRulesLoading : phoneRulesLoading;
  const pricingData = isLaptop ? laptopPrices : warrantyPrices;

  // ── Calculate final price based on device type ────────────────────────────
  const finalPrice = useMemo(() => {
    if (rulesLoading || !pricingData) return 0;

    if (isLaptop) {
      // Laptop pricing: uses age-based base price + condition deductions
      const laptopPayload: LaptopConditionData = {
        ageGroup: conditionData?.deviceAge as 'less_than_1yr' | '1_to_3yrs' | 'more_than_3yrs',
        overallCondition: conditionData?.overallCondition as 'good' | 'average' | 'below-average',
        hasCharger: (accessoriesData ?? []).includes('charger'),
        hasBox: (accessoriesData ?? []).includes('box'),
        hasBill: (accessoriesData ?? []).includes('bill'),
      };
      return calculateLaptopPrice(pricingData as any, laptopPayload);
    } else {
      // Phone/iPad pricing: uses warranty_prices with detailed deductions
      const isAppleDevice = (brandName ?? '').toLowerCase().includes('apple') || (modelName ?? '').toLowerCase().includes('iphone');
      const payload: ConditionData = {
        ageGroup: conditionData?.deviceAge,
        overallCondition: conditionData?.overallCondition,
        canMakeCalls: questions?.canCall,
        isTouchWorking: questions?.touchOk,
        isScreenOriginal: questions?.screenOriginal,
        isBatteryHealthy: questions?.batteryOk,
        hasCharger: (accessoriesData ?? []).includes('charger'),
        hasBox: (accessoriesData ?? []).includes('box'),
        hasBill: (accessoriesData ?? []).includes('bill'),
        isAppleDevice,
      };
      return calculateFinalPrice(pricingData as any, payload);
    }
  }, [rulesLoading, pricingData, isLaptop, conditionData, accessoriesData, questions, brandName, modelName]);

  const startPrice = finalPrice > 0 ? Math.floor((finalPrice - 800) / 100) * 100 : 0;

  const [displayPrice, setDisplayPrice] = useState(0);
  const [priceAnimDone, setPriceAnimDone] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const lockScale = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;
  const syncedLeadRef = useRef(false);

  useEffect(() => {
    // Entry animations (run once on mount)
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(iconScale, { toValue: 1, duration: 360, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();
  }, [fade, slideY, iconScale]);

  useEffect(() => {
    // Wait for final price to be computed from live DB rules
    if (rulesLoading || finalPrice === 0) return;

    priceAnim.setValue(startPrice);
    setDisplayPrice(startPrice);
    setPriceAnimDone(false);

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
  }, [rulesLoading, finalPrice, startPrice, priceAnim, lockScale, buttonFade]);

  useEffect(() => {
    // Skip if loading or no price yet
    if (rulesLoading || finalPrice <= 0 || syncedLeadRef.current) {
      return;
    }

    // If user is not authenticated, we cannot create a properly queryable lead
    // Require authentication before syncing lead
    if (!user?.phone) {
      console.log('[PriceUnlock] Cannot sync lead: user not authenticated');
      return;
    }

    syncedLeadRef.current = true;

    console.log('[PriceUnlock] Syncing lead - phone:', user.phone, 'leadId:', user.leadId);

    syncLeadQuoteMutation
      .mutateAsync({
        leadId: user.leadId,
        phoneNumber: user.phone,
        customerName: user.name,
        city,
        variantId: variant?.id,
        deviceId: variant?.device_id,
        brandName,
        finalPrice,
        deviceInterest: variant?.model_name ?? modelName,
      })
      .then((result: { updated: boolean; leadId: string | null }) => {
        console.log('[PriceUnlock] Lead sync result:', result);
        if (result?.leadId && result.leadId !== user.leadId) {
          setLeadId(result.leadId);
        }
      })
      .catch((error: unknown) => {
        console.error('[lead-sync] Price unlock quote sync failed:', error);
        // Allow retry on next render cycle if network failed.
        syncedLeadRef.current = false;
      });
  }, [
    rulesLoading,
    finalPrice,
    user,
    city,
    variant?.id,
    variant?.device_id,
    variant?.model_name,
    brandName,
    modelName,
    setLeadId,
    syncLeadQuoteMutation,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.backHeader}>
        <Pressable onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} style={styles.backBtn}>
          <MaterialCommunityIcons name="close" size={22} color="#64748B" />
        </Pressable>
      </View>

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
          {rulesLoading ? (
            <Text style={styles.metaText}>Fetching live pricing…</Text>
          ) : (
            <Text style={styles.metaText} numberOfLines={1}>
              Variant: {variant?.id?.slice(0, 8) ?? '—'} | Age: {conditionData?.deviceAge ?? '—'} | Condition: {conditionData?.overallCondition ?? '—'} | Accessories: {(accessoriesData?.length ?? 0)} added
            </Text>
          )}
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
              city,
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
    paddingBottom: 18,
  },
  backHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
