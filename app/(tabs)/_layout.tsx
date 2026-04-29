/**
 * Tab Layout
 * Bottom navigation with 4 tabs using custom tab bar
 */

import { useRef, useEffect, useState } from "react";
import { Tabs } from "expo-router";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants";

interface TabIconProps {
  label: string;
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  iconNameFocused: keyof typeof Ionicons.glyphMap;
}

function TabIcon({ label, focused, iconName, iconNameFocused }: TabIconProps) {
  const animatedValue = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", colors.primary],
  });

  const paddingHorizontal = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 9],
  });

  const labelOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const labelWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, measuredLabelWidth],
  });

  const labelMargin = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <Animated.View
      style={[styles.tabItem, { backgroundColor, paddingHorizontal }]}
    >
      <Ionicons
        name={focused ? iconNameFocused : iconName}
        size={20}
        color={focused ? colors.white : colors.textMuted}
      />
      <Animated.View
        style={[
          styles.labelContainer,
          { opacity: labelOpacity, width: labelWidth, marginLeft: labelMargin },
        ]}
      >
        <Text style={styles.tabLabel} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
      <Text
        style={styles.tabLabelMeasure}
        onLayout={(event) => {
          const width = Math.ceil(event.nativeEvent.layout.width) + 2;
          if (width !== measuredLabelWidth) {
            setMeasuredLabelWidth(width);
          }
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: "index", label: "Home", icon: "home-outline", iconFocused: "home" },
    {
      name: "discover",
      label: "Discover",
      icon: "compass-outline",
      iconFocused: "compass",
    },
    {
      name: "progress",
      label: "Progress",
      icon: "bar-chart-outline",
      iconFocused: "bar-chart",
    },
    {
      name: "profile",
      label: "Profile",
      icon: "person-outline",
      iconFocused: "person",
    },
  ];

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 8 },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
            >
              <TabIcon
                label={tab.label}
                focused={isFocused}
                iconName={tab.icon as keyof typeof Ionicons.glyphMap}
                iconNameFocused={
                  tab.iconFocused as keyof typeof Ionicons.glyphMap
                }
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 2,
  },
  tabBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: colors.textHeading,
    borderRadius: 32,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  labelContainer: {
    overflow: "hidden",
  },
  tabLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tabLabelMeasure: {
    position: "absolute",
    opacity: 0,
    fontSize: 12,
    fontWeight: "600",
  },
});
