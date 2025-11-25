import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import ExpenseDetailScreen from '../screens/expenses/ExpenseDetailScreen';
import ProcessingScreen from '../screens/expenses/ProcessingScreen';
import PaywallScreen from '../screens/monetization/PaywallScreen';
import { HomeStackParamList } from '../types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="ProcessingReceipt"
        component={ProcessingScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
