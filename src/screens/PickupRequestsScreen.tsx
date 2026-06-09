import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePickupRequestsQuery } from '../api';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

interface PickupRequest {
  id: string;
  order_id?: string;
  customer_name: string;
  final_price: number;
  address: string;
  pickup_date?: string;
  pickup_time?: string;
  status: string;
  created_at: string;
  device?: { model_name?: string } | null;
  city?: { name?: string } | null;
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  new: { bg: '#E0F2FE', text: '#0369A1', icon: 'star' },
  rnr: { bg: '#FEF3C7', text: '#B45309', icon: 'phone-off' },
  'not-interested': { bg: '#FECACA', text: '#991B1B', icon: 'close-circle' },
  scheduled: { bg: '#DCFCE7', text: '#15803D', icon: 'calendar-check' },
  rescheduled: { bg: '#F3E8FF', text: '#6B21A8', icon: 'calendar-refresh' },
  'in-progress': { bg: '#DDD6FE', text: '#4F46E5', icon: 'truck-fast' },
  completed: { bg: '#C7D2FE', text: '#4F46E5', icon: 'check-circle' },
  cancelled: { bg: '#F5F3FF', text: '#6B7280', icon: 'cancel' },
  pending: { bg: '#E5E7EB', text: '#6B7280', icon: 'clock' },
  confirmed: { bg: '#DCFCE7', text: '#15803D', icon: 'check' },
  'in-transit': { bg: '#DDD6FE', text: '#4F46E5', icon: 'truck' },
};

const PickupRequestsScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuthStore();
  const { data: pickupRequests, isLoading, error, refetch } = usePickupRequestsQuery(user?.phone);

  const requestsList = useMemo(() => pickupRequests ?? [], [pickupRequests]);

  const handleViewDetails = (orderId?: string) => {
    if (orderId) {
      navigation.navigate('TrackOrder', { trackingId: orderId });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPickupCard = ({ item }: { item: PickupRequest }) => {
    const statusInfo = statusColors[item.status] || statusColors.new;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.pickupCard,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => handleViewDetails(item.order_id)}
      >
        <View style={styles.pickupHeader}>
          <View style={styles.pickupInfo}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderId}>{item.order_id || item.id.slice(0, 8)}</Text>
              <Text style={styles.createdDate}>{formatDate(item.created_at)}</Text>
            </View>
            <Text numberOfLines={1} style={styles.customerName}>
              {item.customer_name || 'Customer'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color={statusInfo.text} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.pickupBody}>
          {item.device?.model_name && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="smartphone" size={16} color={COLORS.primary} />
              <Text numberOfLines={1} style={styles.detailText}>
                {item.device.model_name}
              </Text>
            </View>
          )}

          {item.city?.name && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
              <Text numberOfLines={1} style={styles.detailText}>
                {item.city.name}
              </Text>
            </View>
          )}

          {item.pickup_date && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={COLORS.primary} />
              <Text numberOfLines={1} style={styles.detailText}>
                {formatDate(item.pickup_date)}
                {item.pickup_time && ` • ${item.pickup_time}`}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="currency-inr" size={16} color="#16A34A" />
            <Text style={[styles.detailText, { color: '#16A34A', fontWeight: '600' }]}>
              ₹{Number(item.final_price).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.addressRow}>
            <MaterialCommunityIcons name="map-outline" size={16} color="#64748B" />
            <Text numberOfLines={2} style={styles.addressText}>
              {item.address || 'Address not set'}
            </Text>
          </View>
        </View>

        {item.order_id && (
          <Pressable
            style={styles.viewDetailsButton}
            onPress={() => handleViewDetails(item.order_id)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading pickup requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load pickup requests</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (requestsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={48} color={COLORS.gray} />
          <Text style={styles.emptyText}>No pickup requests yet</Text>
          <Text style={styles.emptySubText}>
            Your pickup requests will appear here after confirmation
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pickup Requests</Text>
        <Text style={styles.headerSubtitle}>
          {requestsList.length} request{requestsList.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={requestsList}
        renderItem={renderPickupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refetch()}
            colors={[COLORS.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  listContainer: {
    padding: 12,
    gap: 12,
  },
  pickupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickupInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  createdDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pickupBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PickupRequestsScreen;
