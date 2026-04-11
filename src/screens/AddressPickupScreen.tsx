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

    const fullAddress = `${houseStreet.trim()}, ${area.trim()}, ${addressCity} - ${pincode.trim()}`;
    const selectedDateItem = dateSlots.find((item) => item.id === selectedDate) ?? dateSlots[0];

    try {
      const pickup = await createPickupMutation.mutateAsync({
        customerId: user.id,
        leadId: user.leadId,
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
          <View style={styles.stepHeader}>
            <Text style={styles.backIcon}>‹</Text>
            <View style={styles.stepTextWrap}>
              <Text style={styles.stepLabel}>STEP 7 OF 8</Text>
              <Text style={styles.title}>Finalize Booking</Text>
            </View>
            <Text style={styles.helpIcon}>?</Text>
          </View>

          <View style={styles.deviceCard}>
            <View style={styles.deviceThumb}>
              <MaterialCommunityIcons name="cellphone" size={20} color="#1D4ED8" />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{modelName} ({storage})</Text>
              <Text style={styles.deviceQuote}>Quote: ₹{quote.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color="#0F4FA8" />
            <Text style={styles.sectionTitle}>Pickup Address</Text>
          </View>

          <View style={styles.addressForm}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>House / Flat No. & Street *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 402, Sunshine Heights, 12th Main Road"
                placeholderTextColor="#94A3B8"
                value={houseStreet}
                onChangeText={setHouseStreet}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Area / Landmark *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Indiranagar"
                placeholderTextColor="#94A3B8"
                value={area}
                onChangeText={setArea}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputRowTwo}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="560 038"
                  placeholderTextColor="#94A3B8"
                  value={pincode}
                  onChangeText={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                />
              </View>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <Text style={styles.cityReadOnly}>{addressCity}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#0F4FA8" />
            <Text style={styles.sectionTitle}>Select Slot</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dateSlots.map((item) => {
              const isActive = selectedDate === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.dateCard, isActive && styles.dateCardActive, pressed && styles.cardPressed]}
                  onPress={() => setSelectedDate(item.id)}
                >
                  <Text style={[styles.dateMonth, isActive && styles.dateMonthActive]}>{item.month}</Text>
                  <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>{item.day}</Text>
                  <Text style={[styles.dateWeek, isActive && styles.dateWeekActive]}>{item.week}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => {
              const isActive = selectedTime === slot;
              return (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [styles.timeCard, isActive && styles.timeCardActive, pressed && styles.cardPressed]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.timeText, isActive && styles.timeTextActive]}>
                    {slot}
                  </Text>
                </Pressable>
              );
          })}
          </View>

          <View style={styles.noteCard}>
            <MaterialCommunityIcons name="check-decagram-outline" size={16} color="#16A34A" />
            <Text style={styles.noteText}>Your device will be professionally inspected at your doorstep. Once confirmed, payment is transferred instantly.</Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>TOTAL QUOTE</Text>
            <Text style={styles.bottomValue}>₹{quote.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>Best Price Guaranteed</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          disabled={createPickupMutation.isPending}
          onPress={handleConfirm}
        >
          <Text style={styles.nextText}>
            {createPickupMutation.isPending ? 'Confirming...' : 'Confirm Order  →'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F6',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 220,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 3,
    borderBottomColor: '#1D5FBF',
    paddingBottom: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#334155',
    width: 30,
  },
  stepTextWrap: {
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#1D5FBF',
  },
  helpIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  title: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  deviceCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceThumbIcon: {
    fontSize: 20,
  },
  deviceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  deviceQuote: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D5FBF',
  },
  sectionTitleRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressForm: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5DFEC',
    overflow: 'hidden',
  },
  inputWrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 3,
  },
  input: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  inputRowTwo: {
    flexDirection: 'row',
    gap: 0,
  },
  cityReadOnly: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  dateRow: {
    marginTop: 10,
    gap: 8,
    paddingRight: 8,
  },
  dateCard: {
    width: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5DFEC',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateCardActive: {
    backgroundColor: '#1D5FBF',
    borderColor: '#1D5FBF',
  },
  dateMonth: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateMonthActive: {
    color: '#DBEAFE',
  },
  dateDay: {
    marginTop: 2,
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '800',
  },
  dateDayActive: {
    color: COLORS.WHITE,
  },
  dateWeek: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  dateWeekActive: {
    color: '#DBEAFE',
  },
  timeGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  timeCard: {
    width: '48.5%',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeCardActive: {
    borderColor: '#1D5FBF',
    backgroundColor: '#EAF2FF',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  timeTextActive: {
    color: '#1D5FBF',
  },
  noteCard: {
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DFEC',
    backgroundColor: '#F8FAFC',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#D5DFEC',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  bottomValue: {
    marginTop: 2,
    color: '#0F172A',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  badgeWrap: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  nextButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0F4FA8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  nextButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  cardPressed: {
    opacity: 0.94,
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default AddressPickupScreen;
