import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStackNavigator from './HomeStackNavigator';
import SettingsScreen from '../screens/settings/SettingsScreen';
import Feature1Screen from '../screens/placeholder/Feature1Screen';
import Feature2Screen from '../screens/placeholder/Feature2Screen';
import CameraTabScreen from '../screens/camera/CameraTabScreen';
import { MainTabParamList } from '../types';
import { colors, theme } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Feature1"
        component={Feature1Screen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>📊</Text>,
          tabBarLabel: 'Feature 1',
        }}
      />
      <Tab.Screen
        name="CameraTab"
        component={CameraTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.cameraButtonContainer}>
              <View style={[styles.cameraButton, focused && styles.cameraButtonActive]}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </View>
          ),
          tabBarLabel: () => null, // Hide label for camera tab
        }}
      />
      <Tab.Screen
        name="Feature2"
        component={Feature2Screen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>📈</Text>,
          tabBarLabel: 'Feature 2',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    fontSize: 24,
  },
  cameraButtonContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: colors.white,
  },
  cameraButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  cameraIcon: {
    fontSize: 28,
  },
});
