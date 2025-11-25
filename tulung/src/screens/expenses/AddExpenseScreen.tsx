import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, theme } from '../../constants/colors';
import { haptics } from '../../utils/haptics';
import { validation } from '../../utils/validation';
import { useAuthStore } from '../../store/authStore';
import { useExpenseStore } from '../../store/expenseStore';
import { createExpense, uploadReceiptImage, updateScanQuota, updateStreak } from '../../services/expenseService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CATEGORIES } from '../../constants/categories';

type Props = NativeStackScreenProps<any, 'AddExpense'>;

interface RouteParams {
  imageUri?: string;
  ocrData?: {
    amount: number;
    currency: string;
    merchant: string;
    category: string;
  };
  fromOCR?: boolean;
}

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

export default function AddExpenseScreen({ navigation, route }: Props) {
  const { user, userProfile } = useAuthStore();
  const { addExpense } = useExpenseStore();

  // Get params from route
  const params = route.params as RouteParams | undefined;
  const receiptUri = params?.imageUri || null;
  const ocrData = params?.ocrData;
  const fromOCR = params?.fromOCR || false;

  // Form state - pre-fill if OCR data provided
  const [amount, setAmount] = useState(ocrData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(ocrData?.currency || userProfile?.currency || 'USD');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(ocrData?.category || null);
  const [merchant, setMerchant] = useState(ocrData?.merchant || '');
  const [note, setNote] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!amount || !validation.amount(parseFloat(amount))) {
      haptics.error();
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!selectedCategory) {
      haptics.error();
      Alert.alert('Category Required', 'Please select a category for this expense.');
      return;
    }

    if (!user?.id) {
      haptics.error();
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setLoading(true);
    haptics.medium();

    try {
      // 1. Upload receipt image if provided
      let receiptUrl = null;
      if (receiptUri) {
        setUploadingImage(true);
        if (__DEV__) console.log('📸 Uploading receipt image from URI:', receiptUri);
        receiptUrl = await uploadReceiptImage(receiptUri, user.id);
        if (__DEV__) console.log('✅ Receipt uploaded. Signed URL:', receiptUrl);
        setUploadingImage(false);
      }

      // 2. Create expense
      const expenseData = {
        amount: parseFloat(amount),
        currency,
        category: selectedCategory,
        merchant: merchant.trim() ? validation.sanitize(merchant.trim()) : undefined,
        note: note.trim() ? validation.sanitize(note.trim()) : undefined,
        receipt_url: receiptUrl || undefined,
      };

      if (__DEV__) console.log('💾 Creating expense with data:', JSON.stringify(expenseData, null, 2));
      const newExpense = await createExpense(user.id, expenseData);
      if (__DEV__) console.log('✅ Expense created in DB:', JSON.stringify(newExpense, null, 2));

      // 3. Update scan quota ONLY if from OCR (not manual entry)
      if (fromOCR) {
        await updateScanQuota(user.id);
      }

      // 4. Update streak (don't block on error)
      await updateStreak(user.id);

      // 5. Add to local store
      addExpense(newExpense);

      haptics.success();
      Alert.alert('Success', 'Expense added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving expense:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    haptics.light();
    navigation.goBack();
  };

  const toggleCurrencyPicker = () => {
    haptics.light();
    setShowCurrencyPicker(!showCurrencyPicker);
  };

  const selectCurrency = (currencyCode: string) => {
    haptics.light();
    setCurrency(currencyCode);
    setShowCurrencyPicker(false);
  };

  const selectCategory = (categoryName: string) => {
    haptics.light();
    setSelectedCategory(categoryName);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* OCR Pre-fill Banner */}
          {fromOCR && (
            <View style={styles.ocrBanner}>
              <Text style={styles.ocrBannerIcon}>✨</Text>
              <View style={styles.ocrBannerTextContainer}>
                <Text style={styles.ocrBannerTitle}>Auto-filled from receipt</Text>
                <Text style={styles.ocrBannerSubtitle}>Please verify the details below</Text>
              </View>
            </View>
          )}

          {/* Receipt Image Preview */}
          {receiptUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: receiptUri }} style={styles.receiptImage} />
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountRow}>
              <TouchableOpacity
                onPress={toggleCurrencyPicker}
                style={styles.currencyButton}
              >
                <Text style={styles.currencyText}>
                  {CURRENCIES.find((c) => c.code === currency)?.symbol || '$'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>

          {/* Currency Picker */}
          {showCurrencyPicker && (
            <View style={styles.currencyPicker}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyOption,
                    currency === curr.code && styles.currencyOptionSelected,
                  ]}
                  onPress={() => selectCurrency(curr.code)}
                >
                  <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === cat.name && styles.categoryCardSelected,
                  ]}
                  onPress={() => selectCategory(cat.name)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory === cat.name && styles.categoryNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Merchant Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Merchant (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="e.g., Starbucks"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              uploadingImage ? (
                <>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
                    Uploading image...
                  </Text>
                </>
              ) : (
                <>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
                    Saving...
                  </Text>
                </>
              )
            ) : (
              <Text style={styles.saveButtonText}>Save Expense</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  imageContainer: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.shadow.small,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
  },
  currencyButton: {
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  currencyText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  currencyPicker: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
  },
  currencyOptionSelected: {
    backgroundColor: colors.primary,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    width: 40,
  },
  currencyName: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  categoryCard: {
    width: '31.33%',
    aspectRatio: 1,
    margin: theme.spacing.xs,
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent + '10',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  noteInput: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.large,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  ocrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  ocrBannerIcon: {
    fontSize: 28,
    marginRight: theme.spacing.sm,
  },
  ocrBannerTextContainer: {
    flex: 1,
  },
  ocrBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  ocrBannerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
