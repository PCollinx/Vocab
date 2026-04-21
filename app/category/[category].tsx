import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../src/constants';
import { Container, Text, Card } from '../../src/components';
import { CURATED_WORDS, CATEGORY_INFO } from '../../src/data';
import { getWords } from '../../src/services';
import { Word } from '../../src/types';
import { useAppStore } from '../../src/store/appStore';

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { toggleBookmark, isWordBookmarked } = useAppStore();
  
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
  const categoryWords = CURATED_WORDS.filter(w => w.category === category);
  
  useEffect(() => {
    loadWords();
  }, [category, selectedDifficulty]);
  
  const loadWords = async () => {
    setIsLoading(true);
    
    let filteredWords = categoryWords;
    if (selectedDifficulty) {
      filteredWords = filteredWords.filter(w => w.difficulty === selectedDifficulty);
    }
    
    // Get first 10 words with full definitions - pass objects with word property
    const wordObjects = filteredWords.slice(0, 10).map(w => ({ 
      word: w.word, 
      category: w.category, 
      difficulty: w.difficulty 
    }));
    const fetchedWords = await getWords(wordObjects);
    setWords(fetchedWords);
    setIsLoading(false);
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
              <Text variant="body" color="muted">
                {categoryWords.length} words
              </Text>
            </View>
          </View>
        </View>
        
        {/* Difficulty Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedDifficulty && styles.filterChipActive]}
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
                selectedDifficulty === diff && styles.filterChipActive
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
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(curatedWord.difficulty) + '20' }
                          ]}>
                            <Text 
                              variant="caption" 
                              style={{ color: getDifficultyColor(curatedWord.difficulty) }}
                            >
                              {curatedWord.difficulty}
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity 
                          onPress={() => toggleBookmark(word)}
                          style={styles.bookmarkBtn}
                        >
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
                      <View style={styles.exampleContainer}>
                        <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
                        <Text variant="caption" color="muted" numberOfLines={1} style={{ flex: 1 }}>
                          "{word.example}"
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.cardFooter}>
                      <Text variant="caption" color="muted">
                        {word.partOfSpeech}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
          
          {!isLoading && words.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <Text variant="caption" color="muted">
                Showing {words.length} of {selectedDifficulty 
                  ? categoryWords.filter(w => w.difficulty === selectedDifficulty).length 
                  : categoryWords.length} words
              </Text>
            </View>
          )}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  backBtn: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  categoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    textTransform: 'capitalize',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
  },
  wordCard: {
    marginBottom: spacing[3],
  },
  firstCard: {
    marginTop: spacing[2],
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  wordInfo: {
    flex: 1,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  difficultyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  bookmarkBtn: {
    padding: spacing[1],
  },
  definition: {
    marginBottom: spacing[2],
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
    paddingLeft: spacing[2],
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  bottomSpacer: {
    height: spacing[10],
  },
});
