import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

const useSupabaseRealtimeInvalidation = ({
  table,
  queryKey,
  filter,
  enabled = true,
}: {
  table: string;
  queryKey: readonly unknown[];
  filter?: string;
  enabled?: boolean;
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channelName = [
      'rt',
      table,
      ...queryKey.map((value) => String(value)),
      filter ?? 'all',
    ].join(':');

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...queryKey] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, filter, queryClient, queryKey, table]);
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

export const useLiveBrandsQuery = (category: string = 'phone') => {
  const query = useBrandsQuery(category);

  useSupabaseRealtimeInvalidation({
    table: 'brands',
    queryKey: ['brands', category],
    filter: `category=eq.${category}`,
  });

  return query;
};

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

export const useLiveModelsQuery = (brandId: string | null) => {
  const query = useModelsQuery(brandId);

  useSupabaseRealtimeInvalidation({
    table: 'devices',
    queryKey: ['models', brandId],
    filter: brandId ? `brand_id=eq.${brandId}` : undefined,
    enabled: !!brandId,
  });

  return query;
};

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

export const useLiveAllDevicesQuery = () => {
  const query = useAllDevicesQuery();

  useSupabaseRealtimeInvalidation({
    table: 'devices',
    queryKey: ['all-devices'],
  });

  return query;
};

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

export const useLiveCitiesQuery = () => {
  const query = useCitiesQuery();

  useSupabaseRealtimeInvalidation({
    table: 'cities',
    queryKey: ['cities'],
  });

  return query;
};

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

export const useLiveVariantsQuery = (deviceId: string | null) => {
  const query = useVariantsQuery(deviceId);

  useSupabaseRealtimeInvalidation({
    table: 'variants',
    queryKey: ['variants', deviceId],
    filter: deviceId ? `device_id=eq.${deviceId}` : undefined,
    enabled: !!deviceId,
  });

  return query;
};

// ── Warranty Prices: live pricing by variant ─────────────────────────────────

export interface WarrantyPriceRow {
  id: string;
  variant_id: string;
  price_0_3_months: number;
  price_3_6_months: number;
  price_6_11_months: number;
  price_11_plus_months: number;
  created_at: string;
  charger_deduction_amount: number;
  box_deduction_amount: number;
  bill_deduction_amount: number;
  notes: string | null;
  phoneconditiondeduction_good: number;
  phoneconditiondeduction_average: number;
  phoneconditiondeduction_belowaverage: number;
  call_deduction_percentage: number;
  touch_deduction_percentage: number;
  screen_deduction_percentage: number;
  battery_deduction_percentage: number;
}

export const useWarrantyPricesQuery = (variantId: string | null) =>
  useQuery({
    queryKey: ['warranty-prices', variantId],
    queryFn: async () => {
      if (!variantId) return null;
      const { data, error } = await supabase
        .from('warranty_prices')
        .select('*')
        .eq('variant_id', variantId)
        .maybeSingle();
      if (error) throw error;
      return data as WarrantyPriceRow | null;
    },
    enabled: !!variantId,
  });

export const useLiveWarrantyPricesQuery = (variantId: string | null) => {
  const query = useWarrantyPricesQuery(variantId);

  useSupabaseRealtimeInvalidation({
    table: 'warranty_prices',
    queryKey: ['warranty-prices', variantId],
    filter: variantId ? `variant_id=eq.${variantId}` : undefined,
    enabled: !!variantId,
  });

  return query;
};

// ── Laptop Prices: separate pricing table for laptops ────────────────────────

export interface LaptopPriceRow {
  id: string;
  variant_id: string;
  price_less_than_1yr: number;
  price_1_to_3yrs: number;
  price_more_than_3yrs: number;
  condition_deduction_good: number;      // percentage to deduct for "good"
  condition_deduction_average: number;   // percentage to deduct for "average"
  condition_deduction_below_average: number; // percentage to deduct for "below average"
  charger_deduction_amount: number;      // rupees to deduct if no charger
  box_deduction_amount: number;          // rupees to deduct if no box
  bill_deduction_amount: number;        // rupees to deduct if no bill
  created_at: string;
}

export const useLaptopPricesQuery = (variantId: string | null) =>
  useQuery({
    queryKey: ['laptop-prices', variantId],
    queryFn: async () => {
      if (!variantId) return null;
      const { data, error } = await supabase
        .from('laptop_prices')
        .select('*')
        .eq('variant_id', variantId)
        .maybeSingle();
      if (error) {
        console.warn('[laptop-prices] Query failed:', error.message);
        return null;
      }
      return data as LaptopPriceRow | null;
    },
    enabled: !!variantId,
  });

export const useLiveLaptopPricesQuery = (variantId: string | null) => {
  const query = useLaptopPricesQuery(variantId);

  useSupabaseRealtimeInvalidation({
    table: 'laptop_prices',
    queryKey: ['laptop-prices', variantId],
    filter: variantId ? `variant_id=eq.${variantId}` : undefined,
    enabled: !!variantId,
  });

  return query;
};
