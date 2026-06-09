import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';
import { useLiveCitiesQuery } from '../api/productsApi';

type CitySelectionScreenRouteProp = RouteProp<RootStackParamList, 'CitySelection'>;
type CityListItem = { id: string; name: string; icon_url?: string | null } | null;

const CitySelectionScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<CitySelectionScreenRouteProp>();
  const { variant, modelName, brandName, isSimplifiedLaptop, brandId, category } = route.params ?? {};
  const [search, setSearch] = useState('');
  const [failedIcons, setFailedIcons] = useState<Record<string, true>>({});

  const { data: cities = [], isLoading, isError, error } = useLiveCitiesQuery();

  const filteredCities = useMemo(() => {
    const lower = search.trim().toLowerCase();
    const base = cities.filter((city) => {
      const name = city.name.toLowerCase();
      return !name.includes('not listed') && !name.includes('not selected');
    });
    if (!lower) return base;
    return base.filter((city) => city.name.toLowerCase().includes(lower));
  }, [cities, search]);

  const listData = useMemo<CityListItem[]>(() => {
    if (isLoading) {
      return Array.from({ length: 8 }, () => null);
    }
    return filteredCities;
  }, [isLoading, filteredCities]);

  const getCityFallbackIcon = (cityName: string) => {
    const normalized = cityName.trim().toLowerCase();
    if (normalized.includes('mumbai')) return 'ferry';
    if (normalized.includes('chandigarh')) return 'office-building-marker-outline';
    if (normalized.includes('delhi')) return 'city-variant-outline';
    if (normalized.includes('bangalore') || normalized.includes('bengaluru')) return 'office-building-outline';
    return 'map-marker-city';
  };

  const handleSelectCity = (cityName: string) => {
    if (isSimplifiedLaptop && brandId && brandName) {
      // Simplified flow for non-Apple laptops: go directly to Auth
      navigation.navigate('Auth', { 
        city: cityName, 
        brandName 
      });
    } else {
      // Full flow: go to DeviceQuestions
      navigation.navigate('DeviceQuestions', { variant, modelName, city: cityName, brandName, category });
    }
  };

  const handleCurrentLocation = () => {
    const pick = cities.find((city) => city.name.toLowerCase().includes('mumbai')) ?? cities[0];
    handleSelectCity(pick?.name ?? '');
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={(item: CityListItem, index: number) => {
          if (item?.id) {
            return item.id;
          }
          return `skeleton-${index}`;
        }}
        numColumns={2}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Select Your City</Text>
            <Text style={styles.subtitle}>Where should we pick up your device?</Text>

            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities"
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {isError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>Unable to load cities from database.</Text>
                <Text style={styles.cityHint}>{error instanceof Error ? error.message : 'Please try again.'}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No cities found.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          !isLoading ? (
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [styles.notListedItem, pressed && styles.cardPressed]}
              onPress={() => handleSelectCity('')}
            >
              <View style={[styles.cityImage, styles.cityFallback]}>
                <MaterialCommunityIcons name="map-marker-question-outline" size={22} color={COLORS.PRIMARY} />
              </View>
              <View style={styles.cityTextContainer}>
                <Text style={styles.cityText}>My city is not listed</Text>
                <Text style={styles.cityHint}>Select this if not available</Text>
              </View>
            </Pressable>
          ) : null
        }
        renderItem={({ item }: { item: CityListItem }) => {
          if (!item) {
            return (
              <View style={styles.cityItem}>
                <View style={styles.citySkeletonIcon} />
                <View style={styles.citySkeletonText} />
              </View>
            );
          }

          const city = item;
          const iconBroken = failedIcons[city.id] === true;

          return (
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [styles.cityItem, pressed && styles.cardPressed]}
              onPress={() => handleSelectCity(city.name)}
            >
              <View style={styles.cityGlow} />
              {city.icon_url && !iconBroken ? (
                <Image
                  source={{ uri: city.icon_url }}
                  style={styles.cityImage}
                  onError={() => setFailedIcons((prev) => ({ ...prev, [city.id]: true }))}
                />
              ) : (
                <View style={[styles.cityImage, styles.cityFallback]}>
                  <MaterialCommunityIcons
                    name={getCityFallbackIcon(city.name)}
                    size={22}
                    color={COLORS.PRIMARY}
                  />
                </View>
              )}

              <View style={styles.cityTextContainer}>
                <Text style={styles.cityText} numberOfLines={2}>{city.name}</Text>
              </View>
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
  headerWrap: {
    backgroundColor: '#F3F7FC',
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.BLACK,
  },
  subtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 13,
  },
  searchWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D5DFEC',
    backgroundColor: '#FFFFFF',
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
    fontWeight: '600',
  },
  currentLocation: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currentLocationText: {
    color: '#0F4FA8',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    marginTop: 8,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cityItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 4,
    minHeight: 120,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cityGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(96,165,250,0.15)',
  },
  cityImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 10,
  },
  citySkeletonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 10,
    backgroundColor: '#E2E8F0',
  },
  citySkeletonText: {
    width: '70%',
    height: 12,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#E2E8F0',
  },
  cityFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F0FF',
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
  },
  notListedItem: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cityTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  cityHint: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    color: COLORS.GRAY_DARK,
  },
  errorBox: {
    marginTop: 10,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    color: COLORS.ERROR,
    fontWeight: '700',
  },
});

export default CitySelectionScreen;
