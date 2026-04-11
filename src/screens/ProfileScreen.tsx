import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrderHistoryQuery, useProfileQuery, useUpdateProfileMutation } from '../api';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

const ProfileScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, setUser } = useAuthStore();
  const profileQuery = useProfileQuery(user?.id);
  const ordersQuery = useOrderHistoryQuery(user?.id);
  const updateProfileMutation = useUpdateProfileMutation();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  React.useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? '');
      setCity(profileQuery.data.city ?? '');
    } else if (user) {
      setName(user.name ?? '');
      setCity(user.city ?? '');
    }
  }, [profileQuery.data, user]);

  const recentOrders = (ordersQuery.data ?? []).slice(0, 3);

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      const updated = await updateProfileMutation.mutateAsync({
        customerId: user.id,
        name: name.trim() || undefined,
        city: city.trim() || undefined,
      });

      setUser({
        ...user,
        name: updated.name ?? user.name,
        city: updated.city,
      });

      queryClient.invalidateQueries({ queryKey: ['customer-profile', user.id] });
      navigation.navigate('Home');
    } catch {
      // Keep UX simple and non-blocking for now.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={40} color="#0F4FA8" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <MaterialCommunityIcons name="account-outline" size={18} color="#64748B" style={styles.fieldIcon} />
              <View style={styles.fieldInner}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>
            </View>
            <View style={styles.fieldDivider} />
            <View style={styles.fieldRow}>
              <MaterialCommunityIcons name="phone-outline" size={18} color="#64748B" style={styles.fieldIcon} />
              <View style={styles.fieldInner}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <Text style={styles.readOnlyValue}>{user?.phone ? `+91 ${user.phone}` : 'Not verified'}</Text>
              </View>
            </View>
            <View style={styles.fieldDivider} />
            <View style={styles.fieldRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#64748B" style={styles.fieldIcon} />
              <View style={styles.fieldInner}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Enter your city"
                  placeholderTextColor="#94A3B8"
                  value={city}
                  onChangeText={setCity}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>ORDER HISTORY</Text>
            <Pressable onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          {recentOrders.map((order) => (
            <Pressable
              key={order.id}
              style={({ pressed }: { pressed: boolean }) => [styles.orderRow, pressed && styles.pressed]}
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
              <View style={styles.orderThumb}>
                <MaterialCommunityIcons name="cellphone" size={18} color="#1D4ED8" />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderModel}>
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
              <View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}> 
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.orderQuote}>₹{order.price_final.toLocaleString('en-IN')}</Text>
              </View>
            </Pressable>
          ))}

          {ordersQuery.isLoading ? <Text style={styles.metaText}>Loading order history...</Text> : null}
          {!ordersQuery.isLoading && recentOrders.length === 0 ? (
            <Text style={styles.metaText}>No orders yet.</Text>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }: { pressed: boolean }) => [styles.saveButton, pressed && styles.pressed]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save & Go Home'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusBg = (status: string) => {
  if (status === 'completed') return '#DCFCE7';
  if (status === 'picked') return '#FEF3C7';
  return '#DBEAFE';
};

const getStatusColor = (status: string) => {
  if (status === 'completed') return '#16A34A';
  if (status === 'picked') return '#D97706';
  return '#0F4FA8';
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
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerSpacer: { width: 32 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginTop: 12, marginBottom: 24 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  section: { marginBottom: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 10,
  },
  viewAll: { fontSize: 12, fontWeight: '700', color: COLORS.PRIMARY },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldIcon: { marginRight: 12 },
  fieldInner: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 2 },
  fieldInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  fieldDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  pressed: { opacity: 0.85 },
  orderThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  orderInfo: { flex: 1 },
  orderModel: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  orderDate: { marginTop: 2, fontSize: 11, color: '#64748B', fontWeight: '500' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-end' },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderQuote: { marginTop: 4, fontSize: 13, fontWeight: '800', color: '#1D4ED8', textAlign: 'right' },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  metaText: {
    marginTop: 4,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProfileScreen;
