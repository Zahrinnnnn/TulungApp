import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { colors, theme } from '../constants/colors';
import { haptics } from '../utils/haptics';
import { MilestoneInfo } from '../utils/streakUtils';

interface MilestoneModalProps {
  visible: boolean;
  milestone: MilestoneInfo | null;
  onDismiss: () => void;
  onShare?: () => void;
}

const { width, height } = Dimensions.get('window');

// Create confetti pieces
interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
}

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
const CONFETTI_COUNT = 50;

export default function MilestoneModal({
  visible,
  milestone,
  onDismiss,
  onShare,
}: MilestoneModalProps) {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  // Generate confetti pieces
  useEffect(() => {
    if (visible) {
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        pieces.push({
          id: i,
          x: new Animated.Value(Math.random() * width),
          y: new Animated.Value(-50),
          rotation: new Animated.Value(0),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        });
      }
      setConfetti(pieces);
    }
  }, [visible]);

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      haptics.success();

      // Modal scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animate confetti
      confetti.forEach((piece, index) => {
        // Store initial x value before animation
        const initialX = Math.random() * width;
        const finalX = initialX + (Math.random() - 0.5) * 200;

        Animated.parallel([
          Animated.timing(piece.y, {
            toValue: height + 100,
            duration: 3000 + Math.random() * 1000,
            delay: index * 30,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: Math.random() > 0.5 ? 360 : -360,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(piece.x, {
            toValue: finalX,
            duration: 3000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    haptics.light();
    onDismiss();
  };

  const handleShare = () => {
    if (onShare) {
      haptics.light();
      onShare();
    }
  };

  if (!visible || !milestone) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        {/* Background overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.85],
              }),
            },
          ]}
        />

        {/* Confetti */}
        {confetti.map((piece) => (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: piece.color,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  {
                    rotate: piece.rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Content card */}
        <Animated.View
          style={[
            styles.contentCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{milestone.emoji}</Text>
          <Text style={styles.title}>{milestone.title}</Text>
          <Text style={styles.message}>{milestone.message}</Text>
          <Text style={styles.streakCount}>{milestone.days} Day Streak!</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleDismiss}>
            <Text style={styles.primaryButtonText}>Keep it up!</Text>
          </TouchableOpacity>

          {onShare && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
              <Text style={styles.secondaryButtonText}>Share Achievement 📤</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.shadow,
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
