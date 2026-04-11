import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'SellkarIndia';

export const saveCredentials = async (username: string, password: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(username, password, {
      service: SERVICE_NAME,
    });
  } catch (error) {
    console.error('Error saving credentials to Keychain:', error);
  }
};

export const getCredentials = async (): Promise<{ username: string; password: string } | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    return credentials || null;
  } catch (error) {
    console.error('Error retrieving credentials from Keychain:', error);
    return null;
  }
};

export const deleteCredentials = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: SERVICE_NAME,
    });
  } catch (error) {
    console.error('Error deleting credentials from Keychain:', error);
  }
};

export const saveToken = async (token: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword('auth_token', token, {
      service: SERVICE_NAME,
    });
  } catch (error) {
    console.error('Error saving token to Keychain:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error('Error retrieving token from Keychain:', error);
    return null;
  }
};
