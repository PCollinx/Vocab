import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Text } from "./Text";
import { useTheme } from "../context/ThemeContext";
import { spacing, borderRadius } from "../constants/spacing";

type BadgeVariant =
  | "primary"
  | "accent"
  | "correct"
  | "wrong"
  | "streak"
  | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  style,
}) => {
  const { colors } = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: colors.primaryLight, text: colors.primaryLightText },
    accent: { bg: colors.accentLight, text: colors.accentLightText },
    correct: { bg: colors.correctLight, text: colors.correctLightText },
    wrong: { bg: colors.wrongLight, text: colors.wrongLightText },
    streak: { bg: colors.streakLight, text: colors.streakLightText },
    muted: { bg: colors.border, text: colors.textMuted },
  };

  const { bg, text } = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text variant="label" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
});
