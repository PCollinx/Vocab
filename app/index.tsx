/**
 * App Entry Point
 * Redirects based on onboarding status
 */

import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/appStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/constants';

export default function Index() {
  const { hasCompletedOnboarding, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
