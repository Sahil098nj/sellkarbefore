export const COLORS = {
  PRIMARY: '#004AAD',
  SECONDARY: '#F97316',
  BACKGROUND: '#F8FAFC',
  WHITE: '#FFFFFF',
  BLACK: '#0F172A',
  GRAY_LIGHT: '#E2E8F0',
  GRAY_DARK: '#475569',
  SUCCESS: '#22C55E',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
};

export const TYPOGRAPHY = {
  H1: {
    FONT_SIZE: 32,
    FONT_WEIGHT: '700' as const,
  },
  H2: {
    FONT_SIZE: 24,
    FONT_WEIGHT: '700' as const,
  },
  BODY: {
    FONT_SIZE: 14,
    FONT_WEIGHT: '400' as const,
  },
};

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
};

export const API_BASE_URL = 'https://api.sellkarinda.com';

export const NAVIGATION_ROUTES = {
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  HOME: 'Home',
  BRAND: 'Brand',
  MODEL_VARIANT: 'ModelVariant',
  VARIANT_SELECTION: 'VariantSelection',
  CITY_SELECTION: 'CitySelection',
  DEVICE_QUESTIONS: 'DeviceQuestions',
  BASE_PRICE: 'BasePrice',
  CONDITION: 'Condition',
  ACCESSORIES: 'Accessories',
  AUTH: 'Auth',
  PRICE_UNLOCK: 'PriceUnlock',
  ADDRESS_PICKUP: 'AddressPickup',
  TRACK_ORDER: 'TrackOrder',
  ORDERS: 'Orders',
  PROFILE: 'Profile',
};
