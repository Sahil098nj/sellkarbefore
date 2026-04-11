import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, NAVIGATION_ROUTES } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';

type BasePriceScreenRouteProp = RouteProp<RootStackParamList, 'BasePrice'>;

const diagnostics = [
  'Screen condition',
  'Touch response',
  'Camera & speakers',
  'Battery health',
  'Network & sensors',
];

const BasePriceScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<BasePriceScreenRouteProp>();
  const { variant } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Base Price</Text>
        <Text style={styles.subtitle}>We start with the best market value</Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Estimated Price</Text>
          <Text style={styles.priceValue}>₹ {variant?.base_price?.toLocaleString('en-IN') || '0'}</Text>
          <Text style={styles.priceNote}>Diagnostics will adjust the final offer.</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Diagnostics</Text>
        {diagnostics.map((item) => (
          <View key={item} style={styles.diagnosticItem}>
            <View style={styles.check} />
            <Text style={styles.diagnosticText}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={styles.nextButton}
        onPress={() => navigation.navigate('Condition', { variant })}
      >
        <Text style={styles.nextText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.GRAY_DARK,
  },
  priceCard: {
    marginTop: 20,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 24,
    padding: 20,
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  priceValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  priceNote: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '700',
  },
  diagnosticItem: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.WHITE,
    padding: 14,
    borderRadius: 16,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.SUCCESS,
  },
  diagnosticText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  nextButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default BasePriceScreen;
