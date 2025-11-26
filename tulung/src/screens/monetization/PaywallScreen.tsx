/**
 * Paywall Screen - Pro Subscription Upgrade
 * Shows benefits and pricing for Tulung Pro
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, theme } from '../../constants/colors';
import { haptics } from '../../utils/haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  getOfferings,
  purchasePackage,
  hasActiveProSubscription,
} from '../../services/revenuecatService';
import { syncProStatus } from '../../services/proStatusService';
import { useAuthStore } from '../../store/authStore';
import type { PurchasesPackage } from 'react-native-purchases';

type Props = NativeStackScreenProps<any, 'Paywall'>;

export default function PaywallScreen({ navigation }: Props) {
  const { user, userProfile, setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [packageToPurchase, setPackageToPurchase] = useState<PurchasesPackage | null>(null);

  // Fetch offerings on mount
  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offering = await getOfferings();
        if (offering && offering.availablePackages.length > 0) {
          // Get the first package (monthly subscription)
          setPackageToPurchase(offering.availablePackages[0]);
        } else {
          console.warn('No packages available');
        }
      } catch (error) {
        console.error('Error loading offerings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOfferings();
  }, []);

  const handleSubscribe = async () => {
    if (!packageToPurchase) {
      haptics.error();
      Alert.alert('Error', 'No subscription package available. Please try again later.');
      return;
    }

    setPurchasing(true);
    haptics.heavy();

    try {
      const { customerInfo, success } = await purchasePackage(packageToPurchase);

      if (success && hasActiveProSubscription(customerInfo)) {
        // Sync Pro status to Supabase database
        if (user?.id) {
          const syncedStatus = await syncProStatus(user.id);

          // Update local user profile with synced Pro status
          if (userProfile) {
            setUserProfile({
              ...userProfile,
              is_pro: syncedStatus.is_pro,
              pro_expires_at: syncedStatus.pro_expires_at,
            });
          }
        }

        haptics.success();
        Alert.alert(
          'Welcome to Pro!',
          'You now have unlimited receipt scans and all premium features.',
          [
            {
              text: 'Get Started',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleMaybeLater = () => {
    haptics.light();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>
            Unlock unlimited receipt scans and premium features
          </Text>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <BenefitItem
            icon="✅"
            title="Unlimited Receipt Scans"
            description="Scan as many receipts as you need every month"
          />
          <BenefitItem
            icon="⚡"
            title="Priority Support"
            description="Get help faster when you need it"
          />
          <BenefitItem
            icon="🎯"
            title="Early Access"
            description="Be first to try new features"
          />
          <BenefitItem
            icon="🎨"
            title="Premium Experience"
            description="Ad-free and optimized for power users"
          />
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>Feature Comparison</Text>

          <View style={styles.comparisonTable}>
            {/* Header Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellText}>Feature</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellText}>Free</Text>
              </View>
              <View style={[styles.tableCell, styles.proCell]}>
                <Text style={[styles.tableCellText, styles.proText]}>Pro</Text>
              </View>
            </View>

            {/* Data Rows */}
            <ComparisonRow feature="Receipt Scans" free="10/month" pro="Unlimited" />
            <ComparisonRow feature="Manual Entry" free="Unlimited" pro="Unlimited" />
            <ComparisonRow feature="Support" free="Community" pro="Priority" />
            <ComparisonRow feature="New Features" free="Standard" pro="Early Access" />
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <Text style={styles.price}>$2.99</Text>
          <Text style={styles.pricePeriod}>/month</Text>
        </View>
        <Text style={styles.priceSubtext}>Cancel anytime • Billed monthly</Text>

        {/* CTA Buttons */}
        <TouchableOpacity
          style={[styles.subscribeButton, (loading || purchasing) && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          activeOpacity={0.8}
          disabled={loading || purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {loading ? 'Loading...' : 'Subscribe to Pro'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.laterButton}
          onPress={handleMaybeLater}
          activeOpacity={0.6}
          disabled={purchasing}
        >
          <Text style={styles.laterButtonText}>Maybe Later</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          By subscribing, you agree to automatic monthly billing. Cancel anytime from Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Benefit Item Component
interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
}

function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Comparison Row Component
interface ComparisonRowProps {
  feature: string;
  free: string;
  pro: string;
}

function ComparisonRow({ feature, free, pro }: ComparisonRowProps) {
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{feature}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellTextSmall}>{free}</Text>
      </View>
      <View style={[styles.tableCell, styles.proCell]}>
        <Text style={[styles.tableCellTextSmall, styles.proText]}>{pro}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: theme.spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  comparisonContainer: {
    marginBottom: theme.spacing.xl,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  comparisonTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  proCell: {
    backgroundColor: colors.background,
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tableCellTextSmall: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  proText: {
    color: colors.primary,
    fontWeight: '600',
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pricePeriod: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  priceSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowOpacity: 0,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  laterButton: {
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  laterButtonText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  footer: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: theme.spacing.md,
  },
});
