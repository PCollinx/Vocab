/**
 * Theme Configuration
 * Combined design system export
 */

import { colors, blue, coral, green, amber, gray } from "./colors";
import {
  fontSizes,
  fontWeights,
  letterSpacing,
  textStyles,
} from "./typography";
import { spacing, borderRadius, shadows } from "./spacing";

export const theme = {
  colors,
  palettes: {
    blue,
    coral,
    green,
    amber,
    gray,
  },
  fontSizes,
  fontWeights,
  letterSpacing,
  textStyles,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

// Re-export individual pieces for convenience
export { colors, blue, coral, green, amber, gray } from "./colors";
export {
  fontSizes,
  fontWeights,
  letterSpacing,
  textStyles,
} from "./typography";
export { spacing, borderRadius, shadows } from "./spacing";
