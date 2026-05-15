import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor,
  height = 8,
  style,
}) => {
  const { colors } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const fillColor = color ?? colors.primary;
  const bgColor = backgroundColor ?? colors.border;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor, height, borderRadius: height / 2 },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: `${clampedProgress * 100}%`,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", overflow: "hidden" },
  fill: { height: "100%" },
});
