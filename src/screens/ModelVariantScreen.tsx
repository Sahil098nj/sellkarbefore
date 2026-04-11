import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants';
import type { RootStackNavigationProp, RootStackParamList } from '../navigation/types';
import { useModelsQuery, Device } from '../api/productsApi';
import SkeletonBlock from '../components/SkeletonBlock';

type ModelVariantScreenRouteProp = RouteProp<RootStackParamList, 'ModelVariant'>;

const ModelVariantScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<ModelVariantScreenRouteProp>();
  const { brandId, brandName } = route.params;

  const [search, setSearch] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const modelsQuery = useModelsQuery(brandId);
  const models: Device[] = modelsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return models;
    return models.filter((item) => item.model_name.toLowerCase().includes(q));
  }, [models, search]);

  const handleSelectModel = useCallback((model: Device) => {
    setSelectedModelId(model.id);
    navigation.navigate('VariantSelection', {
      modelId: model.id,
      modelName: model.model_name,
      brandName,
    });
  }, [brandName, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={modelsQuery.isLoading ? Array.from({ length: 9 }) : filtered}
        keyExtractor={(item: { id?: string }, index: number) => {
          if (item && typeof item === 'object' && 'id' in item && item.id) {
            return item.id;
          }
          return `skeleton-${index}`;
        }}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={styles.modelsGridRow}
        ListHeaderComponent={(
          <>
            <Text style={styles.title}>Select Model</Text>
            <Text style={styles.subtitle}>Choose your device model</Text>
            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color="#64748B" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholder="Search model"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </>
        )}
        renderItem={({ item }: { item: Device }) => {
          if (modelsQuery.isLoading) {
            return (
              <View style={styles.modelCard}>
                <SkeletonBlock width="100%" height={72} borderRadius={12} />
                <SkeletonBlock width="75%" height={12} style={{ marginTop: 10 }} />
              </View>
            );
          }

          const model = item;
          const selected = selectedModelId === model.id;
          const imageBroken = failedImages[model.id] === true;

          return (
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [styles.modelCard, selected && styles.modelCardActive, pressed && styles.modelCardPressed]}
              onPress={() => handleSelectModel(model)}
            >
              {model.image_url && !imageBroken ? (
                <Image
                  source={{ uri: model.image_url }}
                  style={styles.modelImage}
                  resizeMode="contain"
                  onError={() => setFailedImages((prev) => ({ ...prev, [model.id]: true }))}
                />
              ) : (
                <View style={styles.modelImageFallback}>
                  <MaterialCommunityIcons name="cellphone" size={24} color="#1D4ED8" />
                </View>
              )}
              <Text style={styles.modelText} numberOfLines={2}>{model.model_name}</Text>
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
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.BLACK,
  },
  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 13,
  },
  searchWrap: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DFEC',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
  scrollContent: {
    paddingBottom: 120,
  },
  modelsGridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modelCard: {
    width: '31.5%',
    minHeight: 136,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  modelCardActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#EAF2FF',
  },
  modelCardPressed: {
    transform: [{ scale: 0.96 }],
  },
  modelImage: {
    width: '100%',
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modelImageFallback: {
    width: '100%',
    height: 72,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelText: {
    marginTop: 8,
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ModelVariantScreen;
