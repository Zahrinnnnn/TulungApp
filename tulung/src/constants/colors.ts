// Tulung Color Palette — Gen Z Edition
// Version: 1.0 MLP

export const colors = {
  // Brand
  primary: '#1DD3C0',
  primaryDark: '#0FB9A8',
  accent: '#2DE5E8',

  // Semantic
  success: '#00D9A3',
  warning: '#FFB020',
  danger: '#FF5370',
  info: '#57B8FF',

  // Burn Rate Meter
  burnSafe: '#00D9A3',
  burnCaution: '#FFB020',
  burnDanger: '#FF8C42',
  burnOver: '#FF5370',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F9FA',
  border: '#E9ECEF',
  cardBackground: '#FFFFFF',
  shadow: '#000000',

  // Text
  textPrimary: '#1A1D29',
  textSecondary: '#4A5568',
  textTertiary: '#9CA3AF',

  // Dark Mode (future)
  darkBg: '#0F172A',
  darkCard: '#1E293B',
  darkText: '#F1F5F9',
};

export const theme = {
  colors,

  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    large: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  // Border Radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};
