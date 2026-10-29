import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/company/DashboardScreen';
import ProjectsScreen from '../screens/company/ProjectsScreen';
import MaterialsScreen from '../screens/contractor/MaterialsScreen';
import MessagesScreen from '../screens/shared/MessagesScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import ProjectDetailScreen from '../screens/company/ProjectDetailScreen';
import CreateProjectScreen from '../screens/company/CreateProjectScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CompanyBottomTabs = () => {
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
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProjectsTab') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'MaterialsTab') {
            iconName = focused ? 'cube' : 'cube-outline';
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
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsScreen}
        options={{ tabBarLabel: 'Projects' }}
      />
      <Tab.Screen
        name="MaterialsTab"
        component={MaterialsScreen}
        options={{ tabBarLabel: 'Materials' }}
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

export const CompanyNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CompanyTabs" component={CompanyBottomTabs} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
    </Stack.Navigator>
  );
};

export default CompanyNavigator;
