import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLeadsQuery } from '../api';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';

interface Lead {
  id: string;
  customer_name: string;
  phone_number: string;
  device_id?: string;
  variant_id?: string;
  final_price?: number;
  lead_status: string;
  created_at: string;
  brand_name?: string;
  overall_condition?: string;
  age_group?: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  new: { bg: '#E0F2FE', text: '#0369A1', icon: 'star' },
  RNR: { bg: '#FEF3C7', text: '#B45309', icon: 'phone-off' },
  'Not interested': { bg: '#FECACA', text: '#991B1B', icon: 'close-circle' },
  Scheduled: { bg: '#DCFCE7', text: '#15803D', icon: 'calendar-check' },
  Reschedule: { bg: '#F3E8FF', text: '#6B21A8', icon: 'calendar-refresh' },
};

const LeadsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { data: leads, isLoading, error, refetch } = useLeadsQuery(user?.phone);

  const leadsList = useMemo(() => leads ?? [], [leads]);

  const renderLeadCard = ({ item }: { item: Lead }) => {
    const statusInfo = statusColors[item.lead_status] || statusColors.new;
    const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Pressable
        style={({ pressed }) => [
          styles.leadCard,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Text style={styles.customerName}>{item.customer_name || 'Customer'}</Text>
            <Text style={styles.leadDate}>{formattedDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color={statusInfo.text} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {item.lead_status}
            </Text>
          </View>
        </View>

        <View style={styles.leadBody}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="smartphone" size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {item.brand_name || 'Unknown Brand'}
            </Text>
          </View>

          {item.overall_condition && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                Condition: {item.overall_condition}
              </Text>
            </View>
          )}

          {item.age_group && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                Age: {item.age_group}
              </Text>
            </View>
          )}

          {item.final_price && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="currency-inr" size={16} color="#16A34A" />
              <Text style={[styles.detailText, { color: '#16A34A', fontWeight: '600' }]}>
                ₹{Number(item.final_price).toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load leads</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (leadsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={48} color={COLORS.gray} />
          <Text style={styles.emptyText}>No leads yet</Text>
          <Text style={styles.emptySubText}>
            Your leads will appear here after you unlock a price
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Leads</Text>
        <Text style={styles.headerSubtitle}>{leadsList.length} lead{leadsList.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={leadsList}
        renderItem={renderLeadCard}
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
  leadCard: {
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
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  leadDate: {
    fontSize: 12,
    color: '#94A3B8',
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
  leadBody: {
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

export default LeadsScreen;
