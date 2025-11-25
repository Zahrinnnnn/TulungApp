import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, theme } from '../constants/colors';
import { haptics } from '../utils/haptics';

interface BurnRateMeterProps {
  todayTotal: number;
  dailyBudget: number;
  currency: string;
  onPress?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BurnRateMeter({
  todayTotal,
  dailyBudget,
  currency,
  onPress,
}: BurnRateMeterProps) {
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));

  // Calculate percentage
  const percentSpent = dailyBudget > 0 ? Math.min((todayTotal / dailyBudget) * 100, 150) : 0;

  // Circle dimensions
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Get color based on percentage
  const getMeterColor = () => {
    if (percentSpent >= 100) return colors.burnOver; // Dark red
    if (percentSpent >= 80) return colors.burnDanger; // Orange
    if (percentSpent >= 50) return colors.burnCaution; // Yellow
    return colors.burnSafe; // Green
  };

  const meterColor = getMeterColor();

  // Animate progress when percentage changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentSpent,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percentSpent]);

  // Pulse animation when new expense added (todayTotal changes)
  useEffect(() => {
    if (todayTotal > 0) {
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [todayTotal]);

  // Calculate stroke dash offset for progress
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const handlePress = () => {
    if (onPress) {
      haptics.light();
      onPress();
    }
  };

  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={meterColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.amountText}>{formatAmount(todayTotal)}</Text>
          <Text style={styles.dividerText}>/</Text>
          <Text style={styles.budgetText}>{formatAmount(dailyBudget)}</Text>
          <Text style={[styles.percentText, { color: meterColor }]}>
            {percentSpent.toFixed(0)}% spent
          </Text>
        </View>
      </Animated.View>

      {onPress && (
        <Text style={styles.hintText}>Tap to view breakdown</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dividerText: {
    fontSize: 20,
    color: colors.textTertiary,
    marginVertical: 2,
  },
  budgetText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  hintText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
});
