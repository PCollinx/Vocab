import { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/colors';

interface TabIconProps {
  label: string;
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  iconNameFocused: keyof typeof Ionicons.glyphMap;
  colors: Colors;
}

const TAB_CONFIG = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'bookmarks', label: 'Saved', icon: 'bookmarks-outline', iconFocused: 'bookmarks' },
  { name: 'progress', label: 'Progress', icon: 'stats-chart-outline', iconFocused: 'stats-chart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconFocused: 'person' },
] as const;

function TabIcon({ label, focused, iconName, iconNameFocused, colors }: TabIconProps) {
  const animatedValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const labelOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const labelColor = focused ? colors.primary : colors.textMuted;

  return (
    <View style={styles.tabItem}>
      <Animated.View style={{ transform: [{ scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] }}>
        <Ionicons
          name={focused ? iconNameFocused : iconName}
          size={22}
          color={focused ? colors.primary : colors.textMuted}
        />
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, { color: labelColor, opacity: labelOpacity }]}>
        {label}
      </Animated.Text>
    </View>
  );
}

export function AnimatedTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderTopColor: colors.border,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const tab = TAB_CONFIG.find(t => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
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
            style={[
              styles.tabButton,
              { borderTopColor: isFocused ? colors.primary : 'transparent' },
            ]}
            android_ripple={{ color: colors.primaryLight, borderless: false }}
          >
            <TabIcon
              label={tab.label}
              focused={isFocused}
              iconName={tab.icon as keyof typeof Ionicons.glyphMap}
              iconNameFocused={tab.iconFocused as keyof typeof Ionicons.glyphMap}
              colors={colors}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
