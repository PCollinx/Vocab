import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/appStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';

export default function Index() {
  const { colors } = useTheme();
  const { hasCompletedOnboarding, isLoggedIn, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isLoggedIn) return <Redirect href="/auth" />;
  if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
