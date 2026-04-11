import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAsyncItem = async (key: string, value: string | object): Promise<void> => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`Error setting AsyncStorage item ${key}:`, error);
  }
};

export const getAsyncItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting AsyncStorage item ${key}:`, error);
    return null;
  }
};

export const getAsyncJSON = async (key: string): Promise<any> => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting AsyncStorage JSON item ${key}:`, error);
    return null;
  }
};

export const removeAsyncItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing AsyncStorage item ${key}:`, error);
  }
};

export const clearAllAsyncStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};
