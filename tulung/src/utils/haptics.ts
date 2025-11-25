import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities
 * Provides consistent haptic feedback across the app
 */

export const haptics = {
  /**
   * Light impact - for subtle interactions (toggle, select)
   */
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported on device
      console.debug('Haptics not supported');
    }
  },

  /**
   * Medium impact - for button presses
   */
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.debug('Haptics not supported');
    }
  },

  /**
   * Heavy impact - for important actions (delete, submit)
   */
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.debug('Haptics not supported');
    }
  },

  /**
   * Success notification - for successful actions
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.debug('Haptics not supported');
    }
  },

  /**
   * Warning notification - for warnings
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.debug('Haptics not supported');
    }
  },

  /**
   * Error notification - for errors
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.debug('Haptics not supported');
    }
  },

  /**
   * Selection change - for picker/selector changes
   */
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.debug('Haptics not supported');
    }
  },
};
