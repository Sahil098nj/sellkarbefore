import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type TrackOrderScreenRouteProp = RouteProp<RootStackParamList, 'TrackOrder'>;

const timelineSteps = [
  { key: 'placed', title: 'Order Placed', time: 'May 24, 10:30 AM', note: 'We have received your sell order.', status: 'done' },
  { key: 'assigned', title: 'Technician Assigned', time: 'May 24, 11:00 AM', note: 'Rahul Sharma will visit for pickup.', status: 'done' },
  { key: 'pickup', title: 'Out for Pickup', time: 'Today', note: 'Technician is on the way to your location.', status: 'active' },
  { key: 'verified', title: 'Device Verified', time: 'Pending', note: '', status: 'pending' },
  { key: 'paid', title: 'Payment Transferred', time: 'Pending', note: '', status: 'pending' },
];

const TrackOrderScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<TrackOrderScreenRouteProp>();

  const quote = route.params?.finalPrice ?? (route.params?.variant?.base_price ? Math.round(route.params.variant.base_price * 1.12) : 41200);
  const modelName = route.params?.variant?.model_name ?? 'iPhone 14 Pro';
  const storage = route.params?.variant?.storage_gb ? `${route.params.variant.storage_gb} GB` : '128 GB';
  const slotLabel = `${route.params?.pickupDateLabel ?? 'Today'}, ${route.params?.pickupTime ?? '04:00 PM - 07:00 PM'}`;
  const city = route.params?.city ?? 'Bengaluru';
  const orderId = useMemo(
    () => route.params?.orderId ?? `SK-${Math.floor(1000 + (quote % 9000))}`,
    [quote, route.params?.orderId],
  );
  const currentStatus = route.params?.status ?? 'scheduled';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backIcon}>‹</Text>
        <Text style={styles.title}>Track Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.deviceCard}>
          <View style={styles.deviceThumb}><MaterialCommunityIcons name="cellphone" size={20} color="#1D4ED8" /></View>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{modelName}</Text>
            <Text style={styles.deviceSub}>{storage} · Flawless</Text>
            <Text style={styles.deviceQuote}>₹{quote.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.orderBadge}><Text style={styles.orderBadgeText}>ORDER #{orderId.slice(0, 8).toUpperCase()}</Text></View>
        </View>

        <View style={styles.statusBadgeTop}>
          <Text style={styles.statusBadgeTopText}>Current status: {currentStatus.toUpperCase()}</Text>
        </View>

        <View style={styles.agentCard}>
          <View style={styles.agentAvatar}><Text style={styles.agentInitials}>RS</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentName}>Rahul Sharma</Text>
            <Text style={styles.agentRole}>Pickup Executive</Text>
            <Text style={styles.agentMeta}>★★★★★ (4.8)</Text>
          </View>
          <View style={styles.agentActions}>
            <MaterialCommunityIcons name="phone-outline" size={18} color="#0F4FA8" />
            <MaterialCommunityIcons name="chat-processing-outline" size={18} color="#0F4FA8" />
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          {timelineSteps.map((step, index) => (
            <View key={step.key} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.dot,
                    step.status === 'done' && styles.dotDone,
                    step.status === 'active' && styles.dotActive,
                  ]}
                >
                  {step.status === 'done' ? (
                    <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                  ) : step.status === 'active' ? (
                    <MaterialCommunityIcons name="progress-clock" size={12} color="#FFFFFF" />
                  ) : null}
                </View>
                {index !== timelineSteps.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, step.status === 'pending' && styles.pendingText]}>{step.title}</Text>
                <Text style={[styles.stepTime, step.status === 'pending' && styles.pendingText]}>{step.time}</Text>
                {step.note ? <Text style={styles.stepDesc}>{step.note}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailLabelRow}>
            <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#94A3B8" />
            <Text style={styles.detailLabel}>PICKUP SLOT</Text>
          </View>
          <Text style={styles.detailValue}>{slotLabel}</Text>
          <View style={[styles.detailLabelRow, { marginTop: 14 }]}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color="#94A3B8" />
            <Text style={styles.detailLabel}>ADDRESS</Text>
          </View>
          <Text style={styles.detailValue}>{route.params?.address ?? `Home, Indiranagar, ${city}`}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.nextText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D5DFEC',
    backgroundColor: '#F8FAFC',
  },
  backIcon: {
    fontSize: 26,
    color: '#334155',
    width: 24,
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 22,
  },
  deviceCard: {
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  deviceThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    marginLeft: 10,
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  deviceSub: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 12,
  },
  deviceQuote: {
    marginTop: 6,
    color: '#1D5FBF',
    fontWeight: '800',
    fontSize: 14,
  },
  orderBadge: {
    position: 'absolute',
    right: 8,
    top: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  orderBadgeText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTop: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusBadgeTopText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  agentCard: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  agentInitials: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 12,
  },
  agentName: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
  agentRole: {
    color: '#64748B',
    fontSize: 12,
  },
  agentMeta: {
    color: '#F59E0B',
    fontSize: 11,
    marginTop: 2,
  },
  agentActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusCard: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    padding: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 66,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#22C55E',
  },
  dotActive: {
    backgroundColor: '#1D5FBF',
  },
  dotIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  line: {
    width: 2.5,
    flex: 1,
    marginTop: 4,
    backgroundColor: '#E2E8F0',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepTime: {
    marginTop: 1,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  stepDesc: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EEF2F7',
    fontSize: 12,
    color: '#64748B',
  },
  pendingText: {
    color: '#94A3B8',
  },
  detailCard: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    padding: 12,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  detailValue: {
    marginTop: 4,
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButton: {
    marginTop: 14,
    backgroundColor: '#0F4FA8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default TrackOrderScreen;
