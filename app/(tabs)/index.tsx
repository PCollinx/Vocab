import { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Container, Text, Card, Badge } from "../../src/components";
import { colors, spacing, borderRadius } from "../../src/constants";
import { useAppStore } from "../../src/store/appStore";

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentStreak,
    todayWord,
    userName,
    isLoadingTodayWord,
    fetchTodayWord,
    toggleBookmark,
    isWordBookmarked,
    todayWordCompleted,
  } = useAppStore();

  useEffect(() => {
    fetchTodayWord();
  }, []);

  const word = todayWord;
  const isBookmarked = word ? isWordBookmarked(word.id) : false;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Container padded={false}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View style={styles.heroPatternA} />
          <View style={styles.heroPatternB} />

          <View style={styles.headerTop}>
            <View style={styles.userPill}>
              <View style={styles.avatar}>
                <Text variant="caption" color="white">
                  {userName?.charAt(0) || "👋"}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.userPillText}>
                {userName || "Collins"}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color={colors.streak} />
                <Text variant="caption" style={styles.streakText}>
                  {currentStreak}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.notificationBtn}>
                <Ionicons
                  name="notifications-outline"
                  size={17}
                  color={colors.white}
                />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroTextWrap}>
            <Text variant="h1" color="white" style={styles.heroTitle}>
              Today's <Text style={styles.heroTitleAccent}>Word!</Text>
            </Text>
            <Text variant="bodySmall" style={styles.heroSubtitle}>
              One word a day keeps your vocabulary strong!
            </Text>
            <Text variant="caption" style={styles.heroDate}>
              {today}
            </Text>
          </View>
        </View>

        {/* Word Card */}
        {isLoadingTodayWord ? (
          <Card style={styles.wordCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                variant="body"
                color="muted"
                style={{ marginTop: spacing[3] }}
              >
                Loading today's word...
              </Text>
            </View>
          </Card>
        ) : word ? (
          <Card style={styles.wordCard}>
            <Text variant="h2" color="heading" style={styles.wordTitle}>
              {word.word}
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" color="muted">
                Part of Speech:
              </Text>
              <Badge label={word.partOfSpeech} variant="primary" />
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" color="muted">
                Pronunciation:
              </Text>
              <View style={styles.phonetic}>
                <Text variant="body" color="body">
                  {word.pronunciation || "N/A"}
                </Text>
                <TouchableOpacity style={styles.speakerBtn}>
                  <Ionicons
                    name="volume-high"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.meaningSection}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="bulb" size={16} color={colors.streak} />
                <Text
                  variant="label"
                  color="heading"
                  style={styles.sectionLabel}
                >
                  English Meaning
                </Text>
              </View>
              <Text variant="body" color="body" style={styles.definition}>
                "{word.definition}"
              </Text>
            </View>

            {word.example && (
              <View style={styles.meaningSection}>
                <View style={styles.sectionLabelRow}>
                  <Ionicons
                    name="document-text"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    variant="label"
                    color="heading"
                    style={styles.sectionLabel}
                  >
                    Example
                  </Text>
                </View>
                <Text variant="bodySmall" color="accent" style={styles.example}>
                  "{word.example}"
                </Text>
              </View>
            )}

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => router.push(`/word/${word.id}`)}
              >
                <Ionicons
                  name="school-outline"
                  size={17}
                  color={colors.white}
                />
                <Text variant="button" style={styles.detailsBtnText}>
                  {todayWordCompleted ? "Learned" : "See Details"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => toggleBookmark(word)}
              >
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={styles.wordCard}>
            <View style={styles.loadingContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text
                variant="body"
                color="muted"
                style={{ marginTop: spacing[3] }}
              >
                Unable to load word. Pull to refresh.
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Quiz Card */}
        <TouchableOpacity
          style={styles.quizCard}
          onPress={() => router.push("/quiz")}
        >
          <View style={styles.quizContent}>
            <View style={styles.quizIcon}>
              <Ionicons name="bulb" size={24} color={colors.streak} />
            </View>
            <View style={styles.quizText}>
              <Text variant="h4" color="heading" style={styles.quizTitle}>
                Try a Quick Quiz
              </Text>
              <Text
                variant="bodySmall"
                color="muted"
                style={styles.quizSubtext}
              >
                Test your brain in seconds — let's go
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
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
    paddingBottom: 120,
  },
  hero: {
    position: "relative",
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
    overflow: "hidden",
  },
  heroPatternA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    top: -90,
    right: -40,
  },
  heroPatternB: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 180,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    top: -55,
    right: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: borderRadius.full,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  userPillText: {
    color: colors.white,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  streakText: {
    color: colors.white,
    fontWeight: "700",
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.white,
  },
  heroTextWrap: {
    marginTop: spacing[7],
    marginBottom: spacing[5],
    alignItems: "center",
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 32,
    textAlign: "center",
    fontWeight: "800",
    letterSpacing: 0.3,
    lineHeight: 54,
  },
  heroTitleAccent: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.streak,
  },
  heroSubtitle: {
    marginTop: spacing[1],
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  heroDate: {
    marginTop: spacing[1],
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  wordCard: {
    marginHorizontal: spacing[4],
    marginTop: -34,
    marginBottom: spacing[4],
    borderRadius: 28,
    paddingTop: spacing[5],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  wordTitle: {
    textAlign: "center",
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  phonetic: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  speakerBtn: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  meaningSection: {
    marginTop: spacing[3],
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  sectionLabel: {},
  definition: {
    fontStyle: "italic",
    textAlign: "center",
    color: colors.textMuted,
  },
  example: {
    fontStyle: "italic",
    textAlign: "center",
    color: colors.textMuted,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[6],
    gap: spacing[3],
  },
  detailsBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  detailsBtnText: {
    color: colors.white,
  },
  saveBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing[4],
    backgroundColor: colors.correctLight,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
  },
  quizContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  quizIcon: {
    width: 34,
    height: 34,
    backgroundColor: colors.correctLight,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  quizText: {
    gap: 2,
  },
  quizTitle: {
    fontSize: 24,
  },
  quizSubtext: {
    color: colors.textMuted,
  },
  loadingContainer: {
    padding: spacing[7],
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacer: {
    height: spacing[20],
  },
});
