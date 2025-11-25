import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { colors, theme } from '../constants/colors';

interface StreakBadgeProps {
  streakCount: number;
}

export default function StreakBadge({ streakCount }: StreakBadgeProps) {
  const [sparkleAnim] = useState(new Animated.Value(0));

  // Determine badge style based on streak length
  const getBadgeStyle = () => {
    if (streakCount >= 30) {
      // Platinum (30+ days)
      return {
        backgroundColor: '#E5E4E2',
        borderColor: '#C0C0C0',
        emoji: '💎',
      };
    } else if (streakCount >= 7) {
      // Gold (7+ days)
      return {
        backgroundColor: '#FFD700',
        borderColor: '#FFA500',
        emoji: '🔥',
      };
    } else {
      // Default
      return {
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        emoji: '🔥',
      };
    }
  };

  const badgeStyle = getBadgeStyle();

  // Sparkle animation for platinum badges
  useEffect(() => {
    if (streakCount >= 30) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [streakCount]);

  // Sparkle opacity interpolation
  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  if (streakCount === 0) {
    return null; // Don't show badge if no streak
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeStyle.backgroundColor,
          borderColor: badgeStyle.borderColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{badgeStyle.emoji}</Text>
      <Text style={styles.streakText}>
        {streakCount} {streakCount === 1 ? 'day' : 'days'}
      </Text>

      {streakCount >= 30 && (
        <Animated.Text style={[styles.sparkle, { opacity: sparkleOpacity }]}>
          ✨
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    position: 'relative',
  },
  emoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sparkle: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: -4,
    fontSize: 16,
  },
});
