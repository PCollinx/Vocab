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
import { Container, Text, Card, Badge, ScreenHeader } from "../../src/components";
import { spacing, borderRadius } from "../../src/constants";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppStore } from "../../src/store/appStore";

export default function BookmarksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { bookmarkedWords, learnedWords } = useAppStore();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const resetVisible = () => setVisibleCount(20);

  const filteredBookmarks = useMemo(() => {
    resetVisible();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return bookmarkedWords;
    return bookmarkedWords.filter((word) =>
      word.word.toLowerCase().includes(normalized) ||
      word.definition.toLowerCase().includes(normalized) ||
      word.partOfSpeech.toLowerCase().includes(normalized) ||
      word.category.toLowerCase().includes(normalized)
    );
  }, [bookmarkedWords, query]);

  const visibleBookmarks = filteredBookmarks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBookmarks.length;

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
        <ScreenHeader
          iconName="bookmark"
          eyebrow="WORD LIBRARY"
          title="Bookmarks"
          subtitle="Your saved words in one place"
          count={bookmarkedWords.length}
          countLabel="saved"
        />

        <View style={styles.metricsRow}>
          <View style={[styles.metricPill, { backgroundColor: colors.surface }]}>
            <Ionicons name="bookmark" size={14} color={colors.primary} />
            <Text variant="caption" color="heading">{bookmarkedWords.length} saved</Text>
          </View>
          <View style={[styles.metricPill, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.correct} />
            <Text variant="caption" color="heading">{learnedWords.length} learned</Text>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textBody }]}
            placeholder="Filter saved words..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {filteredBookmarks.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={40} color={colors.textMuted} />
              <Text variant="h4" color="heading">
                {bookmarkedWords.length === 0 ? "No bookmarks yet" : "No matches found"}
              </Text>
              <Text variant="bodySmall" color="muted" style={styles.emptySubtext}>
                {bookmarkedWords.length === 0
                  ? "Save words from Home and Word Details to find them here."
                  : "Try searching by word, definition, or category."}
              </Text>
              {bookmarkedWords.length === 0 && (
                <TouchableOpacity
                  style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/")}
                >
                  <Ionicons name="home-outline" size={16} color={colors.white} />
                  <Text variant="label" color="white">Go to Home</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ) : (
          <View style={styles.list}>
            {visibleBookmarks.map((word) => {
              const isLearned = learnedSet.has(word.id.toLowerCase());
              return (
                <TouchableOpacity
                  key={word.id}
                  style={[styles.wordCard, { backgroundColor: colors.surface }]}
                  activeOpacity={0.85}
                  onPress={() => openWord(word.id)}
                >
                  <View style={styles.wordTopRow}>
                    <Text variant="h4" color="heading" style={styles.wordTitle}>
                      {word.word}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>

                  <Text variant="bodySmall" color="muted" numberOfLines={2}>
                    {word.definition}
                  </Text>

                  <View style={styles.wordMetaRow}>
                    <Badge label={word.partOfSpeech} variant="primary" />
                    <View style={styles.metaRight}>
                      <View style={[styles.categoryPill, { backgroundColor: colors.background }]}>
                        <Text variant="caption" color="muted">{word.category}</Text>
                      </View>
                      {isLearned && (
                        <View style={[styles.learnedPill, { backgroundColor: colors.correctLight }]}>
                          <Ionicons name="checkmark" size={12} color={colors.correct} />
                          <Text variant="caption" style={{ color: colors.correct }}>Learned</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            {hasMore && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => setVisibleCount(c => c + 20)}
                activeOpacity={0.7}
              >
                <Text variant="body" color="primary">
                  Load More ({filteredBookmarks.length - visibleCount} remaining)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  metricsRow: { flexDirection: "row", gap: spacing[2], marginBottom: spacing[4] },
  metricPill: {
    flexDirection: "row", alignItems: "center", gap: spacing[1],
    borderRadius: borderRadius.full, paddingVertical: spacing[2], paddingHorizontal: spacing[3],
  },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderRadius: borderRadius.xl, gap: spacing[3], marginBottom: spacing[4],
  },
  searchInput: { flex: 1, fontSize: 16 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: spacing[8], gap: spacing[3] },
  emptySubtext: { textAlign: "center", maxWidth: 260 },
  ctaBtn: {
    marginTop: spacing[2], flexDirection: "row", alignItems: "center",
    gap: spacing[2], borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
  },
  list: { gap: spacing[3] },
  loadMoreBtn: { borderWidth: 1, borderRadius: borderRadius.full, paddingVertical: spacing[3], alignItems: 'center', marginTop: spacing[2] },
  wordCard: { borderRadius: borderRadius.xl, padding: spacing[4], gap: spacing[3] },
  wordTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordTitle: { flex: 1, marginRight: spacing[2] },
  wordMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[2] },
  metaRight: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  categoryPill: { borderRadius: borderRadius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  learnedPill: {
    flexDirection: "row", alignItems: "center", gap: 2,
    borderRadius: borderRadius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[1],
  },
  bottomSpacer: { height: spacing[20] },
});
