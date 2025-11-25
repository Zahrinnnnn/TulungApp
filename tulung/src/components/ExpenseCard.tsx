import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, theme } from '../constants/colors';
import { Expense } from '../types/database';
import { getCategoryIcon, formatExpenseAmount } from '../utils/expenseUtils';
import { dateUtils } from '../utils/date';
import { haptics } from '../utils/haptics';

interface ExpenseCardProps {
  expense: Expense;
  onPress: () => void;
}

export default function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const handlePress = () => {
    haptics.light();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`Expense: ${expense.merchant || expense.category}, ${formatExpenseAmount(expense.amount, expense.currency)}`}
      accessibilityHint="Tap to view expense details"
      accessibilityRole="button"
    >
      <View style={styles.content}>
        {/* Category Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(expense.category)}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.merchant} numberOfLines={1}>
            {expense.merchant || expense.category}
          </Text>
          <Text style={styles.time}>
            {dateUtils.formatRelative(expense.logged_at)}
          </Text>
          {expense.note && (
            <Text style={styles.note} numberOfLines={1}>
              {expense.note}
            </Text>
          )}
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatExpenseAmount(expense.amount, expense.currency)}
          </Text>
          {expense.receipt_url && (
            <View style={styles.receiptBadge}>
              <Text style={styles.receiptBadgeText}>📎</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
  },
  details: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  receiptBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBadgeText: {
    fontSize: 10,
  },
});
