/**
 * Processing Screen - Shows while extracting receipt data with OCR
 * Provides loading feedback and error handling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, theme } from '../../constants/colors';
import { haptics } from '../../utils/haptics';
import { extractReceiptData, normalizeCategory, normalizeCurrency } from '../../services/openaiService';
import { checkScanQuota } from '../../services/expenseService';
import { useAuthStore } from '../../store/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'ProcessingReceipt'>;

interface RouteParams {
  imageUri: string;
}

export default function ProcessingScreen({ navigation, route }: Props) {
  const params = route.params as RouteParams;
  const { imageUri } = params;
  const { user } = useAuthStore();

  const [status, setStatus] = useState('Checking scan quota...');
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const runProcess = async () => {
      if (isMounted) {
        await processReceipt(abortController);
      }
    };

    runProcess();

    // Cleanup: prevent state updates on unmounted component
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const processReceipt = async (abortController?: AbortController) => {
    if (!user) {
      setError('Please sign in to use OCR');
      haptics.error();
      return;
    }

    if (abortController?.signal.aborted) return;
    setIsProcessing(true);

    try {
      // CRITICAL: Check quota BEFORE starting OCR
      setStatus('Checking scan quota...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (abortController?.signal.aborted) return;

      const quotaCheck = await checkScanQuota(user.id);

      if (abortController?.signal.aborted) return;

      if (!quotaCheck.canScan) {
        // Quota exceeded
        setQuotaExceeded(true);
        setError(
          quotaCheck.isPro
            ? 'Your Pro subscription has expired. Please renew to continue using OCR.'
            : `You've reached your free limit of 10 scans this month. Upgrade to Pro for unlimited scans.`
        );
        haptics.error();
        return;
      }

      // User has quota - proceed with OCR
      setStatus('Reading receipt...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (abortController?.signal.aborted) return;

      setStatus('Extracting details...');
      const receiptData = await extractReceiptData(imageUri);

      if (abortController?.signal.aborted) return;

      setStatus('Almost done...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (abortController?.signal.aborted) return;

      // Normalize category and currency to match our predefined lists
      receiptData.category = normalizeCategory(receiptData.category);
      receiptData.currency = normalizeCurrency(receiptData.currency);

      // Success! Navigate to AddExpense with pre-filled data
      haptics.success();

      navigation.replace('AddExpense', {
        imageUri,
        ocrData: receiptData,
        fromOCR: true,
      });

    } catch (err: any) {
      if (__DEV__) console.error('OCR processing error:', err);
      setError(err.message || 'Could not read receipt');
      haptics.error();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (isProcessing) return; // Prevent spam

    haptics.light();
    setError(null);
    setQuotaExceeded(false);
    setStatus('Checking scan quota...');
    processReceipt();
  };

  const handleEnterManually = () => {
    haptics.light();
    navigation.replace('AddExpense', {
      imageUri,
    });
  };

  const handleCancel = () => {
    haptics.light();
    navigation.goBack();
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>{quotaExceeded ? '📊' : '⚠️'}</Text>
            <Text style={styles.errorTitle}>
              {quotaExceeded ? 'Scan Limit Reached' : 'Couldn\'t Read Receipt'}
            </Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {quotaExceeded ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={() => {
                  haptics.light();
                  // TODO: Navigate to upgrade screen when Phase 5 is implemented
                  Alert.alert(
                    'Upgrade to Pro',
                    'Pro features coming soon! Get unlimited OCR scans, priority support, and more.',
                    [{ text: 'OK' }]
                  );
                }}>
                  <Text style={styles.primaryButtonText}>Upgrade to Pro</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleEnterManually}>
                  <Text style={styles.secondaryButtonText}>Enter Manually</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tertiaryButton} onPress={handleCancel}>
                  <Text style={styles.tertiaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
                  onPress={handleRetry}
                  disabled={isProcessing}
                >
                  <Text style={styles.primaryButtonText}>
                    {isProcessing ? 'Processing...' : 'Try Again'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleEnterManually}>
                  <Text style={styles.secondaryButtonText}>Enter Manually</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tertiaryButton} onPress={handleCancel}>
                  <Text style={styles.tertiaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.subText}>This may take a few seconds</Text>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  subText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.large,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.medium,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.large,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  tertiaryButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  cancelButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
