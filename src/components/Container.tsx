import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  safeArea?: boolean;
  edges?: Edge[];
  backgroundColor?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padded = true,
  safeArea = true,
  edges = ['top', 'left', 'right'],
  backgroundColor,
}) => {
  const { colors } = useTheme();
  const Wrapper = safeArea ? SafeAreaView : View;
  const bg = backgroundColor ?? colors.background;

  return (
    <Wrapper edges={safeArea ? edges : undefined} style={[styles.container, { backgroundColor: bg }, style]}>
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing[4],
  },
});
