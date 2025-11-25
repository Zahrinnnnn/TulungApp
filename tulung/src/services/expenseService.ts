import { supabase } from './supabase';
import { ExpenseInput } from '../types/database';
import { readAsStringAsync, EncodingType, getInfoAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Service for managing expenses
 */

// Free tier: 10 scans per month
const FREE_TIER_SCAN_LIMIT = 10;

/**
 * Create a new expense
 */
export const createExpense = async (
  userId: string,
  expenseData: ExpenseInput
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: expenseData.amount,
        currency: expenseData.currency,
        category: expenseData.category,
        merchant: expenseData.merchant || null,
        note: expenseData.note || null,
        receipt_url: expenseData.receipt_url || null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * Upload receipt image to Supabase Storage
 */
export const uploadReceiptImage = async (
  uri: string,
  userId: string
): Promise<string> => {
  try {
    // Generate unique filename
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Check file size and compress if needed
    let processedUri = uri;
    const fileInfo = await getInfoAsync(uri);
    const maxSize = 1 * 1024 * 1024; // 1MB limit

    if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > maxSize) {
      if (__DEV__) console.log(`📦 Compressing image (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB → target <1MB)`);

      // Compress image to reduce size
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Resize to max width 1200px
        {
          compress: 0.7,
          format: SaveFormat.JPEG,
        }
      );

      processedUri = manipResult.uri;
      if (__DEV__) console.log('✅ Image compressed successfully');
    }

    // Read file as base64 (React Native compatible method)
    const base64 = await readAsStringAsync(processedUri, {
      encoding: EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer for Supabase
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get signed URL (for private bucket) - valid for 1 year
    const { data: urlData, error: urlError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (urlError) {
      throw urlError;
    }

    return urlData.signedUrl;
  } catch (error) {
    console.error('Error uploading receipt image:', error);
    throw error;
  }
};

/**
 * Check if user has remaining scan quota
 * @returns Object with canScan boolean and remaining count
 */
export const checkScanQuota = async (userId: string): Promise<{ canScan: boolean; remaining: number; isPro: boolean }> => {
  try {
    // Check if user is Pro
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_pro, pro_expires_at')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Pro users have unlimited scans
    if (user.is_pro && user.pro_expires_at) {
      const expiresAt = new Date(user.pro_expires_at);
      if (expiresAt > new Date()) {
        return { canScan: true, remaining: -1, isPro: true }; // -1 means unlimited
      }
    }

    // Check scan quota for free tier users
    const { data: quota } = await supabase
      .from('scan_quota')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!quota) {
      // No quota record yet - user can scan (first time)
      return { canScan: true, remaining: FREE_TIER_SCAN_LIMIT, isPro: false };
    }

    const remaining = FREE_TIER_SCAN_LIMIT - quota.scans_this_month;
    return {
      canScan: remaining > 0,
      remaining: Math.max(0, remaining),
      isPro: false,
    };
  } catch (error) {
    console.error('Error checking scan quota:', error);
    // On error, allow scan but log the error
    return { canScan: true, remaining: FREE_TIER_SCAN_LIMIT, isPro: false };
  }
};

/**
 * Update scan quota (for Phase 5 - OCR limiting)
 */
export const updateScanQuota = async (userId: string): Promise<void> => {
  try {
    // Check if quota record exists
    const { data: existingQuota } = await supabase
      .from('scan_quota')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingQuota) {
      // Increment scan count
      const { error } = await supabase
        .from('scan_quota')
        .update({
          scans_this_month: existingQuota.scans_this_month + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Create new quota record
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);

      const { error } = await supabase.from('scan_quota').insert({
        user_id: userId,
        scans_this_month: 1,
        reset_date: nextMonth.toISOString().split('T')[0],
      });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating scan quota:', error);
    // Don't throw - quota update shouldn't block expense creation
  }
};

/**
 * Update user streak
 */
export const updateStreak = async (userId: string): Promise<void> => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('last_snap_date, streak_count')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const today = new Date().toISOString().split('T')[0];
    const lastSnapDate = user.last_snap_date;

    let newStreakCount = user.streak_count || 0;

    if (lastSnapDate) {
      const lastSnap = new Date(lastSnapDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastSnapDate === today) {
        // Already logged today, no change
        return;
      } else if (lastSnapDate === yesterdayStr) {
        // Consecutive day, increment streak
        newStreakCount += 1;
      } else {
        // Streak broken, reset to 1
        newStreakCount = 1;
      }
    } else {
      // First expense ever
      newStreakCount = 1;
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_snap_date: today,
        streak_count: newStreakCount,
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating streak:', error);
    // Don't throw - streak update shouldn't block expense creation
  }
};
