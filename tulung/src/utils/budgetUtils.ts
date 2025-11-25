/**
 * Budget Alert Utilities
 * Manages budget tracking and alert thresholds
 */

export interface BudgetAlert {
  type: 'warning' | 'danger' | 'critical';
  message: string;
  percentage: number;
}

/**
 * Check if budget alert should be shown based on today's spending
 * @param todayTotal - Amount spent today
 * @param dailyBudget - User's daily budget
 * @returns BudgetAlert object or null if no alert needed
 */
export function checkBudgetAlert(
  todayTotal: number,
  dailyBudget: number
): BudgetAlert | null {
  if (dailyBudget <= 0) return null;

  const percentage = (todayTotal / dailyBudget) * 100;

  if (percentage >= 120) {
    // Critical: Over 120% of budget
    const overAmount = ((percentage - 100) / 100).toFixed(0);
    return {
      type: 'critical',
      message: `You're over budget by ${overAmount}%!`,
      percentage,
    };
  } else if (percentage >= 100) {
    // Danger: At or over 100% of budget
    return {
      type: 'danger',
      message: 'Daily budget reached!',
      percentage,
    };
  } else if (percentage >= 80) {
    // Warning: At 80% of budget
    return {
      type: 'warning',
      message: `You've spent ${percentage.toFixed(0)}% of today's budget`,
      percentage,
    };
  }

  return null; // No alert needed
}

/**
 * Get color for budget alert based on type
 */
export function getBudgetAlertColor(type: 'warning' | 'danger' | 'critical'): string {
  switch (type) {
    case 'warning':
      return '#FDCB6E'; // Yellow
    case 'danger':
      return '#FF7675'; // Orange
    case 'critical':
      return '#D63031'; // Dark red
    default:
      return '#FDCB6E';
  }
}

/**
 * Get icon emoji for budget alert based on type
 */
export function getBudgetAlertIcon(type: 'warning' | 'danger' | 'critical'): string {
  switch (type) {
    case 'warning':
      return '⚠️';
    case 'danger':
      return '🚨';
    case 'critical':
      return '🔴';
    default:
      return '⚠️';
  }
}
