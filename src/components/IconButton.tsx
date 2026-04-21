/**
 * Icon Button Component
 * Circular button for icons
 */

import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../constants/colors";
import { spacing, borderRadius, shadows } from "../constants/spacing";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "elevated";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = "ghost",
  size = "md",
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadows.md,
  },

  // Sizes
  size_sm: {
    width: 32,
    height: 32,
  },
  size_md: {
    width: 44,
    height: 44,
  },
  size_lg: {
    width: 56,
    height: 56,
  },
});
