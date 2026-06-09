import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrderHistoryQuery, useProfileQuery, useUpdateProfileMutation, type PickupRequest } from '../api';
import { useAuthHook } from '../hooks';
import { useAuthStore } from '../store';
import { COLORS } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';

const ProfileScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, setUser, logout: clearAuthStore } = useAuthStore();
  const { logout } = useAuthHook();
  const profileQuery = useProfileQuery(user?.id);
  const ordersQuery = useOrderHistoryQuery(user?.id);
  const updateProfileMutation = useUpdateProfileMutation();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedAboutUs, setExpandedAboutUs] = useState(false);

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

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      clearAuthStore();
    } finally {
      queryClient.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
      setIsLoggingOut(false);
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

          {recentOrders.map((order: PickupRequest) => (
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

        {/* About Us Menu Item */}
        <Pressable
          style={({ pressed }) => [styles.menuItemCard, pressed && styles.pressed]}
          onPress={() => setExpandedAboutUs(!expandedAboutUs)}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#0F4FA8" />
            </View>
            <Text style={styles.menuItemText}>About Us</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color="#64748B"
            style={[styles.menuItemArrow, expandedAboutUs && styles.menuItemArrowRotated]}
          />
        </Pressable>

        {/* About Us Expandable Content */}
        {expandedAboutUs && (
          <View style={styles.aboutCard}>
            <View style={styles.aboutLogoWrap}>
              <MaterialCommunityIcons name="cellphone" size={32} color="#0F4FA8" />
            </View>
            <Text style={styles.aboutTitle}>SellKar India</Text>
            <Text style={styles.aboutSubtitle}>Fast, Transparent & Doorstep Service</Text>
            
            <View style={styles.aboutDivider} />
            
            <Text style={styles.aboutDescription}>
              SellKar India is a fast, transparent, and doorstep service for selling used phones, laptops, tablets, Macs, and other gadgets across India. We help individuals and businesses get fair value for their old devices without wasting time on negotiations, fake buyers, or marketplace hassle.
            </Text>

            <View style={styles.aboutFeatures}>
              <View style={styles.aboutFeatureRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#16A34A" />
                <Text style={styles.aboutFeatureText}>Pick up from your location</Text>
              </View>
              <View style={styles.aboutFeatureRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#16A34A" />
                <Text style={styles.aboutFeatureText}>Evaluate instantly at your doorstep</Text>
              </View>
              <View style={styles.aboutFeatureRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#16A34A" />
                <Text style={styles.aboutFeatureText}>Pay you on the spot</Text>
              </View>
            </View>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutSectionTitle}>Why We're Different</Text>
            <Text style={styles.aboutDescription}>
              No hidden cuts, no reselling drama, no waiting. Just a verified team, transparent pricing, and same-day payout.
            </Text>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutSectionTitle}>Who We Serve</Text>
            <Text style={styles.aboutDescription}>
              Anyone across India who wants to sell electronics quickly — students, professionals, retailers, corporates, and even bulk sellers.
            </Text>

            <View style={styles.aboutDivider} />

            <View style={styles.aboutStatsRow}>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNumber}>18+</Text>
                <Text style={styles.aboutStatLabel}>Cities</Text>
              </View>
              <View style={styles.aboutStatDivider} />
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNumber}>100%</Text>
                <Text style={styles.aboutStatLabel}>Transparent</Text>
              </View>
              <View style={styles.aboutStatDivider} />
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNumber}>Same Day</Text>
                <Text style={styles.aboutStatLabel}>Payout</Text>
              </View>
            </View>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutSectionTitle}>Our Reach</Text>
            <Text style={styles.aboutDescription}>
              From Bangalore to 18 cities and growing, powered by a trusted network of local partners and vendors.
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }: { pressed: boolean }) => [styles.logoutButton, pressed && styles.pressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
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
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 16,
  },
  metaText: {
    marginTop: 4,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  // About Us Styles
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  aboutLogoWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  aboutSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  aboutDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  aboutDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    textAlign: 'center',
  },
  aboutFeatures: {
    marginTop: 12,
    width: '100%',
    gap: 10,
  },
  aboutFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aboutFeatureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  aboutSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  aboutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 8,
  },
  aboutStat: {
    alignItems: 'center',
    flex: 1,
  },
  aboutStatNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F4FA8',
  },
  aboutStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  aboutStatDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  // Menu Item Styles
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItemArrow: {
    transform: [{ rotate: '0deg' }],
  },
  menuItemArrowRotated: {
    transform: [{ rotate: '90deg' }],
  },
});

export default ProfileScreen;
