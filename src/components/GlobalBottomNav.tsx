import React from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackNavigationProp } from '../navigation/types';
import { useAuthStore } from '../store';

type GlobalBottomNavProps = {
  currentRouteName: string;
};

const navItems = [
  { label: 'Home', icon: 'home-variant', iconAlt: 'home-variant-outline' },
  { label: 'Orders', icon: 'clipboard-text', iconAlt: 'clipboard-text-outline' },
  { label: 'Profile', icon: 'account-circle', iconAlt: 'account-circle-outline' },
] as const;

const GlobalBottomNav: React.FC<GlobalBottomNavProps> = ({ currentRouteName }) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const user = useAuthStore((state) => state.user);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [navWidth, setNavWidth] = React.useState(0);
  const pillProgress = React.useRef(new Animated.Value(0)).current;

  const tabWidth = navWidth > 0 ? navWidth / navItems.length : 0;

  const activeTab = React.useMemo(() => {
    if (currentRouteName === 'Orders') return 'Orders';
    if (currentRouteName === 'Profile') return 'Profile';
    return 'Home';
  }, [currentRouteName]);

  React.useEffect(() => {
    Animated.timing(pillProgress, {
      toValue: navItems.findIndex((item) => item.label === activeTab),
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [activeTab, pillProgress]);

  const handleTabPress = (label: string) => {
    if (!user && (label === 'Orders' || label === 'Profile')) {
      setShowLoginModal(true);
      return;
    }

    if (label === 'Home') {
      navigation.navigate('Home');
      return;
    }

    if (label === 'Orders') {
      navigation.navigate('Orders');
      return;
    }

    if (label === 'Profile') {
      navigation.navigate('Profile');
    }
  };

  return (
    <>
      <View style={styles.bottomNav} onLayout={(e: any) => setNavWidth(e.nativeEvent.layout.width)}>
        {tabWidth > 0 ? (
          <Animated.View
            style={[
              styles.activePill,
              {
                width: tabWidth - 12,
                transform: [{ translateX: Animated.multiply(pillProgress, tabWidth) }],
              },
            ]}
          />
        ) : null}

        {navItems.map((item) => {
          const active = activeTab === item.label;
          const loginRestricted = !user && (item.label === 'Orders' || item.label === 'Profile');
          return (
            <Pressable key={item.label} style={styles.navItem} onPress={() => handleTabPress(item.label)}>
              <View style={styles.navIconWrap}>
                <MaterialCommunityIcons
                  name={active ? item.icon : item.iconAlt}
                  size={20}
                  color={active ? '#0F4FA8' : '#64748B'}
                />
                {loginRestricted ? (
                  <View style={styles.navLockBadge}>
                    <MaterialCommunityIcons name="lock-outline" size={8} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        transparent
        visible={showLoginModal}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="account-lock-outline" size={24} color="#1D4ED8" />
            </View>

            <Text style={styles.modalTitle}>Login required</Text>
            <Text style={styles.modalBody}>
              To view Orders or Profile, continue with OTP. Login and registration happen in one simple step.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.modalButtonSecondary,
                  pressed && styles.pressDown,
                ]}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Not now</Text>
              </Pressable>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.modalButtonPrimary,
                  pressed && styles.pressDown,
                ]}
                onPress={() => {
                  setShowLoginModal(false);
                  navigation.navigate('Auth', undefined);
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Continue with OTP</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 22,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  activePill: {
    position: 'absolute',
    left: 6,
    top: 6,
    bottom: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(234,242,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.8)',
  },
  navIconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  navLockBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 1 },
  navLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  navLabelActive: { color: '#0F4FA8', fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 18,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modalTitle: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    fontWeight: '500',
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  modalButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  modalButtonSecondaryText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  pressDown: { transform: [{ scale: 0.96 }] },
});

export default GlobalBottomNav;
