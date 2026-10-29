import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/contractor/DashboardScreen';
import ProjectsScreen from '../screens/company/ProjectsScreen';
import MaterialsScreen from '../screens/contractor/MaterialsScreen';
import PaymentsScreen from '../screens/contractor/PaymentsScreen';
import MessagesScreen from '../screens/shared/MessagesScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import ProjectDetailScreen from '../screens/company/ProjectDetailScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ContractorBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: theme.colors.primary,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'ContractorDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ContractorProjects') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'MaterialsTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'PaymentsTab') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'MessagesTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ContractorDashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ContractorProjects"
        component={ProjectsScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen
        name="MaterialsTab"
        component={MaterialsScreen}
        options={{ tabBarLabel: 'Materials' }}
      />
      <Tab.Screen
        name="PaymentsTab"
        component={PaymentsScreen}
        options={{ tabBarLabel: 'Payouts' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const ContractorNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContractorTabs" component={ContractorBottomTabs} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
};

export default ContractorNavigator;
