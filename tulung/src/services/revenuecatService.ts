/**
 * RevenueCat Service
 * Handles in-app purchases and subscription management
 */

import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

// RevenueCat API Keys (to be configured in .env)
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';

// Product identifiers
export const PRO_ENTITLEMENT_ID = 'pro';
export const PRO_MONTHLY_PRODUCT_ID = 'tulung_pro_monthly';

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export const initializeRevenueCat = async (userId: string): Promise<void> => {
  try {
    // Configure SDK with API key based on platform
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      console.warn('RevenueCat API key not configured');
      return;
    }

    await Purchases.configure({ apiKey, appUserID: userId });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

/**
 * Get available offerings (products)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; success: boolean }> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return { customerInfo, success: true };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
      return { customerInfo: error.customerInfo, success: false };
    }
    console.error('Error purchasing package:', error);
    throw error;
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

/**
 * Get customer info (current subscription status)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
};

/**
 * Check if user has active Pro subscription
 */
export const hasActiveProSubscription = (customerInfo: CustomerInfo): boolean => {
  return (
    typeof customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined'
  );
};

/**
 * Get Pro subscription expiration date
 */
export const getProExpirationDate = (customerInfo: CustomerInfo): Date | null => {
  const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
  if (!entitlement) return null;

  return entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
};

/**
 * Set user attributes (for analytics)
 */
export const setUserAttributes = async (attributes: Record<string, string | null>): Promise<void> => {
  try {
    await Purchases.setAttributes(attributes);
  } catch (error) {
    console.error('Error setting user attributes:', error);
  }
};
