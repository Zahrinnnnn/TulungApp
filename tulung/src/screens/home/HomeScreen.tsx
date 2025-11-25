import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, theme } from '../../constants/colors';
import { DEFAULT_DAILY_BUDGET } from '../../constants/defaults';
import { useAuthStore } from '../../store/authStore';
import { useExpenseStore } from '../../store/expenseStore';
import { currencyUtils } from '../../utils/currency';
import { calculateDailyTotal, getTodayExpenses } from '../../utils/expenseUtils';
import CameraButton from '../../components/CameraButton';
import ExpenseCard from '../../components/ExpenseCard';
import { HomeStackParamList } from '../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, userProfile } = useAuthStore();
  const { expenses, loading, fetchExpenses } = useExpenseStore();

  // Fetch expenses on mount
  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user?.id]);

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
  const percentSpent = dailyBudget > 0 ? (todayTotal / dailyBudget) * 100 : 0;

  // Get recent expenses (limit to 10)
  const recentExpenses = expenses.slice(0, 10);

  // Determine meter color based on percentage
  const getMeterColor = () => {
    if (percentSpent >= 100) return colors.burnOver;
    if (percentSpent >= 80) return colors.burnDanger;
    if (percentSpent >= 60) return colors.burnCaution;
    return colors.burnSafe;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

        {/* Burn Rate Meter */}
        <View style={styles.meterContainer}>
          <View
            style={[
              styles.meterPlaceholder,
              { borderColor: getMeterColor() },
            ]}
          >
            <Text style={styles.meterText}>
              {currencyUtils.format(todayTotal, userProfile?.currency || 'USD')}
            </Text>
            <Text style={styles.meterDivider}>/</Text>
            <Text style={styles.meterBudget}>
              {currencyUtils.format(dailyBudget, userProfile?.currency || 'USD')}
            </Text>
            <Text style={[styles.meterPercent, { color: getMeterColor() }]}>
              {percentSpent.toFixed(0)}% spent
            </Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>
            🔥 {userProfile?.streak_count || 0}-day streak
          </Text>
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
    paddingBottom: 100, // Space for FAB
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
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: colors.white,
    marginBottom: theme.spacing.md,
  },
  meterPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  meterDivider: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  meterBudget: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  meterPercent: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  streakContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
    backgroundColor: colors.white,
    marginBottom: theme.spacing.md,
  },
  streakText: {
    fontSize: 16,
    color: colors.textSecondary,
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
