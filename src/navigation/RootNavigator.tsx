import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';

const navTheme = {
  dark: false,
  colors: {
    primary: Colors.primary,
    background: Colors.surface,
    card: Colors.surfaceContainerLowest,
    text: Colors.onSurface,
    border: 'transparent',
    notification: Colors.error,
  },
  fonts: {
    regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
    bold: { fontFamily: 'Manrope_700Bold', fontWeight: '700' as const },
    heavy: { fontFamily: 'Manrope_800ExtraBold', fontWeight: '800' as const },
  },
};

export function RootNavigator() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isHydrating = useAppStore((s) => s.isHydrating);
  if (isHydrating) return null;
  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
