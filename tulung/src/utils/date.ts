import { format, formatDistance, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Date formatting utilities
 */

export const dateUtils = {
  /**
   * Format date for display (e.g., "Jan 15, 2024")
   */
  formatDate: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  },

  /**
   * Format date with time (e.g., "Jan 15, 2024 at 2:30 PM")
   */
  formatDateTime: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy \'at\' h:mm a');
  },

  /**
   * Format time only (e.g., "2:30 PM")
   */
  formatTime: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'h:mm a');
  },

  /**
   * Format as relative time (e.g., "2 hours ago")
   */
  formatRelative: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    }

    if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'h:mm a')}`;
    }

    return formatDistance(dateObj, new Date(), { addSuffix: true });
  },

  /**
   * Get start of day
   */
  startOfDay: (date: Date = new Date()): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  },

  /**
   * Get end of day
   */
  endOfDay: (date: Date = new Date()): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  },

  /**
   * Check if date is today
   */
  isToday: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  },

  /**
   * Check if date is yesterday
   */
  isYesterday: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isYesterday(dateObj);
  },

  /**
   * Get number of days between two dates
   */
  daysBetween: (date1: Date | string, date2: Date | string): number => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
};
