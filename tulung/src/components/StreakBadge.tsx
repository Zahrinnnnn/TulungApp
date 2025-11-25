import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { colors, theme } from '../constants/colors';
import { haptics } from '../utils/haptics';

interface StreakBadgeProps {
  streakCount: number;
  onPress?: () => void;
}

export default function StreakBadge({ streakCount, onPress }: StreakBadgeProps) {
  const [sparkleAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

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

  // Scale animation on press
  const handlePressIn = () => {
    haptics.light();
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      haptics.light();
      onPress();
    }
  };

  // Sparkle opacity interpolation
  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  if (streakCount === 0) {
    return null; // Don't show badge if no streak
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: badgeStyle.backgroundColor,
            borderColor: badgeStyle.borderColor,
            transform: [{ scale: scaleAnim }],
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
      </Animated.View>

      {onPress && (
        <Text style={styles.hintText}>Tap to view history</Text>
      )}
    </TouchableOpacity>
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
  hintText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});
