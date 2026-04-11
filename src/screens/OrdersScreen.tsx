import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrderHistoryQuery } from '../api';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

const statusColor: Record<string, string> = {
  completed: '#16A34A',
  scheduled: '#0F4FA8',
  picked: '#D97706',
};

const statusBg: Record<string, string> = {
  completed: '#DCFCE7',
  scheduled: '#DBEAFE',
  picked: '#FEF3C7',
};

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuthStore();
  const ordersQuery = useOrderHistoryQuery(user?.id);

  const orders = ordersQuery.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
        </Pressable>
        <Text style={styles.title}>Order History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <Pressable
            key={order.id}
            style={({ pressed }: { pressed: boolean }) => [styles.orderCard, pressed && styles.cardPressed]}
            onPress={() =>
              navigation.navigate('TrackOrder', {
                orderId: order.id,
                finalPrice: order.price_final,
                city: order.city,
                address: order.pickup_address,
                status: order.status,
              })
            }
          >
            <View style={styles.orderTop}>
              <View style={styles.deviceThumb}>
                <MaterialCommunityIcons name="cellphone" size={20} color="#1D4ED8" />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.modelName}>
                  {order.device_name}
                  {order.device_variant ? ` (${order.device_variant})` : ''}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusBg[order.status] ?? '#E2E8F0' },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor[order.status] ?? '#475569' }]}> 
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.orderBottom}>
              <Text style={styles.orderIdText}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.quoteText}>₹{order.price_final.toLocaleString('en-IN')}</Text>
            </View>
          </Pressable>
        ))}

        {ordersQuery.isLoading ? <Text style={styles.metaText}>Loading your orders...</Text> : null}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <Text style={styles.metaText}>No order history yet. Sell your first device to see it here.</Text>
        ) : null}

        <View style={styles.cta}>
          <MaterialCommunityIcons name="cellphone-arrow-down-variant" size={38} color="#CBD5E1" />
          <Text style={styles.ctaTitle}>Sell another device</Text>
          <Text style={styles.ctaSub}>Get the best price for your old gadgets</Text>
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [styles.ctaButton, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.ctaButtonText}>Go to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D5DFEC',
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerSpacer: { width: 32 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: { opacity: 0.85 },
  orderTop: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  deviceThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  orderInfo: { flex: 1 },
  modelName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  orderDate: { marginTop: 3, fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  orderIdText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  quoteText: { fontSize: 15, fontWeight: '800', color: '#1D4ED8' },
  cta: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  ctaTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  ctaSub: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  ctaButton: {
    marginTop: 10,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  metaText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OrdersScreen;
