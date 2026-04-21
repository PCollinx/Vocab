/**
 * Typography System
 * Consistent text styles across the app
 */

import { TextStyle } from "react-native";

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

export const fontWeights: Record<string, TextStyle["fontWeight"]> = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

// Pre-defined text styles with proper React Native lineHeight (absolute values)
export const textStyles: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: fontSizes["4xl"],
    fontWeight: "700",
    lineHeight: 44, // fontSize * 1.2
  },
  h2: {
    fontSize: fontSizes["3xl"],
    fontWeight: "700",
    lineHeight: 36,
  },
  h3: {
    fontSize: fontSizes["2xl"],
    fontWeight: "600",
    lineHeight: 30,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: "600",
    lineHeight: 28,
  },

  // Body text
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: "400",
    lineHeight: 28,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: "400",
    lineHeight: 20,
  },

  // Labels & captions
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: "400",
    lineHeight: 16,
  },

  // Button text
  button: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    lineHeight: 20,
  },
} as const;

export type FontSizes = typeof fontSizes;
export type TextStyles = typeof textStyles;
