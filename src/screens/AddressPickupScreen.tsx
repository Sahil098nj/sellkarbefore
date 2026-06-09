import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCreatePickupMutation } from '../api';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type AddressPickupScreenRouteProp = RouteProp<RootStackParamList, 'AddressPickup'>;

const timeSlots = [
  '10:00 AM - 01:00 PM',
  '01:00 PM - 04:00 PM',
  '04:00 PM - 07:00 PM',
  '07:00 PM - 09:00 PM',
];

const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' });
const weekFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

const AddressPickupScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<AddressPickupScreenRouteProp>();
  const { user, setLeadId } = useAuthStore();
  const createPickupMutation = useCreatePickupMutation();
  const dateSlots = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }).map((_, index) => {
      const current = new Date(today);
      current.setDate(today.getDate() + index);
      return {
        id: `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`,
        month: monthFmt.format(current).toUpperCase(),
        day: String(current.getDate()),
        week: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : weekFmt.format(current),
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(dateSlots[0].id);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [houseStreet, setHouseStreet] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');

  const quote = route.params?.finalPrice ?? (route.params?.variant?.base_price ? Math.round(route.params.variant.base_price * 1.12) : 41200);
  const modelName = useMemo(() => route.params?.variant?.model_name ?? 'iPhone 14 Pro', [route.params?.variant?.model_name]);
  const storage = useMemo(() => route.params?.variant?.storage_gb ? `${route.params.variant.storage_gb} GB` : '128 GB', [route.params?.variant?.storage_gb]);
  const addressCity = route.params?.city?.trim() ? route.params.city : 'Bengaluru';

  const handleConfirm = async () => {
    if (!houseStreet.trim() || !area.trim() || !pincode.trim()) {
      Alert.alert('Address Required', 'Please fill in all address fields before confirming.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Login required', 'Please verify your phone number before confirming pickup.');
      return;
    }

    if (!route.params?.variant?.id || !route.params?.variant?.device_id) {
      Alert.alert('Unable to confirm order', 'Selected device information is incomplete. Please reselect your model and try again.');
      return;
    }

    const fullAddress = `${houseStreet.trim()}, ${area.trim()}, ${addressCity} - ${pincode.trim()}`;
    const selectedDateItem = dateSlots.find((item) => item.id === selectedDate) ?? dateSlots[0];

    try {
      const pickup = await createPickupMutation.mutateAsync({
        customerId: user.id,
        leadId: user.leadId,
        userPhone: user.phone,
        customerName: user.name,
        deviceId: route.params.variant.device_id,
        variantId: route.params.variant.id,
        deviceName: modelName,
        deviceVariant: storage,
        conditionAnswers: {
          conditionData: route.params?.conditionData ?? null,
          accessoriesData: route.params?.accessoriesData ?? [],
          pickupDateLabel: selectedDateItem.week,
          pickupTime: selectedTime,
        },
        priceFinal: quote,
        pickupAddress: fullAddress,
        pincode: pincode.trim(),
        pickupDate: selectedDate,
        pickupTime: selectedTime,
        city: addressCity,
        status: 'scheduled',
      });

      setLeadId(null);
      queryClient.invalidateQueries({ queryKey: ['orders-history', user.id] });

      navigation.navigate('TrackOrder', {
        orderId: pickup.id,
        status: pickup.status,
        variant: route.params?.variant,
        finalPrice: quote,
        pickupDateLabel: selectedDateItem.week,
        pickupTime: selectedTime,
        city: addressCity,
        address: fullAddress,
      });
    } catch (e) {
      Alert.alert(
        'Unable to confirm order',
        e instanceof Error ? e.message : 'Please try again in a moment.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#1E293B" />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Schedule Pickup</Text>
              <Text style={styles.headerSubtitle}>Final step - confirm your booking</Text>
            </View>
            <Pressable style={styles.helpButton}>
              <MaterialCommunityIcons name="head-question" size={22} color="#64748B" />
            </Pressable>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressStep}>7/8</Text>
          </View>

          {/* Device Summary Card */}
          <View style={styles.deviceCard}>
            <View style={styles.deviceIconWrap}>
              <MaterialCommunityIcons name="cellphone" size={24} color="#0F4FA8" />
            </View>
            <View style={styles.deviceDetails}>
              <Text style={styles.deviceName}>{modelName}</Text>
              <Text style={styles.deviceStorage}>{storage}</Text>
            </View>
            <View style={styles.priceBadge}>
              <MaterialCommunityIcons name="currency-inr" size={14} color="#16A34A" />
              <Text style={styles.priceValue}>{quote.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="map-marker-radius" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.floatingLabel}>House / Flat & Street</Text>
              <TextInput
                style={styles.floatingInput}
                placeholder="e.g. 402, Sunshine Heights, 12th Main"
                placeholderTextColor="#94A3B8"
                value={houseStreet}
                onChangeText={setHouseStreet}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputGroup}>
              <Text style={styles.floatingLabel}>Area / Landmark</Text>
              <TextInput
                style={styles.floatingInput}
                placeholder="e.g. Indiranagar, near metro station"
                placeholderTextColor="#94A3B8"
                value={area}
                onChangeText={setArea}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.rowInputs}>
              <View style={styles.inputGroupSm}>
                <Text style={styles.floatingLabel}>Pincode</Text>
                <TextInput
                  style={styles.floatingInput}
                  placeholder="560038"
                  placeholderTextColor="#94A3B8"
                  value={pincode}
                  onChangeText={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.inputGroupSm}>
                <Text style={styles.floatingLabel}>City</Text>
                <Text style={styles.readOnlyValue}>{addressCity}</Text>
              </View>
            </View>
          </View>

          {/* Date Selection Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="calendar-check" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {dateSlots.slice(0, 14).map((item) => {
              const isActive = selectedDate === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.dateCard,
                    isActive && styles.dateCardActive,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => setSelectedDate(item.id)}
                >
                  {isActive && (
                    <View style={styles.selectedCheck}>
                      <MaterialCommunityIcons name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                  <Text style={[styles.dateMonth, isActive && styles.dateMonthActive]}>{item.month}</Text>
                  <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>{item.day}</Text>
                  <Text style={[styles.dateWeek, isActive && styles.dateWeekActive]}>{item.week}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Time Selection Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
          </View>

          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => {
              const isActive = selectedTime === slot;
              return (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [
                    styles.timeCard,
                    isActive && styles.timeCardActive,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                    {isActive && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.timeText, isActive && styles.timeTextActive]}>{slot}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustBadge}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
              <Text style={styles.trustText}>Secure Payment</Text>
            </View>
            <View style={styles.trustBadge}>
              <MaterialCommunityIcons name="truck-check" size={16} color="#0F4FA8" />
              <Text style={styles.trustText}>Free Pickup</Text>
            </View>
            <View style={styles.trustBadge}>
              <MaterialCommunityIcons name="star-check" size={16} color="#F59E0B" />
              <Text style={styles.trustText}>Best Price</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information-outline" size={18} color="#0F4FA8" />
            <Text style={styles.infoText}>
              Device inspection happens at your doorstep. Payment is transferred instantly after verification.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            <Text style={styles.bottomLabel}>YOUR QUOTE</Text>
            <View style={styles.priceRow}>
              <MaterialCommunityIcons name="currency-inr" size={20} color="#0F172A" />
              <Text style={styles.bottomPrice}>{quote.toLocaleString('en-IN')}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.confirmButtonPressed,
              createPickupMutation.isPending && styles.confirmButtonLoading,
            ]}
            disabled={createPickupMutation.isPending}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>
              {createPickupMutation.isPending ? 'Scheduling...' : 'Confirm Pickup'}
            </Text>
            {!createPickupMutation.isPending && (
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" style={styles.confirmArrow} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 200,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressFill: {
    width: '87.5%',
    height: '100%',
    backgroundColor: '#0F4FA8',
    borderRadius: 3,
  },
  progressStep: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F4FA8',
  },

  // Device Card
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F4FA8',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceDetails: {
    flex: 1,
    marginLeft: 14,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  deviceStorage: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0F4FA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Address Card
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputGroup: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputGroupSm: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  floatingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  floatingInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    paddingTop: 16,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  rowInputs: {
    flexDirection: 'row',
  },

  // Date Cards
  dateScroll: {
    gap: 10,
    paddingRight: 16,
  },
  dateCard: {
    width: 68,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCardActive: {
    backgroundColor: '#0F4FA8',
    borderColor: '#0F4FA8',
    shadowColor: '#0F4FA8',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateMonthActive: {
    color: '#DBEAFE',
  },
  dateDay: {
    marginTop: 4,
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
  },
  dateDayActive: {
    color: '#FFFFFF',
  },
  dateWeek: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  dateWeekActive: {
    color: '#DBEAFE',
  },

  // Time Cards
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  timeCardActive: {
    borderColor: '#0F4FA8',
    backgroundColor: '#F0F7FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#0F4FA8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F4FA8',
  },
  timeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  timeTextActive: {
    color: '#0F4FA8',
  },

  // Trust Section
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trustBadge: {
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 16,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  confirmButton: {
    backgroundColor: '#0F4FA8',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F4FA8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  confirmButtonLoading: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  confirmArrow: {
    marginLeft: 8,
  },

  // Common
  cardPressed: {
    opacity: 0.92,
  },
});

export default AddressPickupScreen;