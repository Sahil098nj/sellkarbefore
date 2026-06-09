import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';
import { useLiveVariantsQuery, Variant } from '../api/productsApi';

type VariantSelectionScreenRouteProp = RouteProp<RootStackParamList, 'VariantSelection'>;

const VariantSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<VariantSelectionScreenRouteProp>();
  const { modelId, modelName, brandName, category } = route.params ?? {};

  const variantsQuery = useLiveVariantsQuery(modelId);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const variants: Variant[] = [...(variantsQuery.data ?? [])].sort((left, right) => {
    const parseStorage = (value: string | null) => {
      if (!value) return 0;
      const normalized = value.toLowerCase();
      if (normalized.includes('tb')) {
        return Number(normalized.replace(/[^0-9.]/g, '')) * 1024;
      }
      return Number(normalized.replace(/[^0-9.]/g, ''));
    };

    return parseStorage(left.storage_gb) - parseStorage(right.storage_gb);
  });

  if (variantsQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.backIcon}>‹</Text>
        <View style={styles.topCopy}>
          <Text style={styles.stepText}>STEP 3 OF 5</Text>
          <Text style={styles.title}>Select Variant</Text>
        </View>
        <Text style={styles.helpIcon}>?</Text>
      </View>

      <View style={styles.breadcrumbs}>
        <Text style={styles.breadcrumbText}>{brandName ?? 'Brand'}</Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbText}>{modelName}</Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbActive}>Variant</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>STORAGE / VARIANT</Text>
        <View style={styles.requiredBadge}>
          <Text style={styles.requiredText}>Required</Text>
        </View>
      </View>

      <FlatList
        data={variants}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ⓘ  Don't see your variant?</Text>
            <Text style={styles.infoText}>Check your phone's Settings &gt; General &gt; About to confirm your exact storage capacity.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No variants found for this model.</Text>
          </View>
        }
        renderItem={({ item: variant }) => {
          const isActive = selectedVariant?.id === variant.id;
          const storageLabel = variant.storage_gb
            ? variant.storage_gb.toUpperCase().replace('GB', ' GB').replace('TB', ' TB')
            : 'Base Variant';
          const displayVariant = variant.ram_gb
            ? `${storageLabel} / ${variant.ram_gb} GB RAM`
            : storageLabel;

          return (
            <Pressable
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => {
                setSelectedVariant(variant);
                navigation.navigate('CitySelection', { variant, modelName, brandName, category });
              }}
            >
              <Text style={[styles.cardText, isActive && styles.cardTextActive]}>
                {displayVariant}
              </Text>
              <Text style={styles.priceText}>Up to ₹{variant.base_price.toLocaleString('en-IN')}</Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 3,
    borderBottomColor: '#1D5FBF',
    paddingBottom: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#334155',
    width: 28,
  },
  topCopy: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D5FBF',
    letterSpacing: 1,
  },
  helpIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#64748B',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontWeight: '700',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  breadcrumbText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  breadcrumbDivider: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  breadcrumbActive: {
    color: '#1D5FBF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EAF2FF',
  },
  requiredText: {
    color: '#1D5FBF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  list: {
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minHeight: 90,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActive: {
    borderColor: '#1D5FBF',
    backgroundColor: '#EAF2FF',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTextActive: {
    color: '#1D5FBF',
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  infoCard: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D5E5FF',
    padding: 14,
  },
  infoTitle: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '800',
  },
  infoText: {
    marginTop: 6,
    color: '#2563EB',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
});

export default VariantSelectionScreen;