import { Expense } from '../types/database';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { currencyUtils } from './currency';
import { getCategoryIcon as getIcon } from '../constants/categories';

/**
 * Calculate total expenses for a specific date
 */
export const calculateDailyTotal = (expenses: Expense[], date: Date): number => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.logged_at);
      return expenseDate >= dayStart && expenseDate <= dayEnd;
    })
    .reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Filter expenses by date range
 */
export const filterExpensesByDate = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): Expense[] => {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.logged_at);
    return expenseDate >= start && expenseDate <= end;
  });
};

/**
 * Group expenses by date (YYYY-MM-DD format)
 * Returns object with date strings as keys and arrays of expenses as values
 */
export const groupExpensesByDate = (
  expenses: Expense[]
): Record<string, Expense[]> => {
  const grouped: Record<string, Expense[]> = {};

  expenses.forEach((expense) => {
    const date = format(parseISO(expense.logged_at), 'yyyy-MM-dd');

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(expense);
  });

  // Sort expenses within each date group by time (most recent first)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      return new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime();
    });
  });

  return grouped;
};

/**
 * Get today's expenses
 */
export const getTodayExpenses = (expenses: Expense[]): Expense[] => {
  const today = new Date();
  return filterExpensesByDate(expenses, today, today);
};

/**
 * Calculate total for array of expenses
 */
export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Get category icon by category name (uses shared constants)
 */
export const getCategoryIcon = (category: string): string => {
  return getIcon(category);
};

/**
 * Format expense amount with currency (uses shared currency utility)
 */
export const formatExpenseAmount = (amount: number, currency: string): string => {
  return currencyUtils.format(amount, currency);
};
