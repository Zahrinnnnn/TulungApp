/**
 * QuotaBadge Component
 * Displays scan quota usage for free users or unlimited status for Pro users
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';

interface QuotaBadgeProps {
  scansUsed: number;
  scanLimit: number;
  isPro: boolean;
}

export default function QuotaBadge({ scansUsed, scanLimit, isPro }: QuotaBadgeProps) {
  if (isPro) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.proText]}>Unlimited</Text>
      </View>
    );
  }

  // Calculate remaining scans
  const remaining = Math.max(0, scanLimit - scansUsed);

  // Determine color based on usage
  const getColor = () => {
    if (scansUsed < 5) return colors.success; // Green
    if (scansUsed < scanLimit) return colors.warning; // Yellow
    return colors.danger; // Red
  };

  const usageColor = getColor();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: usageColor }]}>
        {scansUsed}/{scanLimit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  proText: {
    color: colors.primary,
  },
});
