import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  Brand: { category?: string };
  ModelVariant: { brandId: string; brandName?: string };
  VariantSelection: { modelId: string; modelName: string; brandName?: string };
  CitySelection: { variant: any; modelName: string };
  DeviceQuestions: { variant: any; modelName: string; city: string };
  BasePrice: { variant: any; questions?: any; city?: string };
  Condition: { variant: any; questions?: any; city?: string };
  Accessories: { variant: any; conditionData?: any };
  Auth: { variant: any; conditionData?: any; accessoriesData?: string[] };
  PriceUnlock: { variant: any; conditionData?: any; accessoriesData?: any };
  AddressPickup: {
    variant: any;
    city?: string;
    finalPrice?: number;
    conditionData?: any;
    accessoriesData?: any;
    deviceConditionDetails?: any;
  };
  TrackOrder: {
    orderId?: string;
    status?: 'scheduled' | 'picked' | 'completed';
    variant?: any;
    finalPrice?: number;
    pickupDateLabel?: string;
    pickupTime?: string;
    city?: string;
    address?: string;
  } | undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
