/**
 * Bookmarks Screen
 * Shows user's saved words with quick filtering
 */

import { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Container, Text, Card, Badge } from "../../src/components";
import { colors, spacing, borderRadius } from "../../src/constants";
import { useAppStore } from "../../src/store/appStore";

export default function BookmarksScreen() {
  const router = useRouter();
  const { bookmarkedWords, learnedWords } = useAppStore();
  const [query, setQuery] = useState("");

  const filteredBookmarks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return bookmarkedWords;

    return bookmarkedWords.filter((word) => {
      return (
        word.word.toLowerCase().includes(normalized) ||
        word.definition.toLowerCase().includes(normalized) ||
        word.partOfSpeech.toLowerCase().includes(normalized) ||
        word.category.toLowerCase().includes(normalized)
      );
    });
  }, [bookmarkedWords, query]);

  const learnedSet = useMemo(
    () => new Set(learnedWords.map((item) => item.wordId.toLowerCase())),
    [learnedWords],
  );

  const openWord = (id: string) => {
    router.push(`/word/${id}`);
  };

  return (
    <Container>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerEyebrowRow}>
                <View style={styles.headerIconWrap}>
                  <Ionicons name="bookmark" size={14} color={colors.primary} />
                </View>
                <Text variant="caption" style={styles.headerEyebrowText}>
                  WORD LIBRARY
                </Text>
              </View>
              <Text variant="h2" color="heading" style={styles.headerTitle}>
                Bookmarks
              </Text>
              <Text variant="body" color="muted">
                Your saved words in one place
              </Text>
            </View>
            <View style={styles.headerCountPill}>
              <Text variant="h4" style={styles.headerCountText}>
                {bookmarkedWords.length}
              </Text>
              <Text variant="caption" color="muted">
                saved
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricPill}>
            <Ionicons name="bookmark" size={14} color={colors.primary} />
            <Text variant="caption" color="heading">
              {bookmarkedWords.length} saved
            </Text>
          </View>
          <View style={styles.metricPill}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.correct}
            />
            <Text variant="caption" color="heading">
              {learnedWords.length} learned
            </Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter saved words..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {filteredBookmarks.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text variant="h4" color="heading">
                {bookmarkedWords.length === 0
                  ? "No bookmarks yet"
                  : "No matches found"}
              </Text>
              <Text
                variant="bodySmall"
                color="muted"
                style={styles.emptySubtext}
              >
                {bookmarkedWords.length === 0
                  ? "Save words from Home and Word Details to find them here."
                  : "Try searching by word, definition, or category."}
              </Text>
              {bookmarkedWords.length === 0 && (
                <TouchableOpacity
                  style={styles.ctaBtn}
                  onPress={() => router.push("/")}
                >
                  <Ionicons
                    name="home-outline"
                    size={16}
                    color={colors.white}
                  />
                  <Text variant="label" color="white">
                    Go to Home
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ) : (
          <View style={styles.list}>
            {filteredBookmarks.map((word) => {
              const isLearned = learnedSet.has(word.id.toLowerCase());

              return (
                <TouchableOpacity
                  key={word.id}
                  style={styles.wordCard}
                  activeOpacity={0.85}
                  onPress={() => openWord(word.id)}
                >
                  <View style={styles.wordTopRow}>
                    <Text variant="h4" color="heading" style={styles.wordTitle}>
                      {word.word}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                    />
                  </View>

                  <Text variant="bodySmall" color="muted" numberOfLines={2}>
                    {word.definition}
                  </Text>

                  <View style={styles.wordMetaRow}>
                    <Badge label={word.partOfSpeech} variant="primary" />
                    <View style={styles.metaRight}>
                      <View style={styles.categoryPill}>
                        <Text variant="caption" color="muted">
                          {word.category}
                        </Text>
                      </View>
                      {isLearned && (
                        <View style={styles.learnedPill}>
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={colors.correct}
                          />
                          <Text variant="caption" style={styles.learnedText}>
                            Learned
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
    paddingBottom: 50,
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
    minWidth: 62,
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
  metricsRow: {
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textBody,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  emptySubtext: {
    textAlign: "center",
    maxWidth: 260,
  },
  ctaBtn: {
    marginTop: spacing[2],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  list: {
    gap: spacing[3],
  },
  wordCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
  },
  wordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordTitle: {
    flex: 1,
    marginRight: spacing[2],
  },
  wordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  metaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  categoryPill: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  learnedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.correctLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  learnedText: {
    color: colors.correct,
  },
  bottomSpacer: {
    height: spacing[20],
  },
});
