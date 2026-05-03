/**
 * Progress Screen
 * User statistics and learning journey
 */

import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container, Text, Card, ProgressBar } from "../../src/components";
import { colors, spacing, borderRadius } from "../../src/constants";
import { useAppStore } from "../../src/store/appStore";
import { WordProgress } from "../../src/types";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper function to get the start of the week (Monday)
const getWeekStart = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to count words learned per day of the week
const getWeeklyWordCounts = (learnedWords: WordProgress[]) => {
  const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  const weekStart = getWeekStart();

  learnedWords.forEach((word) => {
    const reviewedDate = new Date(word.lastReviewed);
    if (reviewedDate >= weekStart) {
      const dayOfWeek = reviewedDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to index 6
      counts[dayIndex]++;
    }
  });

  return counts;
};

// Helper function to get the most recent learned date
const getLastLearnedDate = (learnedWords: WordProgress[]) => {
  if (learnedWords.length === 0) return null;

  const sortedByDate = [...learnedWords].sort(
    (a, b) =>
      new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime(),
  );

  return new Date(sortedByDate[0].lastReviewed);
};

// Helper function to get word counts for the past 4 weeks (28 days)
const getFourWeeksWordCounts = (learnedWords: WordProgress[]) => {
  // Returns array: [week0[Mon-Sun], week1[Mon-Sun], week2[Mon-Sun], week3[Mon-Sun]]
  const weeks = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  learnedWords.forEach((word) => {
    const reviewedDate = new Date(word.lastReviewed);
    reviewedDate.setHours(0, 0, 0, 0);

    const daysAgo = Math.floor(
      (today.getTime() - reviewedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only count words from the past 28 days
    if (daysAgo >= 0 && daysAgo < 28) {
      const weekIndex = Math.floor(daysAgo / 7);
      const dayOfWeek = reviewedDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      weeks[3 - weekIndex][dayIndex]++; // 3-weekIndex to reverse order (oldest first)
    }
  });

  return weeks;
};

export default function ProgressScreen() {
  const {
    currentStreak,
    longestStreak,
    totalWordsLearned,
    weeklyActivity,
    learnedWords,
  } = useAppStore();

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Get actual weekly word counts
  const weeklyWordCounts = getWeeklyWordCounts(learnedWords);

  // Get actual last learned date
  const lastLearnedDate = getLastLearnedDate(learnedWords);
  const lastLearnedDay = lastLearnedDate
    ? lastLearnedDate.getDate().toString()
    : new Date().getDate().toString();

  // Get 4 weeks of history for the heatmap
  const fourWeeksData = getFourWeeksWordCounts(learnedWords);

  return (
    <Container>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerEyebrowRow}>
                <View style={styles.headerIconWrap}>
                  <Ionicons
                    name="trending-up"
                    size={14}
                    color={colors.primary}
                  />
                </View>
                <Text variant="caption" style={styles.headerEyebrowText}>
                  LEARNING JOURNEY
                </Text>
              </View>
              <Text variant="h2" color="heading" style={styles.headerTitle}>
                Progress
              </Text>
              <Text variant="body" color="muted">
                Track your learning, day by day
              </Text>
              <Text variant="caption" color="muted">
                {today}
              </Text>
            </View>
            <View style={styles.headerCountPill}>
              <Text variant="h4" style={styles.headerCountText}>
                {totalWordsLearned}
              </Text>
              <Text variant="caption" color="muted">
                learned
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card
            style={[styles.statCard, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text variant="h2" color="heading">
              {totalWordsLearned}
            </Text>
            <Text variant="caption" color="muted">
              Total Learned
            </Text>
          </Card>

          <Card
            style={[styles.statCard, { backgroundColor: colors.streakLight }]}
          >
            <Ionicons name="flame" size={28} color={colors.streak} />
            <Text variant="h2" color="heading">
              {currentStreak}
            </Text>
            <Text variant="caption" color="muted">
              Current Streak
            </Text>
          </Card>

          <Card
            style={[styles.statCard, { backgroundColor: colors.correctLight }]}
          >
            <Ionicons name="trophy" size={28} color={colors.correct} />
            <Text variant="h2" color="heading">
              {longestStreak}
            </Text>
            <Text variant="caption" color="muted">
              Longest Streak
            </Text>
          </Card>

          <Card
            style={[styles.statCard, { backgroundColor: colors.accentLight }]}
          >
            <Ionicons name="calendar" size={28} color={colors.accent} />
            <Text variant="h2" color="heading">
              {lastLearnedDay}
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
            <Text variant="caption" color="muted">
              Goal: 5 words/day
            </Text>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            {weeklyWordCounts.map((value, index) => {
              const maxValue = 25; // Maximum scale for chart (5 words/day * 5 days avg)
              const percentage = Math.min((value / maxValue) * 100, 100);
              const isMetGoal = value >= 5;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${percentage}%`,
                          backgroundColor: isMetGoal
                            ? colors.correct
                            : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text variant="caption" color="muted" style={styles.barValue}>
                    {value}
                  </Text>
                  <Text variant="caption" color="muted" style={styles.dayLabel}>
                    {weekDays[index]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Learning Consistency */}
        <Card>
          <View style={styles.consistencyHeader}>
            <Text variant="h4" color="heading">
              Learning Consistency
            </Text>
            <View style={styles.legendContainer}>
              <Text variant="caption" color="muted">
                Less
              </Text>
              <View style={styles.legendColors}>
                {[
                  colors.primaryLight,
                  "#B5D4F4",
                  "#85B7EB",
                  colors.primary,
                ].map((color, i) => (
                  <View
                    key={i}
                    style={[styles.legendBox, { backgroundColor: color }]}
                  />
                ))}
              </View>
              <Text variant="caption" color="muted">
                More
              </Text>
            </View>
          </View>

          {/* Heatmap Grid */}
          <View style={styles.heatmapContainer}>
            {weekDays.map((day, dayIndex) => (
              <View key={day} style={styles.heatmapRow}>
                <Text
                  variant="caption"
                  color="muted"
                  style={styles.heatmapDayLabel}
                >
                  {day}
                </Text>
                {fourWeeksData.map((week, weekIndex) => {
                  const value = week[dayIndex];
                  // Color intensity based on word count goal of 5/day
                  let bgColor: string = colors.primaryLight;
                  if (value >= 15) bgColor = colors.primary;
                  else if (value >= 10) bgColor = "#85B7EB";
                  else if (value >= 5) bgColor = "#B5D4F4";

                  return (
                    <View
                      key={weekIndex}
                      style={[styles.heatmapCell, { backgroundColor: bgColor }]}
                    />
                  );
                })}
              </View>
            ))}
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius["2xl"],
    padding: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  headerTitleWrap: {
    flex: 1,
    gap: spacing[1],
  },
  headerEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  headerIconWrap: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerEyebrowText: {
    letterSpacing: 0.8,
    color: colors.textMuted,
    fontWeight: "700",
  },
  headerTitle: {
    marginTop: 2,
  },
  headerCountPill: {
    minWidth: 72,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  headerCountText: {
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    paddingVertical: spacing[4],
  },
  weeklyCard: {
    marginBottom: spacing[4],
  },
  weeklyHeader: {
    marginBottom: spacing[4],
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 150,
    paddingTop: spacing[2],
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barBackground: {
    flex: 1,
    width: 24,
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: borderRadius.md,
  },
  barValue: {
    marginTop: spacing[1],
    fontWeight: "600",
  },
  dayLabel: {
    marginTop: spacing[2],
  },
  consistencyHeader: {
    marginBottom: spacing[4],
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  legendColors: {
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
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
  bottomSpacer: {
    height: spacing[20],
  },
});
