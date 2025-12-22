
import { StyleSheet, ViewStyle, TextStyle, useColorScheme, ColorSchemeName } from 'react-native';

// Light mode colors
const lightColors = {
  background: '#f0f0f0',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#007bff',
  secondary: '#6c757d',
  accent: '#28a745',
  card: '#ffffff',
  highlight: '#ffc107',
  border: '#e0e0e0',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
};

// Dark mode colors
const darkColors = {
  background: '#000000',
  text: '#ffffff',
  textSecondary: '#98989D',
  primary: '#0A84FF',
  secondary: '#8E8E93',
  accent: '#30D158',
  card: '#1C1C1E',
  highlight: '#FFD60A',
  border: '#38383A',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FFD60A',
};

// Export a function to get colors based on color scheme
export const getColors = (colorScheme: ColorSchemeName) => {
  return colorScheme === 'dark' ? darkColors : lightColors;
};

// Export default colors (light mode) for backwards compatibility
export const colors = lightColors;

// Hook to get current colors based on color scheme
export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  return getColors(colorScheme);
};

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: lightColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: lightColors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentButton: {
    backgroundColor: lightColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: lightColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: lightColors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: lightColors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: lightColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  input: {
    backgroundColor: lightColors.card,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: lightColors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 6,
  },
  section: {
    marginBottom: 20,
  },
});
