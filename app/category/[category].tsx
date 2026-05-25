import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '../../src/constants';
import { useTheme } from '../../src/context/ThemeContext';
import { Container, Text, Card } from '../../src/components';
import { CURATED_WORDS, CATEGORY_INFO } from '../../src/data';
import { getWords } from '../../src/services';
import { Word } from '../../src/types';
import { useAppStore } from '../../src/store/appStore';

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { toggleBookmark, isWordBookmarked } = useAppStore();

  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const PAGE_SIZE = 10;
  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
  const categoryWords = CURATED_WORDS.filter(w => w.category === category);

  useEffect(() => {
    loadWords(true);
  }, [category, selectedDifficulty]);

  const getFiltered = () => {
    if (!selectedDifficulty) return categoryWords;
    return categoryWords.filter(w => w.difficulty === selectedDifficulty);
  };

  const loadWords = async (reset: boolean) => {
    const filtered = getFiltered();
    const currentOffset = reset ? 0 : offset;

    if (reset) {
      setIsLoading(true);
      setHasError(false);
      setWords([]);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const batch = filtered.slice(currentOffset, currentOffset + PAGE_SIZE).map(w => ({
        word: w.word, category: w.category, difficulty: w.difficulty,
      }));
      const fetched = await getWords(batch);
      const nextOffset = currentOffset + PAGE_SIZE;

      if (reset) {
        setWords(fetched);
        setIsLoading(false);
      } else {
        setWords(prev => [...prev, ...fetched]);
        setIsLoadingMore(false);
      }

      setOffset(nextOffset);
      setHasMore(nextOffset < filtered.length);
    } catch {
      if (reset) { setIsLoading(false); setHasError(true); }
      else { setIsLoadingMore(false); }
    }
  };

  const difficulties = ['easy', 'medium', 'hard'] as const;
  const difficultyCounts = difficulties.reduce((acc, diff) => {
    acc[diff] = categoryWords.filter(w => w.difficulty === diff).length;
    return acc;
  }, {} as Record<string, number>);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.correct;
      case 'medium': return colors.streak;
      case 'hard': return colors.wrong;
      default: return colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textHeading} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.categoryIconBg, { backgroundColor: categoryInfo?.color || colors.primary }]}>
              <Ionicons name={(categoryInfo?.icon || 'book') as any} size={24} color={colors.white} />
            </View>
            <View>
              <Text variant="h2" style={styles.categoryTitle}>
                {categoryInfo?.name || category}
              </Text>
              <Text variant="body" color="muted">{categoryWords.length} words</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: !selectedDifficulty ? colors.primary : colors.surface, borderColor: !selectedDifficulty ? colors.primary : colors.border },
            ]}
            onPress={() => setSelectedDifficulty(null)}
          >
            <Text variant="caption" color={!selectedDifficulty ? 'white' : 'body'}>
              All ({categoryWords.length})
            </Text>
          </TouchableOpacity>
          {difficulties.map(diff => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.filterChip,
                { backgroundColor: selectedDifficulty === diff ? colors.primary : colors.surface, borderColor: selectedDifficulty === diff ? colors.primary : colors.border },
              ]}
              onPress={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
            >
              <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(diff) }]} />
              <Text variant="caption" color={selectedDifficulty === diff ? 'white' : 'body'}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)} ({difficultyCounts[diff]})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Words List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="body" color="muted" style={{ marginTop: spacing[3] }}>
                Loading words...
              </Text>
            </View>
          ) : hasError ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
              <Text variant="h4" color="heading" style={{ marginTop: spacing[3] }}>
                Could not load words
              </Text>
              <Text variant="body" color="muted" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                Check your connection and try again.
              </Text>
              <TouchableOpacity
                onPress={() => loadWords(true)}
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Text variant="button" color="white">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : words.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text variant="body" color="muted" style={{ marginTop: spacing[3] }}>
                No words found for this filter
              </Text>
            </View>
          ) : (
            words.map((word, index) => {
              const curatedWord = categoryWords.find(w => w.word === word.word);
              const isBookmarked = isWordBookmarked(word.word);

              return (
                <TouchableOpacity
                  key={word.word}
                  onPress={() => router.push(`/word/${word.word}`)}
                  activeOpacity={0.7}
                >
                  <Card style={[styles.wordCard, index === 0 && styles.firstCard]}>
                    <View style={styles.wordHeader}>
                      <View style={styles.wordInfo}>
                        <Text variant="h3">{word.word}</Text>
                        {word.pronunciation && (
                          <Text variant="caption" color="muted">{word.pronunciation}</Text>
                        )}
                      </View>
                      <View style={styles.wordActions}>
                        {curatedWord && (
                          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(curatedWord.difficulty) + '20' }]}>
                            <Text variant="caption" style={{ color: getDifficultyColor(curatedWord.difficulty) }}>
                              {curatedWord.difficulty}
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity onPress={() => toggleBookmark(word)} style={styles.bookmarkBtn}>
                          <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={isBookmarked ? colors.primary : colors.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text variant="body" color="muted" numberOfLines={2} style={styles.definition}>
                      {word.definition}
                    </Text>

                    {word.example && (
                      <View style={[styles.exampleContainer, { borderLeftColor: colors.border }]}>
                        <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
                        <Text variant="caption" color="muted" numberOfLines={1} style={{ flex: 1 }}>
                          "{word.example}"
                        </Text>
                      </View>
                    )}

                    <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                      <Text variant="caption" color="muted">{word.partOfSpeech}</Text>
                      <View style={styles.wordActions}>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}

          {!isLoading && words.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <Text variant="caption" color="muted" style={{ marginBottom: hasMore ? spacing[3] : 0 }}>
                Showing {words.length} of {getFiltered().length} words
              </Text>
              {hasMore && (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  onPress={() => loadWords(false)}
                  disabled={isLoadingMore}
                  activeOpacity={0.7}
                >
                  {isLoadingMore ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text variant="body" color="primary">Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4], gap: spacing[3] },
  backBtn: { padding: spacing[2], marginLeft: -spacing[2] },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
  categoryIconBg: { width: 48, height: 48, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  categoryTitle: { textTransform: 'capitalize' },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: borderRadius.full, borderWidth: 1 },
  difficultyDot: { width: 8, height: 8, borderRadius: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[10] },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[10] },
  wordCard: { marginBottom: spacing[3] },
  firstCard: { marginTop: spacing[2] },
  wordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] },
  wordInfo: { flex: 1 },
  wordActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  difficultyBadge: { paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.sm },
  bookmarkBtn: { padding: spacing[1] },
  definition: { marginBottom: spacing[2] },
  exampleContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3], paddingLeft: spacing[2], borderLeftWidth: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing[2], borderTopWidth: 1 },
  loadMoreContainer: { alignItems: 'center', paddingVertical: spacing[4] },
  loadMoreBtn: { marginTop: spacing[2], paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: borderRadius.full, borderWidth: 1, alignItems: 'center', minWidth: 140 },
  retryBtn: { marginTop: spacing[5], paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: borderRadius.full },
  bottomSpacer: { height: spacing[10] },
});
