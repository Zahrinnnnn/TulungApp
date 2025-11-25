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
import {
  BudgetAlert as BudgetAlertType,
  getBudgetAlertColor,
  getBudgetAlertIcon,
} from '../utils/budgetUtils';

interface BudgetAlertProps {
  alert: BudgetAlertType | null;
  onDismiss?: () => void;
}

export default function BudgetAlert({ alert, onDismiss }: BudgetAlertProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Show banner with slide-down animation
  useEffect(() => {
    if (alert) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Pulse animation for critical alerts
      if (alert.type === 'critical') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 500,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [alert]);

  const handleDismiss = () => {
    haptics.light();
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!alert) {
    return null;
  }

  const backgroundColor = getBudgetAlertColor(alert.type);
  const icon = getBudgetAlertIcon(alert.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [
            { translateY: slideAnim },
            { scale: alert.type === 'critical' ? pulseAnim : 1 },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>

      {onDismiss && (
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  dismissButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  dismissText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },
});
