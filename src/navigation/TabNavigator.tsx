import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TabParamList, PropertiesStackParamList } from '../types/navigation';
import { useTheme } from '../constants/theme';
import { FontFamily, FontSize } from '../constants/typography';
import { Shadow } from '../constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../hooks/useTranslation';
import type { StringKey } from '../i18n/strings';

// Screens
import { PropertiesScreen } from '../screens/properties/PropertiesScreen';
import { PropertyDetailScreen } from '../screens/properties/PropertyDetailScreen';
import { AddContractMethodScreen } from '../screens/contract/AddContractMethodScreen';
import { AddNewContractScreen } from '../screens/contract/AddNewContractScreen';
import { ForecastScreen } from '../screens/forecast/ForecastScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const PropertiesStack = createNativeStackNavigator<PropertiesStackParamList>();

function PropertiesNavigator() {
  return (
    <PropertiesStack.Navigator screenOptions={{ headerShown: false }}>
      <PropertiesStack.Screen name="PropertiesList" component={PropertiesScreen} />
      <PropertiesStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <PropertiesStack.Screen name="AddContractMethod" component={AddContractMethodScreen} />
      <PropertiesStack.Screen name="AddNewContract" component={AddNewContractScreen} />
    </PropertiesStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  PropertiesTab: '🏠',
  ReportsTab: '📊',
  ProfileTab: '👤',
};

const TAB_LABEL_KEYS: Record<string, StringKey> = {
  PropertiesTab: 'nav.properties',
  ReportsTab: 'nav.reports',
  ProfileTab: 'nav.profile',
};

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: theme.surfaceContainerLowest,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <View style={styles.tabItem}>
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {TAB_ICONS[route.name]}
            </Text>
            <Text
              style={[
                styles.tabLabel,
                { color: theme.onSurfaceVariant },
                focused && [styles.tabLabelActive, { color: theme.primary }],
              ]}
            >
              {t(TAB_LABEL_KEYS[route.name])}
            </Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="PropertiesTab" component={PropertiesNavigator} />
      <Tab.Screen name="ReportsTab" component={ForecastScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    ...Shadow.bottomNav,
  },
  tabItem: {
    alignItems: 'center',
    marginTop: 10,
    minWidth: 55,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.xxs,
    marginTop: 2,
    opacity: 0.6,
  },
  tabLabelActive: {
    fontFamily: FontFamily.interSemiBold,
    opacity: 1,
  },
});
