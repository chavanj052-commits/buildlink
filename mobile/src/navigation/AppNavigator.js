import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import CompanyNavigator from './CompanyTabs';
import HomeownerNavigator from './HomeownerTabs';
import ContractorNavigator from './ContractorTabs';
import { theme } from '../theme';

export const AppNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Initializing BuildLink...</Text>
      </View>
    );
  }

  const renderRoleNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthStack />;
    }

    switch (user.role) {
      case 'homeowner':
        return <HomeownerNavigator />;
      case 'contractor':
        return <ContractorNavigator />;
      case 'company':
      default:
        return <CompanyNavigator />;
    }
  };

  return <NavigationContainer>{renderRoleNavigator()}</NavigationContainer>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginTop: theme.spacing.md,
  },
});

export default AppNavigator;
