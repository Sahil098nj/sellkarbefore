import Config from 'react-native-config';

export const loadConfig = () => {
  if (__DEV__) {
    console.log('Environment configuration loaded');
  }
};

export const getConfig = () => {
  return {
    SUPABASE_URL: Config.SUPABASE_URL,
    SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY,
    FIREBASE_CONFIG: Config.FIREBASE_CONFIG,
  };
};
