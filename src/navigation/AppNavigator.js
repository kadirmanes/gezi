import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

// Route names — centralized to avoid magic strings
export const Routes = {
  ONBOARDING: 'Onboarding',
  DASHBOARD: 'Dashboard',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Routes.ONBOARDING}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F5F0E8' },
        }}
      >
        <Stack.Screen
          name={Routes.ONBOARDING}
          component={OnboardingScreen}
        />
        <Stack.Screen
          name={Routes.DASHBOARD}
          component={DashboardScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
