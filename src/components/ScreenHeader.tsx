import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../constants';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerEyebrowRow}>
            <View style={[styles.headerIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={iconName} size={14} color={colors.primary} />
            </View>
            <Text variant="caption" style={[styles.headerEyebrowText, { color: colors.textMuted }]}>
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
        <View style={[styles.headerCountPill, { backgroundColor: colors.background }]}>
          <Text variant="h4" style={{ color: colors.primary }}>
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
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrowText: {
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  headerTitle: {
    marginTop: 2,
  },
  headerCountPill: {
    minWidth: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
});
