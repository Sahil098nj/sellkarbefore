import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';
import { useLiveBrandsQuery, Brand } from '../api/productsApi';

type BrandScreenRouteProp = RouteProp<RootStackParamList, 'Brand'>;

const BrandScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<BrandScreenRouteProp>();

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [search, setSearch] = useState('');

  const category = typeof route.params?.category === 'string' ? route.params.category : 'phone';
  const brandsQuery = useLiveBrandsQuery(category);

  const getBrandIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('apple')) return 'apple';
    if (lower.includes('samsung')) return 'cellphone';
    if (lower.includes('oneplus')) return 'numeric-1-circle-outline';
    if (lower.includes('xiaomi') || lower.includes('mi') || lower.includes('redmi')) return 'alpha-x-circle-outline';
    if (lower.includes('realme')) return 'alpha-r-circle-outline';
    if (lower.includes('oppo')) return 'alpha-o-circle-outline';
    if (lower.includes('vivo')) return 'alpha-v-circle-outline';
    if (lower.includes('google') || lower.includes('pixel')) return 'google';
    if (lower.includes('nothing')) return 'circle-outline';
    return 'tag-outline';
  };

  const filteredBrands = useMemo(() => {
    const list = brandsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [brandsQuery.data, search]);

  const listData = useMemo<Array<Brand | null>>(() => {
    if (brandsQuery.isLoading) {
      return Array.from({ length: 12 }, () => null);
    }
    return filteredBrands;
  }, [brandsQuery.isLoading, filteredBrands]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={(item: Brand | null, index: number) => {
          if (item?.id) {
            return item.id;
          }
          return `skeleton-${index}`;
        }}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View style={styles.stickyWrap}>
            <Text style={styles.title}>Select {category.charAt(0).toUpperCase() + category.slice(1)} Brand</Text>
            <Text style={styles.subtitle}>Choose your {category} brand</Text>

            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search brands"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {brandsQuery.isError ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.errorText}>Unable to load brands. Please try again.</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !brandsQuery.isLoading ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="store-search-outline" size={22} color="#9CA3AF" />
              <Text style={styles.emptyText}>No brands found for this category.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }: { item: Brand | null }) => {
          if (!item) {
            return (
              <View style={styles.card}>
                <View style={styles.skeletonLogo} />
                <View style={styles.skeletonText} />
              </View>
            );
          }

          const brand = item;
          const isActive = selectedBrand?.id === brand.id;
          const logoUri = typeof brand.logo_url === 'string' ? encodeURI(brand.logo_url.trim()) : '';

          return (
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.card,
                isActive && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                setSelectedBrand(brand);
                
                // Check if this is a non-Apple laptop - use simplified flow
                const isLaptop = category === 'laptop';
                const isApple = /apple|macbook|imac|mac/i.test(brand.name);
                
                if (isLaptop && !isApple) {
                  // Non-Apple laptops: Simplified flow - go directly to city selection
                  navigation.navigate('CitySelection', { 
                    brandId: brand.id, 
                    brandName: brand.name,
                    isSimplifiedLaptop: true 
                  });
                } else {
                  // Apple laptops, all iPads, and phones: Full flow
                  navigation.navigate('ModelVariant', { brandId: brand.id, brandName: brand.name, category });
                }
              }}
            >
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.logoFallback}>
                  <MaterialCommunityIcons name={getBrandIcon(brand.name)} size={22} color="#2563EB" />
                </View>
              )}

              <Text style={[styles.cardText, isActive && styles.cardTextActive]} numberOfLines={2}>
                {brand.name}
              </Text>
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
    backgroundColor: '#F3F7FC',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  stickyWrap: {
    backgroundColor: '#F3F7FC',
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.BLACK,
  },
  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  searchWrap: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5DFEC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    minHeight: 46,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 120,
    gap: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 128,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  cardActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#EAF2FF',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginBottom: 10,
  },
  skeletonLogo: {
    width: '85%',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  skeletonText: {
    width: '60%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
  },
  cardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  cardTextActive: {
    color: COLORS.PRIMARY,
  },
  errorBox: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  emptyBox: {
    marginTop: 18,
    marginHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BrandScreen;
