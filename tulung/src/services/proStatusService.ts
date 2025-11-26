/**
 * Pro Status Service
 * Handles syncing Pro subscription status between RevenueCat and Supabase
 */

import { supabase } from './supabase';
import { getCustomerInfo, hasActiveProSubscription, getProExpirationDate } from './revenuecatService';

/**
 * Sync Pro status from RevenueCat to Supabase
 * Call this after purchase, restore, or on app start
 */
export const syncProStatus = async (userId: string): Promise<{ is_pro: boolean; pro_expires_at: string | null }> => {
  try {
    // Get customer info from RevenueCat
    const customerInfo = await getCustomerInfo();
    const isPro = hasActiveProSubscription(customerInfo);
    const expiresAt = getProExpirationDate(customerInfo);

    // Update Supabase database
    const { error } = await supabase
      .from('users')
      .update({
        is_pro: isPro,
        pro_expires_at: expiresAt ? expiresAt.toISOString() : null,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error syncing Pro status to Supabase:', error);
      throw error;
    }

    console.log('Pro status synced successfully:', { isPro, expiresAt });
    return {
      is_pro: isPro,
      pro_expires_at: expiresAt ? expiresAt.toISOString() : null,
    };
  } catch (error) {
    console.error('Error syncing Pro status:', error);
    throw error;
  }
};

/**
 * Check if Pro subscription has expired and needs updating
 */
export const checkProExpiration = async (userId: string, currentProExpiresAt: string | null): Promise<boolean> => {
  if (!currentProExpiresAt) return false;

  const expirationDate = new Date(currentProExpiresAt);
  const now = new Date();

  // If subscription has expired, sync status to remove Pro access
  if (expirationDate < now) {
    console.log('Pro subscription expired, syncing status...');
    await syncProStatus(userId);
    return true; // Subscription expired
  }

  return false; // Still active
};
