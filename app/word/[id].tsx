/**
 * Word Detail Screen
 * Full word information with API data
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Container, Text, Card, Badge, Button } from '../../src/components';
import { colors, spacing, borderRadius } from '../../src/constants';
import { getWord } from '../../src/services';
import { useAppStore } from '../../src/store/appStore';
import { Word } from '../../src/types';
import { CURATED_WORDS } from '../../src/data';

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleBookmark, isWordBookmarked, learnedWords, markWordLearned } = useAppStore();
  
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus?.playing ?? false;
  
  // Get curated word info if available
  const curatedInfo = CURATED_WORDS.find(w => w.word.toLowerCase() === id?.toLowerCase());
  const isBookmarked = id ? isWordBookmarked(id) : false;
  const isLearned = id ? learnedWords.some(w => w.wordId.toLowerCase() === id.toLowerCase()) : false;

  useEffect(() => {
    loadWord();
  }, [id]);

  useEffect(() => {
    if (word?.audioUrl) {
      player.replace(word.audioUrl);
    }
  }, [player, word?.audioUrl]);

  const loadWord = async () => {
    if (!id) return;
    setIsLoading(true);
    const fetchedWord = await getWord(id);
    setWord(fetchedWord);
    setIsLoading(false);
  };

  const playAudio = async () => {
    if (!word?.audioUrl || isPlaying) return;
    
    try {
      if (playerStatus?.isLoaded) {
        await player.seekTo(0);
      } else {
        player.replace(word.audioUrl);
      }
      player.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleMarkLearned = () => {
    if (word) {
      markWordLearned(word.word);
    }
  };

  const handleBookmark = () => {
    if (word) {
      toggleBookmark(word);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.correct;
      case 'intermediate': return colors.streak;
      case 'advanced': return colors.accent;
      default: return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <Container backgroundColor={colors.primary} statusBarStyle="light-content">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text variant="body" color="white" style={{ marginTop: spacing[3] }}>
            Loading word...
          </Text>
        </View>
      </Container>
    );
  }

  if (!word) {
    return (
      <Container backgroundColor={colors.primary} statusBarStyle="light-content">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text variant="label" color="white">Word Details</Text>
          <View style={styles.bookmarkBtn} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.white} />
          <Text variant="h3" color="white" style={{ marginTop: spacing[3] }}>
            Word not found
          </Text>
          <Text variant="body" style={{ color: 'rgba(255,255,255,0.7)', marginTop: spacing[2] }}>
            Unable to load "{id}"
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="secondary"
            style={{ marginTop: spacing[6] }}
          />
        </View>
      </Container>
    );
  }

  return (
    <Container backgroundColor={colors.primary} statusBarStyle="light-content">
      <ScrollView 
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text variant="label" color="white">Word Details</Text>
          <TouchableOpacity style={styles.bookmarkBtn} onPress={handleBookmark}>
            <Ionicons 
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={colors.white} 
            />
          </TouchableOpacity>
        </View>

        {/* Word Hero */}
        <View style={styles.hero}>
          <Badge label={word.partOfSpeech} variant="streak" />
          <Text variant="h1" color="white" style={styles.wordTitle}>
            {word.word}
          </Text>
          <View style={styles.pronunciationRow}>
            <Text variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {word.pronunciation || `/${word.word}/`}
            </Text>
            {word.audioUrl && (
              <TouchableOpacity style={styles.speakerBtn} onPress={playAudio} disabled={isPlaying}>
                <Ionicons 
                  name={isPlaying ? 'volume-high' : 'volume-medium'} 
                  size={20} 
                  color={isPlaying ? colors.streak : colors.white} 
                />
              </TouchableOpacity>
            )}
          </View>
          {isLearned && (
            <View style={styles.learnedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.correct} />
              <Text variant="caption" style={{ color: colors.correct }}>Learned</Text>
            </View>
          )}
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Definition */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Ionicons name="bulb" size={16} color={colors.streak} />
              <Text variant="label" color="primary" style={styles.sectionLabel}>
                Definition
              </Text>
            </View>
            <Text variant="bodyLarge" color="heading">
              {word.definition}
            </Text>
          </View>

          {/* Example */}
          {word.example && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="document-text" size={16} color={colors.primary} />
                <Text variant="label" color="primary" style={styles.sectionLabel}>
                  Example
                </Text>
              </View>
              <Card variant="filled" padding="md">
                <Text variant="body" color="body" style={styles.exampleText}>
                  "{word.example}"
                </Text>
              </Card>
            </View>
          )}

          {/* Synonyms */}
          {word.synonyms && word.synonyms.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="swap-horizontal" size={16} color={colors.correct} />
                <Text variant="label" color="primary" style={styles.sectionLabel}>
                  Synonyms
                </Text>
              </View>
              <View style={styles.tagContainer}>
                {word.synonyms.slice(0, 6).map((synonym: string) => (
                  <TouchableOpacity key={synonym} onPress={() => router.push(`/word/${synonym}`)}>
                    <Badge label={synonym} variant="correct" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Antonyms */}
          {word.antonyms && word.antonyms.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="code" size={16} color={colors.accent} />
                <Text variant="label" color="primary" style={styles.sectionLabel}>
                  Antonyms
                </Text>
              </View>
              <View style={styles.tagContainer}>
                {word.antonyms.slice(0, 6).map((antonym: string) => (
                  <TouchableOpacity key={antonym} onPress={() => router.push(`/word/${antonym}`)}>
                    <Badge label={antonym} variant="accent" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Category & Difficulty (if from curated list) */}
          {curatedInfo && (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text variant="caption" color="muted">Difficulty</Text>
                <Badge 
                  label={curatedInfo.difficulty} 
                  variant={curatedInfo.difficulty === 'easy' ? 'correct' : curatedInfo.difficulty === 'hard' ? 'accent' : 'primary'} 
                />
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="muted">Category</Text>
                <Badge label={curatedInfo.category} variant="muted" />
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={isLearned ? "Already Learned ✓" : "Mark as Learned"}
              onPress={handleMarkLearned}
              variant={isLearned ? "secondary" : "primary"}
              fullWidth
              style={styles.learnBtn}
              disabled={isLearned}
            />
            <Button
              title="Start Quiz"
              onPress={() => router.push('/quiz')}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  wordTitle: {
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  speakerBtn: {
    padding: spacing[1],
  },
  learnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginTop: spacing[3],
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    padding: spacing[6],
    paddingBottom: spacing[12],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  sectionLabel: {},
  exampleText: {
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  metaItem: {
    gap: spacing[2],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  learnBtn: {
    marginBottom: spacing[2],
  },
});
