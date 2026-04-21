/**
 * Progress Screen
 * User statistics and learning journey
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Card, ProgressBar } from '../../src/components';
import { colors, spacing, borderRadius } from '../../src/constants';
import { useAppStore } from '../../src/store/appStore';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProgressScreen() {
  const { currentStreak, longestStreak, totalWordsLearned, weeklyActivity } = useAppStore();

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Container>
      <ScrollView 
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" color="primary">
            Your{' '}
            <Text variant="h2" style={{ color: colors.accent }}>
              Progress!
            </Text>
          </Text>
          <Text variant="body" color="muted">
            Track your learning, day by day!
          </Text>
          <Text variant="caption" color="muted">
            {today}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text variant="h2" color="heading">
              {totalWordsLearned}
            </Text>
            <Text variant="caption" color="muted">
              Total Learned
            </Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.streakLight }]}>
            <Ionicons name="flame" size={28} color={colors.streak} />
            <Text variant="h2" color="heading">
              {currentStreak}
            </Text>
            <Text variant="caption" color="muted">
              Current Streak
            </Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.correctLight }]}>
            <Ionicons name="trophy" size={28} color={colors.correct} />
            <Text variant="h2" color="heading">
              {longestStreak}
            </Text>
            <Text variant="caption" color="muted">
              Longest Streak
            </Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="calendar" size={28} color={colors.accent} />
            <Text variant="h2" color="heading">
              {today.split(' ')[1].replace(',', '')}
            </Text>
            <Text variant="caption" color="muted">
              Last Learned
            </Text>
          </Card>
        </View>

        {/* Weekly Progress */}
        <Card style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Text variant="h4" color="heading">
              Weekly Progress
            </Text>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            {[8, 12, 15, 10, 18, 14, 7].map((value, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(value / 20) * 100}%`,
                        backgroundColor: index % 2 === 0 ? colors.primary : colors.accent,
                      },
                    ]}
                  />
                </View>
                <Text variant="caption" color="muted" style={styles.dayLabel}>
                  {weekDays[index]}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Learning Consistency */}
        <Card>
          <View style={styles.consistencyHeader}>
            <Text variant="h4" color="heading">
              Learning Consistency
            </Text>
            <View style={styles.legendContainer}>
              <Text variant="caption" color="muted">Less</Text>
              <View style={styles.legendColors}>
                {[colors.primaryLight, '#B5D4F4', '#85B7EB', colors.primary].map((color, i) => (
                  <View key={i} style={[styles.legendBox, { backgroundColor: color }]} />
                ))}
              </View>
              <Text variant="caption" color="muted">More</Text>
            </View>
          </View>

          {/* Heatmap Grid */}
          <View style={styles.heatmapContainer}>
            {weekDays.map((day, dayIndex) => (
              <View key={day} style={styles.heatmapRow}>
                <Text variant="caption" color="muted" style={styles.heatmapDayLabel}>
                  {day}
                </Text>
                {[0, 1, 2, 3].map((week) => {
                  const intensity = Math.random();
                  let bgColor: string = colors.primaryLight;
                  if (intensity > 0.75) bgColor = colors.primary;
                  else if (intensity > 0.5) bgColor = '#85B7EB';
                  else if (intensity > 0.25) bgColor = '#B5D4F4';
                  
                  return (
                    <View
                      key={week}
                      style={[styles.heatmapCell, { backgroundColor: bgColor }]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </Card>

        {/* Goals Section */}
        <Card style={styles.goalsCard}>
          <Text variant="h4" color="heading" style={styles.goalsTitle}>
            Weekly Goals
          </Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text variant="body" color="heading">Words Learned</Text>
              <Text variant="caption" color="muted">5 of 7</Text>
            </View>
            <ProgressBar progress={5/7} color={colors.correct} />
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text variant="body" color="heading">Quiz Accuracy</Text>
              <Text variant="caption" color="muted">85%</Text>
            </View>
            <ProgressBar progress={0.85} color={colors.primary} />
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text variant="body" color="heading">Daily Streak</Text>
              <Text variant="caption" color="muted">{currentStreak} days</Text>
            </View>
            <ProgressBar progress={currentStreak / 30} color={colors.streak} />
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingVertical: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  weeklyCard: {
    marginBottom: spacing[4],
  },
  weeklyHeader: {
    marginBottom: spacing[4],
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: spacing[2],
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barBackground: {
    flex: 1,
    width: 24,
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.md,
  },
  dayLabel: {
    marginTop: spacing[2],
  },
  consistencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  legendColors: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.sm,
  },
  heatmapContainer: {
    gap: spacing[2],
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  heatmapDayLabel: {
    width: 32,
  },
  heatmapCell: {
    flex: 1,
    height: 32,
    borderRadius: borderRadius.md,
  },
  goalsCard: {
    marginTop: spacing[4],
  },
  goalsTitle: {
    marginBottom: spacing[4],
  },
  goalItem: {
    marginBottom: spacing[4],
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  bottomSpacer: {
    height: spacing[20],
  },
});
