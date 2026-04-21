/**
 * Home Screen
 * Word of the day and quick actions
 */

import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Card, Badge, Button } from '../../src/components';
import { colors, spacing, borderRadius } from '../../src/constants';
import { useAppStore } from '../../src/store/appStore';

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
    markTodayWordComplete,
    todayWordCompleted,
  } = useAppStore();

  useEffect(() => {
    fetchTodayWord();
  }, []);

  const word = todayWord;
  const isBookmarked = word ? isWordBookmarked(word.id) : false;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
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
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text variant="h4" color="white">
                  {userName?.charAt(0) || '👋'}
                </Text>
              </View>
              <Text variant="bodySmall" color="muted">
                Hi, {userName || 'Learner'}
              </Text>
            </View>
            <TouchableOpacity style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color={colors.streak} />
              <Text variant="label" color="heading">
                {currentStreak}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text variant="h2" color="white">
            Today's{' '}
            <Text variant="h2" style={{ color: colors.streak }}>
              Word!
            </Text>
          </Text>
          <Text variant="bodySmall" color="white" style={styles.heroSubtitle}>
            One word a day keeps your vocabulary strong!
          </Text>
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {today}
          </Text>
        </View>

        {/* Word Card */}
        {isLoadingTodayWord ? (
          <Card style={styles.wordCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="body" color="muted" style={{ marginTop: spacing[3] }}>
                Loading today's word...
              </Text>
            </View>
          </Card>
        ) : word ? (
          <Card style={styles.wordCard}>
            <View style={styles.wordHeader}>
              <Badge label={word.partOfSpeech} variant="primary" />
              <TouchableOpacity 
                style={styles.bookmarkBtn}
                onPress={() => toggleBookmark(word)}
              >
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={22} 
                  color={isBookmarked ? colors.accent : colors.textMuted} 
                />
              </TouchableOpacity>
            </View>

            <Text variant="h2" color="heading" style={styles.wordTitle}>
              {word.word}
            </Text>

            <View style={styles.pronunciationRow}>
              <Text variant="bodySmall" color="muted">
                Pronunciation:
              </Text>
              <View style={styles.phonetic}>
                <Text variant="body" color="body">
                  {word.pronunciation || 'N/A'}
                </Text>
                <TouchableOpacity style={styles.speakerBtn}>
                  <Ionicons name="volume-high" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.meaningSection}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="bulb" size={16} color={colors.streak} />
                <Text variant="label" color="heading" style={styles.sectionLabel}>
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
                  <Ionicons name="document-text" size={16} color={colors.primary} />
                  <Text variant="label" color="heading" style={styles.sectionLabel}>
                    Example
                  </Text>
                </View>
                <Text variant="bodySmall" color="accent" style={styles.example}>
                  "{word.example}"
                </Text>
              </View>
            )}

            <View style={styles.cardActions}>
              <Button
                title={todayWordCompleted ? "Learned ✓" : "Mark as Learned"}
                onPress={() => !todayWordCompleted && markTodayWordComplete()}
                variant={todayWordCompleted ? "outline" : "primary"}
                style={styles.detailsBtn}
              />
              <TouchableOpacity 
                style={styles.saveBtn}
                onPress={() => router.push(`/word/${word.id}`)}
              >
                <Ionicons name="arrow-forward" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={styles.wordCard}>
            <View style={styles.loadingContainer}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
              <Text variant="body" color="muted" style={{ marginTop: spacing[3] }}>
                Unable to load word. Pull to refresh.
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Quiz Card */}
        <TouchableOpacity style={styles.quizCard} onPress={() => router.push('/quiz')}>
          <View style={styles.quizContent}>
            <View style={styles.quizIcon}>
              <Ionicons name="bulb" size={24} color={colors.streak} />
            </View>
            <View style={styles.quizText}>
              <Text variant="h4" color="heading">
                Try a Quick Quiz
              </Text>
              <Text variant="bodySmall" color="muted">
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
    paddingBottom: 100,
  },
  header: {
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.streakLight,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    marginBottom: spacing[4],
  },
  heroSubtitle: {
    marginTop: spacing[2],
    opacity: 0.9,
  },
  wordCard: {
    marginBottom: spacing[4],
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkBtn: {
    padding: spacing[2],
  },
  wordTitle: {
    marginTop: spacing[3],
  },
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    gap: spacing[2],
  },
  phonetic: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },
  speakerBtn: {
    padding: spacing[1],
  },
  meaningSection: {
    marginTop: spacing[4],
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  sectionLabel: {},
  definition: {
    fontStyle: 'italic',
  },
  example: {
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[5],
    gap: spacing[3],
  },
  detailsBtn: {
    flex: 1,
  },
  saveBtn: {
    width: 56,
    height: 56,
    backgroundColor: colors.correctLight,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.correct,
  },
  quizContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  quizIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.correctLight,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizText: {
    gap: spacing[1],
  },
  loadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: spacing[20],
  },
});
