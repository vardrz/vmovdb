/**
 * App color palette
 * Centralized color definitions for consistent theming across the app
 */

export const COLORS = {
  // Base colors
  primary: '#2ecc71',    // Main green color
  primaryDark: '#27ae60', // Darker green
  primaryDeep: '#145a32', // Deepest green
  
  // Neutral colors
  black: '#000000',
  white: '#FFFFFF',
  
  // Background colors
  background: '#000000',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  
  // Gradient arrays
  gradients: {
    primaryButton: ['#2ecc71', '#27ae60', '#145a32'],
    backgroundOverlay: ['transparent', '#000000'],
  }
};

export default COLORS;