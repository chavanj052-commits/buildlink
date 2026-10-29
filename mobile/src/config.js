import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL selection options
// - 'android_emulator': 'http://10.0.2.2:5000/api'
// - 'ios_simulator': 'http://localhost:5000/api'
// - 'physical_device': 'http://<your-ip>:5000/api'
// Default auto-detects platform
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const ENV_CONFIG = {
  DEFAULT_BASE_URL: `${DEFAULT_HOST}/api`,
  DEFAULT_SOCKET_URL: DEFAULT_HOST,
  STORAGE_KEYS: {
    AUTH_TOKEN: 'buildlink_auth_token',
    USER_DATA: 'buildlink_user_data',
    CUSTOM_API_URL: 'buildlink_custom_api_url',
  },
  CURRENCY_SYMBOL: '₹',
  APP_NAME: 'BuildLink',
  VERSION: '1.0.0',
};

// Runtime dynamic base URL getter & setter
let currentBaseUrl = ENV_CONFIG.DEFAULT_BASE_URL;
let currentSocketUrl = ENV_CONFIG.DEFAULT_SOCKET_URL;

export const getBaseUrl = async () => {
  try {
    const savedUrl = await AsyncStorage.getItem(ENV_CONFIG.STORAGE_KEYS.CUSTOM_API_URL);
    if (savedUrl) {
      currentBaseUrl = savedUrl;
      currentSocketUrl = savedUrl.replace(/\/api\/?$/, '');
    }
  } catch (err) {
    console.warn('Error reading custom API URL from storage:', err);
  }
  return currentBaseUrl;
};

export const setCustomBaseUrl = async (newUrl) => {
  if (!newUrl) return;
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  const apiUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  const socketUrl = cleanUrl.replace(/\/api\/?$/, '');
  currentBaseUrl = apiUrl;
  currentSocketUrl = socketUrl;
  await AsyncStorage.setItem(ENV_CONFIG.STORAGE_KEYS.CUSTOM_API_URL, apiUrl);
};

export const resetBaseUrl = async () => {
  currentBaseUrl = ENV_CONFIG.DEFAULT_BASE_URL;
  currentSocketUrl = ENV_CONFIG.DEFAULT_SOCKET_URL;
  await AsyncStorage.removeItem(ENV_CONFIG.STORAGE_KEYS.CUSTOM_API_URL);
};

export const getSocketUrl = () => currentSocketUrl;

export default ENV_CONFIG;
