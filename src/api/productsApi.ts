import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

// Define the types based on the schema
export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
}

export interface Device {
  id: string;
  brand_id: string;
  model_name: string;
  series: string | null;
  image_url: string | null;
}

export interface Variant {
  id: string;
  device_id: string;
  base_price: number;
  storage_gb: string | null;
  ram_id: string | null; // You might want to join the actual RAM size later
  ram_gb?: number | null;
}

export interface City {
  id: string;
  name: string;
  icon_url: string | null;
}

const getModelTierScore = (modelName: string) => {
  const lowerName = modelName.toLowerCase();

  if (lowerName.includes('ultra')) return 6;
  if (lowerName.includes('pro max')) return 5;
  if (lowerName.includes('pro')) return 4;
  if (lowerName.includes('plus')) return 3;
  if (lowerName.includes('mini')) return 2;
  if (lowerName.includes('se')) return 1;

  return 0;
};

const getModelGenerationScore = (modelName: string) => {
  const numericParts = modelName.match(/\d+/g);
  if (!numericParts?.length) {
    return -1;
  }

  return Math.max(...numericParts.map((part) => Number(part)));
};

const sortDevicesByRecency = (devices: Device[]) => {
  return [...devices].sort((left, right) => {
    const generationDelta =
      getModelGenerationScore(right.model_name) - getModelGenerationScore(left.model_name);

    if (generationDelta !== 0) {
      return generationDelta;
    }

    const tierDelta = getModelTierScore(right.model_name) - getModelTierScore(left.model_name);
    if (tierDelta !== 0) {
      return tierDelta;
    }

    return left.model_name.localeCompare(right.model_name);
  });
};

export const useBrandsQuery = (category: string = 'phone') => useQuery({
  queryKey: ['brands', category],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('category', category)
      .order('name');
    if (error) throw error;
    return data as Brand[];
  },
});

export const useModelsQuery = (brandId: string | null) => useQuery({
  queryKey: ['models', brandId],
  queryFn: async () => {
    if (!brandId) return [];
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('brand_id', brandId);
    if (error) throw error;
    return sortDevicesByRecency(data as Device[]);
  },
  enabled: !!brandId,
});

export const useAllDevicesQuery = () => useQuery({
  queryKey: ['all-devices'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*');
    if (error) throw error;
    return sortDevicesByRecency(data as Device[]);
  },
});

export const useCitiesQuery = () => useQuery({
  queryKey: ['cities'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name, icon_url')
      .range(0, 199)
      .order('name');
    if (error) throw error;
    return data as City[];
  },
});

export const useVariantsQuery = (deviceId: string | null) => useQuery({
  queryKey: ['variants', deviceId],
  queryFn: async () => {
    if (!deviceId) return [];
    const { data, error } = await supabase
      .from('variants')
      .select(`
        id, 
        device_id, 
        base_price, 
        storage_gb,
        ram_id,
        ram_options ( size_gb )
      `)
      .eq('device_id', deviceId)
      .order('base_price');
    if (error) throw error;
    return data.map((v: any) => ({
      ...v,
      ram_gb: v.ram_options ? v.ram_options.size_gb : null
    }));
  },
  enabled: !!deviceId,
});
