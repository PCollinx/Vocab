/**
 * Container Component
 * Screen wrapper with safe area and background
 */

import React from "react";
import { View, StyleSheet, ViewStyle, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
  statusBarStyle?: "light-content" | "dark-content";
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padded = true,
  safeArea = true,
  backgroundColor = colors.background,
  statusBarStyle = "dark-content",
}) => {
  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper style={[styles.container, { backgroundColor }, style]}>
      <StatusBar barStyle={statusBarStyle} />
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
