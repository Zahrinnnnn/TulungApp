import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, theme } from '../../constants/colors';
import { DEFAULT_DAILY_BUDGET } from '../../constants/defaults';
import { useAuthStore } from '../../store/authStore';
import { haptics } from '../../utils/haptics';
import { supabase } from '../../services/supabase';
import QuotaBadge from '../../components/QuotaBadge';
import ProBadge from '../../components/ProBadge';
import { FREE_TIER_SCAN_LIMIT } from '../../constants/defaults';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, userProfile, signOut, setUserProfile } = useAuthStore();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(userProfile?.daily_budget?.toString() || DEFAULT_DAILY_BUDGET.toString());
  const [updating, setUpdating] = useState(false);
  const [scansUsed, setScansUsed] = useState(0);

  // Fetch scan quota on mount and when screen is focused
  useEffect(() => {
    const fetchScanQuota = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('scan_quota')
          .select('scans_this_month')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setScansUsed(data.scans_this_month);
        }
      } catch (error) {
        console.error('Error fetching scan quota:', error);
      }
    };

    fetchScanQuota();
  }, [user?.id]);

  const handleSignOut = () => {
    haptics.warning();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel', onPress: () => haptics.light() },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          haptics.medium();
          signOut();
        },
      },
    ]);
  };

  const handleEditBudget = () => {
    haptics.light();
    setBudgetInput(userProfile?.daily_budget?.toString() || DEFAULT_DAILY_BUDGET.toString());
    setShowBudgetModal(true);
  };

  const handleSaveBudget = async () => {
    const budget = parseFloat(budgetInput);

    if (isNaN(budget) || budget <= 0) {
      haptics.error();
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount greater than 0.');
      return;
    }

    setUpdating(true);
    haptics.medium();

    try {
      const { error } = await supabase
        .from('users')
        .update({ daily_budget: budget })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, daily_budget: budget });
      }

      haptics.success();
      setShowBudgetModal(false);
      Alert.alert('Success', 'Daily budget updated successfully!');
    } catch (error) {
      console.error('Error updating budget:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to update budget. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditCurrency = () => {
    haptics.light();
    setShowCurrencyModal(true);
  };

  const handleSelectCurrency = async (currencyCode: string) => {
    setUpdating(true);
    haptics.light();
    setShowCurrencyModal(false);

    try {
      const { error } = await supabase
        .from('users')
        .update({ currency: currencyCode })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, currency: currencyCode });
      }

      haptics.success();
      Alert.alert('Success', 'Currency updated successfully!');
    } catch (error) {
      console.error('Error updating currency:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <Text style={styles.email}>{userProfile?.email || 'Loading...'}</Text>
            {userProfile?.is_pro && (
              <View style={{ marginTop: theme.spacing.sm }}>
                <ProBadge />
              </View>
            )}
          </View>
        </View>

        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BUDGET SETTINGS</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleEditBudget}
            disabled={updating}
          >
            <Text style={styles.settingLabel}>Daily Budget</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {userProfile?.daily_budget?.toFixed(2) || DEFAULT_DAILY_BUDGET.toFixed(2)}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleEditCurrency}
            disabled={updating}
          >
            <Text style={styles.settingLabel}>Currency</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{userProfile?.currency || 'USD'}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Usage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>USAGE</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Scans this month</Text>
            <QuotaBadge
              scansUsed={scansUsed}
              scanLimit={FREE_TIER_SCAN_LIMIT}
              isPro={userProfile?.is_pro || false}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Current streak</Text>
            <Text style={styles.settingValue}>
              {userProfile?.streak_count || 0} days
            </Text>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          {!userProfile?.is_pro && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                haptics.light();
                navigation.navigate('Home', { screen: 'Paywall' });
              }}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Help & FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.version}>App Version 1.0.0</Text>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={showBudgetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            haptics.light();
            setShowBudgetModal(false);
          }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Budget</Text>
            <Text style={styles.modalSubtitle}>
              How much do you want to spend per day?
            </Text>

            <TextInput
              style={styles.budgetInput}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="50.00"
              keyboardType="decimal-pad"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  haptics.light();
                  setShowBudgetModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveBudget}
                disabled={updating}
              >
                <Text style={styles.modalSaveText}>
                  {updating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            haptics.light();
            setShowCurrencyModal(false);
          }}
        >
          <View style={styles.currencyModalContent}>
            <Text style={styles.modalTitle}>Select Currency</Text>

            <ScrollView style={styles.currencyList}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyOption,
                    userProfile?.currency === curr.code && styles.currencyOptionSelected,
                  ]}
                  onPress={() => handleSelectCurrency(curr.code)}
                  disabled={updating}
                >
                  <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                  {userProfile?.currency === curr.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl, // Minimal space for bottom tab bar
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  email: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
    marginLeft: theme.spacing.xs,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  signOutButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xlarge,
    padding: theme.spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  budgetInput: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.background,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  currencyModalContent: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xlarge,
    padding: theme.spacing.lg,
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  currencyList: {
    marginTop: theme.spacing.md,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.xs,
  },
  currencyOptionSelected: {
    backgroundColor: colors.background,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    width: 40,
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
});
