/**
 * Button Component
 * Primary CTA and secondary actions
 */

import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Text } from "./Text";
import { colors } from "../constants/colors";
import { spacing, borderRadius } from "../constants/spacing";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  style,
}) => {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textColor = getTextColor(variant, isDisabled);

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Text
            variant={size === "sm" ? "buttonSmall" : "button"}
            style={[
              { color: textColor },
              icon && iconPosition === "left" ? styles.textWithLeftIcon : null,
              icon && iconPosition === "right"
                ? styles.textWithRightIcon
                : null,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const getTextColor = (variant: ButtonVariant, disabled: boolean): string => {
  if (disabled) return colors.textMuted;

  switch (variant) {
    case "primary":
      return colors.primaryText;
    case "secondary":
      return colors.primary;
    case "outline":
      return colors.primary;
    case "ghost":
      return colors.textBody;
    default:
      return colors.primaryText;
  }
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primaryContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
  },
  secondaryContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.xl,
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },

  // Sizes
  smContainer: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 36,
  },
  mdContainer: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: 48,
  },
  lgContainer: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minHeight: 56,
  },

  // Icon spacing
  textWithLeftIcon: {
    marginLeft: spacing[2],
  },
  textWithRightIcon: {
    marginRight: spacing[2],
  },
});
