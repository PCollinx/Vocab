import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { textStyles } from "../constants/typography";

type TextVariant = keyof typeof textStyles;
type TextColor =
  | "heading"
  | "body"
  | "muted"
  | "hint"
  | "primary"
  | "accent"
  | "correct"
  | "wrong"
  | "white";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  center?: boolean;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = "body",
  color = "body",
  center = false,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const colorMap: Record<TextColor, string> = {
    heading: colors.textHeading,
    body: colors.textBody,
    muted: colors.textMuted,
    hint: colors.textHint,
    primary: colors.primary,
    accent: colors.accent,
    correct: colors.correct,
    wrong: colors.wrong,
    white: colors.white,
  };

  const variantStyle = textStyles[variant] as TextStyle;
  const textColor = colorMap[color];

  return (
    <RNText
      style={[
        variantStyle,
        { color: textColor },
        center && styles.center,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  center: {
    textAlign: "center",
  },
});
