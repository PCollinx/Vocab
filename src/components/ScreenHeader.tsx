import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../constants';

interface ScreenHeaderProps {
  iconName: keyof typeof Ionicons.glyphMap;
  eyebrow: string;
  title: string;
  subtitle: string;
  count: number | string;
  countLabel: string;
  children?: React.ReactNode;
}

export function ScreenHeader({ iconName, eyebrow, title, subtitle, count, countLabel, children }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerEyebrowRow}>
            <View style={styles.headerIconWrap}>
              <Ionicons name={iconName} size={14} color={colors.primary} />
            </View>
            <Text variant="caption" style={styles.headerEyebrowText}>
              {eyebrow}
            </Text>
          </View>
          <Text variant="h2" color="heading" style={styles.headerTitle}>
            {title}
          </Text>
          <Text variant="body" color="muted">
            {subtitle}
          </Text>
          {children}
        </View>
        <View style={styles.headerCountPill}>
          <Text variant="h4" style={styles.headerCountText}>
            {count}
          </Text>
          <Text variant="caption" color="muted">
            {countLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  headerTitleWrap: {
    flex: 1,
    gap: spacing[1],
  },
  headerEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerIconWrap: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrowText: {
    letterSpacing: 0.8,
    color: colors.textMuted,
    fontWeight: '700',
  },
  headerTitle: {
    marginTop: 2,
  },
  headerCountPill: {
    minWidth: 64,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  headerCountText: {
    color: colors.primary,
  },
});
