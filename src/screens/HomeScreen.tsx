import React from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import type { RootStackNavigationProp } from '../navigation/types';
import { useAuthStore } from '../store';
import GlobalBottomNav from '../components/GlobalBottomNav';

const whyFeatures = [
  {
    icon: 'lightning-bolt',
    title: 'Quick Evaluation',
    desc: 'Get price in under 60 seconds',
    tint: '#E9F1FF',
    iconColor: '#004AAD',
  },
  {
    icon: 'cash-fast',
    title: 'Instant Payment',
    desc: 'Cash or bank transfer instantly',
    tint: '#FFF1E7',
    iconColor: '#F97316',
  },
  {
    icon: 'truck-deliver',
    title: 'Free Pickup',
    desc: 'We come to your location',
    tint: '#E9F1FF',
    iconColor: '#004AAD',
  },
  {
    icon: 'shield-star',
    title: 'Best Price',
    desc: 'Highest resale value assured',
    tint: '#FFF1E7',
    iconColor: '#F97316',
  },
];

const sellOptions = [
  {
    title: 'Sell Phone',
    subtitle: 'Get instant quote for 1000+ models',
    category: 'phone' as const,
    icon: 'cellphone',
  },
  {
    title: 'Sell Laptop',
    subtitle: 'Laptops, MacBooks & Workstations',
    category: 'laptop' as const,
    icon: 'laptop',
  },
  {
    title: 'Sell iPad',
    subtitle: 'Tablets and Graphic pads',
    category: 'ipad' as const,
    icon: 'tablet-dashboard',
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = React.useState(() => new Date());
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const bannerFloat = React.useRef(new Animated.Value(0)).current;
  const modalIconPulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bannerFloat, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(bannerFloat, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bannerFloat]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(modalIconPulse, {
          toValue: 1,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(modalIconPulse, {
          toValue: 0,
          duration: 950,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [modalIconPulse]);

  const hour = currentTime.getHours();
  const dayGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const welcomeName = user?.name?.trim() ? user.name.trim() : '';

  const showLoginGate = () => {
    setShowLoginModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            {user ? <Text style={styles.greeting}>{dayGreeting}</Text> : null}
            <Text style={styles.username}>{user ? `Welcome, ${welcomeName}` : 'Welcome'}</Text>
          </View>
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.avatar,
              pressed && styles.pressDown,
            ]}
            onPress={() => {
              if (!user) {
                showLoginGate();
                return;
              }
              navigation.navigate('Profile');
            }}
          >
            <MaterialCommunityIcons name="account" size={18} color="#0F4FA8" />
          </Pressable>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerLayerOne} />
          <View style={styles.bannerLayerTwo} />

          <Text style={styles.bannerTitle}>Get the best value for your old devices</Text>
          <Text style={styles.bannerSub}>Instant cash. Doorstep pickup. Zero stress.</Text>

          <Pressable
            style={({ pressed }: { pressed: boolean }) => [styles.bannerButtonWrap, pressed && styles.pressDown]}
            onPress={() => navigation.navigate('Brand', { category: 'phone' })}
          >
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Sell Now</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#0F4FA8" />
            </View>
          </Pressable>

          <Animated.View
            style={[
              styles.bannerDevice,
              {
                transform: [
                  {
                    translateY: bannerFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons name="cellphone" size={38} color="rgba(255,255,255,0.86)" />
          </Animated.View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>What are you selling?</Text>
        </View>

        {sellOptions.map((item) => (
          <Pressable
            key={item.title}
            style={({ pressed }: { pressed: boolean }) => [styles.optionCard, pressed && styles.pressDown]}
            onPress={() => navigation.navigate('Brand', { category: item.category })}
          >
            <View style={styles.optionLeft}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSub}>{item.subtitle}</Text>
              </View>
            </View>
            <View style={styles.chevronWrap}>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#2563EB" />
            </View>
          </Pressable>
        ))}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Why sell with Sellkar?</Text>
          <Text style={styles.sectionSubtitle}>Trusted by 50,000+ sellers across India</Text>
        </View>

        <View style={styles.featureGrid}>
          {whyFeatures.map((feat) => (
            <View key={feat.title} style={styles.featureCard}>
              <View style={[styles.featureIconWrap, { backgroundColor: feat.tint }]}>
                <MaterialCommunityIcons name={feat.icon} size={22} color={feat.iconColor} />
              </View>
              <Text style={styles.featureTitle}>{feat.title}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showLoginModal}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Animated.View
              style={[
                styles.modalIconWrap,
                {
                  transform: [
                    {
                      scale: modalIconPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons name="account-lock-outline" size={24} color="#1D4ED8" />
            </Animated.View>

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

      <GlobalBottomNav currentRouteName="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7FC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#64748B', fontSize: 12, marginBottom: 2 },
  username: { color: '#0F172A', fontSize: 26, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#D7E3F4',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  locationText: { color: '#334155', fontWeight: '700', fontSize: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  banner: {
    marginTop: 14,
    borderRadius: 24,
    padding: 18,
    minHeight: 175,
    overflow: 'hidden',
    backgroundColor: COLORS.PRIMARY,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  bannerLayerOne: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 180,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ rotate: '-14deg' }],
  },
  bannerLayerTwo: {
    position: 'absolute',
    bottom: -16,
    left: -22,
    width: 210,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(249,115,22,0.22)',
    transform: [{ rotate: '8deg' }],
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', width: '72%', lineHeight: 30 },
  bannerSub: { marginTop: 7, color: 'rgba(255,255,255,0.86)', fontSize: 13 },
  bannerButtonWrap: { marginTop: 14, alignSelf: 'flex-start' },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerButtonText: { color: '#1D4ED8', fontWeight: '800', fontSize: 14 },
  bannerDevice: {
    position: 'absolute',
    right: 22,
    top: 54,
    width: 82,
    height: 112,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: { marginTop: 26, marginBottom: 4 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
  sectionSubtitle: { marginTop: 3, fontSize: 12, color: '#6B7280', fontWeight: '500' },
  optionCard: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E9F1FF',
    borderWidth: 1,
    borderColor: '#C9DCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  optionSub: { marginTop: 3, fontSize: 12, color: '#6B7280', fontWeight: '500' },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1E7',
    borderWidth: 1,
    borderColor: '#FFD1B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: '#6B7280', fontWeight: '500', lineHeight: 17 },
  pressDown: { transform: [{ scale: 0.96 }] },
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
});

export default HomeScreen;
