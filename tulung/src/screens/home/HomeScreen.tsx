import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, theme } from '../../constants/colors';
import { DEFAULT_DAILY_BUDGET } from '../../constants/defaults';
import { useAuthStore } from '../../store/authStore';
import { useExpenseStore } from '../../store/expenseStore';
import { currencyUtils } from '../../utils/currency';
import { calculateDailyTotal, getTodayExpenses } from '../../utils/expenseUtils';
import { checkBudgetAlert } from '../../utils/budgetUtils';
import CameraButton from '../../components/CameraButton';
import ExpenseCard from '../../components/ExpenseCard';
import BurnRateMeter from '../../components/BurnRateMeter';
import StreakBadge from '../../components/StreakBadge';
import BudgetAlert from '../../components/BudgetAlert';
import { HomeStackParamList } from '../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, userProfile } = useAuthStore();
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const [budgetAlertDismissed, setBudgetAlertDismissed] = useState(false);

  // Fetch expenses on mount
  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user?.id]);

  // Reset budget alert dismissed state when date changes
  useEffect(() => {
    setBudgetAlertDismissed(false);
  }, [new Date().toDateString()]);

  const handleImageSelected = (uri: string) => {
    // Navigate to ProcessingReceipt screen for OCR
    navigation.navigate('ProcessingReceipt', { imageUri: uri });
  };

  const handleManualEntry = () => {
    // Navigate to AddExpense screen without image
    navigation.navigate('AddExpense', {});
  };

  const handleExpensePress = (expenseId: string) => {
    navigation.navigate('ExpenseDetail', { expenseId });
  };

  const handleRefresh = async () => {
    if (user?.id) {
      await fetchExpenses(user.id);
    }
  };

  // Calculate today's total
  const todayExpenses = getTodayExpenses(expenses);
  const todayTotal = calculateDailyTotal(expenses, new Date());
  const dailyBudget = userProfile?.daily_budget || DEFAULT_DAILY_BUDGET;
  const streakCount = userProfile?.streak_count || 0;
  const currency = userProfile?.currency || 'USD';

  // Get recent expenses (limit to 10)
  const recentExpenses = expenses.slice(0, 10);

  // Check for budget alert
  const budgetAlert = !budgetAlertDismissed ? checkBudgetAlert(todayTotal, dailyBudget) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tulung</Text>
        </View>

        {/* Budget Alert Banner */}
        {budgetAlert && (
          <BudgetAlert
            alert={budgetAlert}
            onDismiss={() => setBudgetAlertDismissed(true)}
          />
        )}

        {/* Burn Rate Meter */}
        <View style={styles.meterContainer}>
          <BurnRateMeter
            todayTotal={todayTotal}
            dailyBudget={dailyBudget}
            currency={currency}
          />
        </View>

        {/* Streak Badge */}
        <View style={styles.streakContainer}>
          <StreakBadge streakCount={streakCount} />
        </View>

        {/* Recent Expenses Section */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>

          {loading && expenses.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : recentExpenses.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📸</Text>
              <Text style={styles.emptyTitle}>No expenses yet!</Text>
              <Text style={styles.emptySubtitle}>
                Tap the camera button to scan your first receipt.
              </Text>
            </View>
          ) : (
            /* Expense List */
            <>
              {recentExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onPress={() => handleExpensePress(expense.id)}
                />
              ))}

              {expenses.length > 10 && (
                <Text style={styles.moreText}>
                  + {expenses.length - 10} more expenses
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Camera Button (FAB) */}
      <CameraButton
        onImageSelected={handleImageSelected}
        onManualEntry={handleManualEntry}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl, // Minimal space for bottom tab bar
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  meterContainer: {
    backgroundColor: colors.white,
    marginBottom: theme.spacing.md,
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: colors.white,
    marginBottom: theme.spacing.md,
  },
  expensesSection: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  moreText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
