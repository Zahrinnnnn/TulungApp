import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, theme } from '../../constants/colors';
import { useExpenseStore } from '../../store/expenseStore';
import { getCategoryIcon, formatExpenseAmount } from '../../utils/expenseUtils';
import { dateUtils } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { HomeStackParamList } from '../../types';
import { format, parseISO } from 'date-fns';

type Props = NativeStackScreenProps<HomeStackParamList, 'ExpenseDetail'>;

export default function ExpenseDetailScreen({ navigation, route }: Props) {
  const { expenseId } = route.params;
  const { expenses, deleteExpense } = useExpenseStore();
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Find the expense
  const expense = expenses.find((e) => e.id === expenseId);

  // Debug logging
  React.useEffect(() => {
    if (__DEV__ && expense) {
      console.log('📋 Expense Detail - Expense ID:', expense.id);
      console.log('📋 Receipt URL:', expense.receipt_url);
      console.log('📋 Full expense data:', JSON.stringify(expense, null, 2));
    }
  }, [expense]);

  if (!expense) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Expense not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    haptics.light();
    navigation.goBack();
  };

  const handleEdit = () => {
    haptics.medium();
    // TODO: Implement edit functionality in Phase 2.5
    Alert.alert(
      'Edit Expense',
      'Edit functionality coming soon! For now, you can delete and recreate the expense.',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = () => {
    haptics.warning();
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => haptics.light(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      haptics.success();
      Alert.alert('Success', 'Expense deleted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error deleting expense:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
      setDeleting(false);
    }
  };

  const formattedDate = format(parseISO(expense.logged_at), 'EEEE, MMMM d, yyyy');
  const formattedTime = format(parseISO(expense.logged_at), 'h:mm a');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Receipt Image */}
        {expense.receipt_url && !imageError && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: expense.receipt_url }}
              style={styles.receiptImage}
              resizeMode="cover"
              onError={(error) => {
                console.error('Error loading receipt image:', error.nativeEvent.error);
                setImageError(true);
              }}
            />
          </View>
        )}

        {/* Image Error State */}
        {expense.receipt_url && imageError && (
          <View style={styles.imageErrorContainer}>
            <Text style={styles.imageErrorIcon}>📷</Text>
            <Text style={styles.imageErrorText}>Unable to load receipt image</Text>
          </View>
        )}

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>
            {formatExpenseAmount(expense.amount, expense.currency)}
          </Text>
        </View>

        {/* Category */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <View style={styles.categoryValue}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(expense.category)}
            </Text>
            <Text style={styles.detailValue}>{expense.category}</Text>
          </View>
        </View>

        {/* Merchant */}
        {expense.merchant && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            <Text style={styles.detailValue}>{expense.merchant}</Text>
          </View>
        )}

        {/* Date & Time */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formattedDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{formattedTime}</Text>
        </View>

        {/* Note */}
        {expense.note && (
          <View style={styles.noteSection}>
            <Text style={styles.detailLabel}>Note</Text>
            <Text style={styles.noteText}>{expense.note}</Text>
          </View>
        )}

        {/* Relative Time */}
        <Text style={styles.relativeTime}>
          {dateUtils.formatRelative(expense.logged_at)}
        </Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
          disabled={deleting}
          accessibilityLabel="Edit expense"
          accessibilityHint="Edit this expense details"
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={deleting}
          accessibilityLabel="Delete expense"
          accessibilityHint="Permanently delete this expense"
          accessibilityRole="button"
        >
          {deleting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.background,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  imageErrorContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageErrorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  imageErrorText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  noteSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noteText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  relativeTime: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
    ...theme.shadow.medium,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    ...theme.shadow.medium,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.large,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
