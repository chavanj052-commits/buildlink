import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../api';
import { ENV_CONFIG } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(ENV_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(ENV_CONFIG.STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token in background
        try {
          const freshUser = await AuthService.getMe();
          if (freshUser && freshUser.id) {
            setUser((prev) => ({ ...prev, ...freshUser }));
            await AsyncStorage.setItem(
              ENV_CONFIG.STORAGE_KEYS.USER_DATA,
              JSON.stringify({ ...JSON.parse(storedUser), ...freshUser })
            );
          }
        } catch (err) {
          console.log('Background auth verification note:', err.message);
        }
      }
    } catch (e) {
      console.warn('Failed to restore auth from storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      if (data && data.token) {
        await AsyncStorage.setItem(ENV_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
        await AsyncStorage.setItem(ENV_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error('Invalid login response');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await AuthService.register(name, email, password, role);
      return { success: true, data: res };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(ENV_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(ENV_CONFIG.STORAGE_KEYS.USER_DATA);
      setToken(null);
      setUser(null);
    } catch (e) {
      console.warn('Logout error:', e);
    }
  };

  // Quick switch role helper for live testing and previewing all 3 role perspectives
  const quickSwitchRole = async (newRole) => {
    const demoUsers = {
      company: {
        id: 1,
        name: 'John Construct',
        email: 'john@buildlink.com',
        role: 'company',
      },
      homeowner: {
        id: 2,
        name: 'Sarah Sharma',
        email: 'sarah@homeowner.com',
        role: 'homeowner',
      },
      contractor: {
        id: 3,
        name: 'Ramesh Patel',
        email: 'ramesh@contractor.com',
        role: 'contractor',
      },
    };

    const targetUser = demoUsers[newRole] || demoUsers.company;
    const fakeToken = 'demo-jwt-token-' + newRole;
    await AsyncStorage.setItem(ENV_CONFIG.STORAGE_KEYS.AUTH_TOKEN, fakeToken);
    await AsyncStorage.setItem(ENV_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(targetUser));
    setToken(fakeToken);
    setUser(targetUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickSwitchRole,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
