import React from 'react';
import {
  Animated,
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

const whyFeatures = [
  {
    icon: 'lightning-bolt',
    title: 'Quick Evaluation',
    desc: 'Get price in under 60 seconds',
    tint: '#EAF2FF',
    iconColor: '#2563EB',
  },
  {
    icon: 'cash-fast',
    title: 'Instant Payment',
    desc: 'Cash or bank transfer instantly',
    tint: '#F0FDF4',
    iconColor: '#16A34A',
  },
  {
    icon: 'truck-deliver',
    title: 'Free Pickup',
    desc: 'We come to your location',
    tint: '#FAF5FF',
    iconColor: '#7C3AED',
  },
  {
    icon: 'shield-star',
    title: 'Best Price',
    desc: 'Highest resale value assured',
    tint: '#FFFBEB',
    iconColor: '#D97706',
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

const navItems = [
  { label: 'Home', icon: 'home-variant', iconAlt: 'home-variant-outline' },
  { label: 'Orders', icon: 'clipboard-text', iconAlt: 'clipboard-text-outline' },
  { label: 'Profile', icon: 'account-circle', iconAlt: 'account-circle-outline' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [activeTab, setActiveTab] = React.useState('Home');
  const [navWidth, setNavWidth] = React.useState(0);

  const pillProgress = React.useRef(new Animated.Value(0)).current;
  const bannerFloat = React.useRef(new Animated.Value(0)).current;

  const tabWidth = navWidth > 0 ? navWidth / navItems.length : 0;

  React.useEffect(() => {
    Animated.timing(pillProgress, {
      toValue: navItems.findIndex((item) => item.label === activeTab),
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [activeTab, pillProgress]);

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

  const handleTabPress = (label: string) => {
    setActiveTab(label);

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
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.username}>Welcome back</Text>
          </View>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={18} color="#0F4FA8" />
          </View>
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
          return (
            <Pressable key={item.label} style={styles.navItem} onPress={() => handleTabPress(item.label)}>
              <MaterialCommunityIcons
                name={active ? item.icon : item.iconAlt}
                size={20}
                color={active ? '#0F4FA8' : '#64748B'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
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
    backgroundColor: '#255EC6',
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
    backgroundColor: 'rgba(79,70,229,0.26)',
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
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  optionSub: { marginTop: 3, fontSize: 12, color: '#6B7280', fontWeight: '500' },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
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
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 1 },
  navLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  navLabelActive: { color: '#0F4FA8', fontWeight: '800' },
});

export default HomeScreen;
