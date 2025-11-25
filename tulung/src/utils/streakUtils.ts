/**
 * Streak System Utilities
 * Manages user snap streaks (consecutive days of logging expenses)
 */

import { supabase } from '../services/supabase';
import { differenceInDays, startOfDay, isToday, isYesterday } from 'date-fns';

export interface StreakStatus {
  streakCount: number;
  isActive: boolean;
  daysUntilBreak: number; // 1 if logged today, 0 if not logged yet today
  lastSnapDate: Date | null;
}

/**
 * Update user's streak count based on last snap date
 * Call this every time an expense is logged
 * @param userId - User's ID
 * @returns New streak count
 */
export async function updateStreak(userId: string): Promise<number> {
  try {
    // Get current user data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('last_snap_date, streak_count')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const now = new Date();
    const today = startOfDay(now);
    const lastSnapDate = user.last_snap_date ? new Date(user.last_snap_date) : null;

    let newStreakCount = user.streak_count || 0;

    if (!lastSnapDate) {
      // First time logging - start streak at 1
      newStreakCount = 1;
    } else if (isToday(lastSnapDate)) {
      // Already logged today - no change to streak
      return newStreakCount;
    } else if (isYesterday(lastSnapDate)) {
      // Logged yesterday - increment streak
      newStreakCount = newStreakCount + 1;
    } else {
      // Logged more than 1 day ago - reset streak to 1
      newStreakCount = 1;
    }

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_snap_date: today.toISOString(),
        streak_count: newStreakCount,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    if (__DEV__) {
      console.log(`✅ Streak updated for user ${userId}: ${newStreakCount} days`);
    }

    return newStreakCount;
  } catch (error) {
    console.error('Error updating streak:', error);
    // Don't throw - streak update shouldn't block expense creation
    return 0;
  }
}

/**
 * Get user's current streak status
 * @param userId - User's ID
 * @returns Streak status object
 */
export async function getStreakStatus(userId: string): Promise<StreakStatus> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('last_snap_date, streak_count')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const lastSnapDate = user.last_snap_date ? new Date(user.last_snap_date) : null;
    const streakCount = user.streak_count || 0;

    if (!lastSnapDate) {
      return {
        streakCount: 0,
        isActive: false,
        daysUntilBreak: 0,
        lastSnapDate: null,
      };
    }

    const isActive = isToday(lastSnapDate) || isYesterday(lastSnapDate);
    const daysUntilBreak = isToday(lastSnapDate) ? 1 : 0;

    return {
      streakCount,
      isActive,
      daysUntilBreak,
      lastSnapDate,
    };
  } catch (error) {
    console.error('Error getting streak status:', error);
    return {
      streakCount: 0,
      isActive: false,
      daysUntilBreak: 0,
      lastSnapDate: null,
    };
  }
}

/**
 * Check if user reached a milestone and should see celebration
 * @param streakCount - Current streak count
 * @returns Milestone info or null if no milestone reached
 */
export interface MilestoneInfo {
  days: number;
  title: string;
  message: string;
  emoji: string;
}

export function getMilestoneInfo(streakCount: number): MilestoneInfo | null {
  const milestones: Record<number, MilestoneInfo> = {
    3: {
      days: 3,
      title: 'Great Start!',
      message: 'You\'ve logged expenses for 3 days in a row!',
      emoji: '🎉',
    },
    7: {
      days: 7,
      title: 'One Week Streak!',
      message: 'You\'re building a great habit!',
      emoji: '🔥',
    },
    14: {
      days: 14,
      title: 'Two Weeks!',
      message: 'You\'re on fire!',
      emoji: '🚀',
    },
    30: {
      days: 30,
      title: 'ONE MONTH!',
      message: 'Incredible dedication!',
      emoji: '🏆',
    },
    60: {
      days: 60,
      title: 'TWO MONTHS!',
      message: 'You\'re a budgeting master!',
      emoji: '💎',
    },
    90: {
      days: 90,
      title: 'THREE MONTHS!',
      message: 'Absolutely outstanding!',
      emoji: '👑',
    },
    180: {
      days: 180,
      title: 'HALF A YEAR!',
      message: 'Phenomenal commitment!',
      emoji: '⭐',
    },
    365: {
      days: 365,
      title: 'ONE FULL YEAR!',
      message: 'You are a legend!',
      emoji: '🎊',
    },
  };

  return milestones[streakCount] || null;
}

/**
 * Check if user has already seen a milestone celebration
 * Uses AsyncStorage to track shown milestones
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOWN_MILESTONES_KEY = '@shown_milestones';

export async function hasMilestoneBeenShown(userId: string, milestone: number): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(`${SHOWN_MILESTONES_KEY}_${userId}`);
    if (!stored) return false;

    const shownMilestones: number[] = JSON.parse(stored);
    return shownMilestones.includes(milestone);
  } catch (error) {
    console.error('Error checking milestone status:', error);
    return false;
  }
}

export async function markMilestoneAsShown(userId: string, milestone: number): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(`${SHOWN_MILESTONES_KEY}_${userId}`);
    const shownMilestones: number[] = stored ? JSON.parse(stored) : [];

    if (!shownMilestones.includes(milestone)) {
      shownMilestones.push(milestone);
      await AsyncStorage.setItem(
        `${SHOWN_MILESTONES_KEY}_${userId}`,
        JSON.stringify(shownMilestones)
      );
    }
  } catch (error) {
    console.error('Error marking milestone as shown:', error);
  }
}
