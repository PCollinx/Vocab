import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container, Text, Card, ProgressBar, ScreenHeader } from "../../src/components";
import { blue, spacing, borderRadius } from "../../src/constants";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppStore } from "../../src/store/appStore";
import { WordProgress } from "../../src/types";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getWeekStart = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeeklyWordCounts = (learnedWords: WordProgress[]) => {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const weekStart = getWeekStart();
  learnedWords.forEach((word) => {
    const reviewedDate = new Date(word.lastReviewed);
    if (reviewedDate >= weekStart) {
      const dayOfWeek = reviewedDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      counts[dayIndex]++;
    }
  });
  return counts;
};

const getLastLearnedDate = (learnedWords: WordProgress[]) => {
  if (learnedWords.length === 0) return null;
  const sortedByDate = [...learnedWords].sort(
    (a, b) => new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime(),
  );
  return new Date(sortedByDate[0].lastReviewed);
};

const getFourWeeksWordCounts = (learnedWords: WordProgress[]) => {
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
    if (daysAgo >= 0 && daysAgo < 28) {
      const weekIndex = Math.floor(daysAgo / 7);
      const dayOfWeek = reviewedDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weeks[3 - weekIndex][dayIndex]++;
    }
  });
  return weeks;
};

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { currentStreak, longestStreak, totalWordsLearned, learnedWords } = useAppStore();

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const weeklyWordCounts = getWeeklyWordCounts(learnedWords);
  const lastLearnedDate = getLastLearnedDate(learnedWords);
  const lastLearnedDay = lastLearnedDate
    ? lastLearnedDate.getDate().toString()
    : new Date().getDate().toString();
  const fourWeeksData = getFourWeeksWordCounts(learnedWords);

  return (
    <Container>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          iconName="trending-up"
          eyebrow="LEARNING JOURNEY"
          title="Progress"
          subtitle="Track your learning, day by day"
          count={totalWordsLearned}
          countLabel="learned"
        >
          <Text variant="caption" color="muted">{today}</Text>
        </ScreenHeader>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text variant="h2" color="heading">{totalWordsLearned}</Text>
            <Text variant="caption" color="muted">Total Learned</Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.streakLight }]}>
            <Ionicons name="flame" size={28} color={colors.streak} />
            <Text variant="h2" color="heading">{currentStreak}</Text>
            <Text variant="caption" color="muted">Current Streak</Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.correctLight }]}>
            <Ionicons name="trophy" size={28} color={colors.correct} />
            <Text variant="h2" color="heading">{longestStreak}</Text>
            <Text variant="caption" color="muted">Longest Streak</Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="calendar" size={28} color={colors.accent} />
            <Text variant="h2" color="heading">{lastLearnedDay}</Text>
            <Text variant="caption" color="muted">Last Learned</Text>
          </Card>
        </View>

        {/* Weekly Progress */}
        <Card style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Text variant="h4" color="heading">Weekly Progress</Text>
            <Text variant="caption" color="muted">Goal: 5 words/day</Text>
          </View>

          <View style={styles.chartContainer}>
            {weeklyWordCounts.map((value, index) => {
              const maxValue = 25;
              const percentage = Math.min((value / maxValue) * 100, 100);
              const isMetGoal = value >= 5;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${percentage}%`, backgroundColor: isMetGoal ? colors.correct : colors.primary },
                      ]}
                    />
                  </View>
                  <Text variant="caption" color="muted" style={styles.barValue}>{value}</Text>
                  <Text variant="caption" color="muted" style={styles.dayLabel}>{weekDays[index]}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Learning Consistency */}
        <Card>
          <View style={styles.consistencyHeader}>
            <Text variant="h4" color="heading">Learning Consistency</Text>
            <View style={styles.legendContainer}>
              <Text variant="caption" color="muted">Less</Text>
              <View style={styles.legendColors}>
                {[colors.primaryLight, blue[100], blue[200], colors.primary].map((color, i) => (
                  <View key={i} style={[styles.legendBox, { backgroundColor: color }]} />
                ))}
              </View>
              <Text variant="caption" color="muted">More</Text>
            </View>
          </View>

          <View style={styles.heatmapContainer}>
            {weekDays.map((day, dayIndex) => (
              <View key={day} style={styles.heatmapRow}>
                <Text variant="caption" color="muted" style={styles.heatmapDayLabel}>{day}</Text>
                {fourWeeksData.map((week, weekIndex) => {
                  const value = week[dayIndex];
                  let bgColor: string = colors.primaryLight;
                  if (value >= 15) bgColor = colors.primary;
                  else if (value >= 10) bgColor = blue[200];
                  else if (value >= 5) bgColor = blue[100];

                  return (
                    <View key={weekIndex} style={[styles.heatmapCell, { backgroundColor: bgColor }]} />
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[3], marginBottom: spacing[4] },
  statCard: { width: "47%", alignItems: "center", paddingVertical: spacing[4] },
  weeklyCard: { marginBottom: spacing[4] },
  weeklyHeader: { marginBottom: spacing[4] },
  chartContainer: { flexDirection: "row", justifyContent: "space-between", height: 150, paddingTop: spacing[2] },
  barContainer: { flex: 1, alignItems: "center" },
  barBackground: { flex: 1, width: 24, borderRadius: borderRadius.md, justifyContent: "flex-end", overflow: "hidden" },
  bar: { width: "100%", borderRadius: borderRadius.md },
  barValue: { marginTop: spacing[1], fontWeight: "600" },
  dayLabel: { marginTop: spacing[2] },
  consistencyHeader: { marginBottom: spacing[4] },
  legendContainer: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  legendColors: { flexDirection: "row", gap: spacing[1] },
  legendBox: { width: 16, height: 16, borderRadius: borderRadius.sm },
  heatmapContainer: { gap: spacing[2] },
  heatmapRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  heatmapDayLabel: { width: 32 },
  heatmapCell: { flex: 1, height: 32, borderRadius: borderRadius.md },
  bottomSpacer: { height: spacing[20] },
});
