import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Debug: undefined;
  Onboarding: undefined;
  Home: undefined;
  Brand: { category?: string };
  ModelVariant: { brandId: string; brandName?: string; category?: string };
  VariantSelection: { modelId: string; modelName: string; brandName?: string; category?: string };
  CitySelection: { variant?: any; modelName?: string; brandName?: string; brandId?: string; isSimplifiedLaptop?: boolean; category?: string };
  DeviceQuestions: { variant?: any; modelName?: string; city?: string; brandName?: string; category?: string };
  BasePrice: { variant: any; questions?: any; city?: string; category?: string };
  Condition: { variant: any; questions?: any; city?: string; modelName?: string; brandName?: string; category?: string };
  Accessories: { variant: any; conditionData?: any; questions?: any; city?: string; modelName?: string; brandName?: string; category?: string };
  Auth: { variant?: any; conditionData?: any; accessoriesData?: string[]; questions?: any; city?: string; modelName?: string; brandName?: string; category?: string } | undefined;
  PriceUnlock: { variant: any; conditionData?: any; accessoriesData?: any; questions?: any; city?: string; modelName?: string; brandName?: string; category?: string };
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
    trackingId?: string;
    status?:
      | 'scheduled'
      | 'picked'
      | 'completed'
      | 'new'
      | 'rnr'
      | 'not-interested'
      | 'rescheduled'
      | 'in-progress'
      | 'cancelled'
      | 'pending'
      | 'confirmed'
      | 'in-transit';
    variant?: any;
    finalPrice?: number;
    pickupDateLabel?: string;
    pickupTime?: string;
    city?: string;
    address?: string;
  } | undefined;
  Orders: undefined;
  Profile: undefined;
  Leads: undefined;
  PickupRequests: undefined;
  PrivacyPolicy: undefined;
  AboutUs: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
