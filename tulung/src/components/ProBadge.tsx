/**
 * ProBadge Component
 * Displays a "Pro Member" badge for Pro users
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../constants/colors';

interface ProBadgeProps {
  variant?: 'default' | 'compact';
}

export default function ProBadge({ variant = 'default' }: ProBadgeProps) {
  return (
    <View style={[styles.badge, variant === 'compact' && styles.badgeCompact]}>
      <Text style={[styles.text, variant === 'compact' && styles.textCompact]}>
        ✨ Pro Member
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  badgeCompact: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  text: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  textCompact: {
    fontSize: 10,
  },
});
