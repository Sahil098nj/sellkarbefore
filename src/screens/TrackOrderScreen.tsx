import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPickupTrackingRequest } from '../api';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type TrackOrderScreenRouteProp = RouteProp<RootStackParamList, 'TrackOrder'>;

const statusRank: Record<string, number> = {
  new: 0,
  rnr: 0,
  'not-interested': 0,
  scheduled: 1,
  rescheduled: 1,
  confirmed: 1,
  pending: 1,
  'in-progress': 2,
  'in-transit': 2,
  picked: 3,
  completed: 4,
  cancelled: 0,
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TrackOrderScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<TrackOrderScreenRouteProp>();
  const trackingId = route.params?.trackingId ?? route.params?.orderId ?? route.params?.variant?.id ?? '';

  const trackingQuery = useQuery({
    queryKey: ['pickup-tracking', trackingId],
    enabled: !!trackingId,
    queryFn: async () => getPickupTrackingRequest(trackingId),
  });

  const request = trackingQuery.data;
  const currentStatus = (request?.status ?? route.params?.status ?? 'scheduled').toLowerCase();
  const stage = statusRank[currentStatus] ?? 1;

  const quote = Number(request?.final_price ?? route.params?.finalPrice ?? route.params?.variant?.base_price ?? 0);
  const modelName = request?.device?.model_name ?? route.params?.variant?.model_name ?? 'Device';
  const storage = request?.variant?.storage_gb
    ? `${request.variant.storage_gb}${request.variant.ram_options?.size_gb ? ` / ${request.variant.ram_options.size_gb} GB RAM` : ''}`
    : route.params?.variant?.storage_gb
      ? `${route.params.variant.storage_gb} GB`
      : 'Storage pending';
  const city = request?.city_row?.name ?? route.params?.city ?? 'Bengaluru';
  const slotLabel = `${formatDateTime(request?.pickup_date)}${request?.pickup_time ? `, ${request.pickup_time}` : ''}`;
  const address = request?.address ?? route.params?.address ?? `Home, Indiranagar, ${city}`;
  const orderLabel = request?.order_id ?? route.params?.orderId ?? request?.id ?? 'TBD';

  const executiveName = useMemo(() => {
    const candidates = [request?.updated_by, request?.notes, request?.submitted_by]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim());

    return candidates[0] ?? null;
  }, [request?.updated_by, request?.notes, request?.submitted_by]);

  const timeline = useMemo(() => {
    const assigned = stage >= 1;
    const pickup = stage >= 2;
    const verified = stage >= 3;
    const paid = stage >= 4;

    return [
      {
        key: 'placed',
        title: 'Order Placed',
        time: formatDateTime(request?.created_at),
        note: 'We have received your pickup request.',
        status: assigned ? ('done' as const) : ('pending' as const),
      },
      {
        key: 'assigned',
        title: 'Executive Assigned',
        time: assigned ? formatDateTime(request?.updated_at ?? request?.created_at) : 'Pending',
        note: executiveName ? `${executiveName} will visit for pickup.` : 'Pickup executive will appear once assigned.',
        status: assigned ? ('done' as const) : ('pending' as const),
      },
      {
        key: 'pickup',
        title: 'Out for Pickup',
        time: pickup ? 'Today' : 'Pending',
        note: 'Executive is on the way to your location.',
        status: pickup ? ('active' as const) : ('pending' as const),
      },
      {
        key: 'verified',
        title: 'Device Verified',
        time: verified ? 'Completed' : 'Pending',
        note: 'Device verification happens at pickup time.',
        status: verified ? ('done' as const) : ('pending' as const),
      },
      {
        key: 'paid',
        title: 'Payment Transferred',
        time: paid ? 'Completed' : 'Pending',
        note: 'Payment is released after the request is marked completed.',
        status: paid ? ('done' as const) : ('pending' as const),
      },
    ];
  }, [executiveName, request?.created_at, request?.updated_at, stage]);

  const currentStatusLabel =
    currentStatus.length > 0 ? currentStatus.replace(/-/g, ' ').toUpperCase() : 'SCHEDULED';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backPressable} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Track Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {trackingQuery.isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.metaText}>Loading pickup details...</Text>
          </View>
        ) : trackingQuery.isError ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#EF4444" />
            <Text style={styles.errorText}>Unable to load pickup tracking details.</Text>
          </View>
        ) : request ? (
          <>
            <View style={styles.deviceCard}>
              <View style={styles.deviceThumb}>
                <MaterialCommunityIcons name="cellphone" size={20} color="#1D4ED8" />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{modelName}</Text>
                <Text style={styles.deviceSub}>{storage}</Text>
                <Text style={styles.deviceQuote}>₹{quote.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>ORDER #{String(orderLabel).slice(0, 8).toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.statusBadgeTop}>
              <Text style={styles.statusBadgeTopText}>Current status: {currentStatusLabel}</Text>
            </View>

            <View style={styles.agentCard}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentInitials}>
                  {(executiveName ?? 'P').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.agentName}>{executiveName ?? 'Pickup executive pending assignment'}</Text>
                <Text style={styles.agentRole}>Pickup Executive</Text>
                <Text style={styles.agentMeta}>
                  {currentStatus === 'completed' ? 'Completed and verified' : 'Assigned once pickup is scheduled'}
                </Text>
              </View>
              <View style={styles.agentActions}>
                <MaterialCommunityIcons name="phone-outline" size={18} color="#0F4FA8" />
                <MaterialCommunityIcons name="chat-processing-outline" size={18} color="#0F4FA8" />
              </View>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              {timeline.map((step, index) => (
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
                    {index !== timeline.length - 1 && <View style={styles.line} />}
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
              <Text style={styles.detailValue}>{address}</Text>
            </View>
          </>
        ) : (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="magnify-close" size={22} color="#F59E0B" />
            <Text style={styles.errorText}>No pickup request found for this order.</Text>
          </View>
        )}

        <Pressable style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]} onPress={() => navigation.navigate('Home')}>
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
  backPressable: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  errorBox: {
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#9A3412',
    fontWeight: '700',
    flex: 1,
  },
  metaText: {
    color: '#64748B',
    fontWeight: '600',
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
    color: '#1D4ED8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
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
    lineHeight: 24,
  },
  nextButton: {
    marginTop: 12,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextButtonPressed: {
    opacity: 0.9,
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default TrackOrderScreen;
