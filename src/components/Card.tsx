import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, borderRadius, shadows } from "../constants/spacing";

type CardVariant = "elevated" | "outlined" | "filled";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  padding = "md",
  style,
}) => {
  const { colors } = useTheme();

  const variantStyle: ViewStyle =
    variant === "elevated"
      ? { backgroundColor: colors.surface, ...(shadows.md as ViewStyle) }
      : variant === "outlined"
        ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
        : { backgroundColor: colors.primaryLight };

  return (
    <View
      style={[
        styles.base,
        variantStyle,
        styles[`padding_${padding}`],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  padding_none: { padding: 0 },
  padding_sm: { padding: spacing[3] },
  padding_md: { padding: spacing[4] },
  padding_lg: { padding: spacing[6] },
});
