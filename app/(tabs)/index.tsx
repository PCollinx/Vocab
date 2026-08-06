import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Dimensions,
  NativeModules,
  Animated,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Container, Text, Card, Badge } from "../../src/components";
import { spacing, borderRadius } from "../../src/constants";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppStore } from "../../src/store/appStore";
import { Word } from "../../src/types";

// True only when the ExpoSpeech native module is present in the current build.
// Avoids importing expo-speech at module level so Metro doesn't bundle it
// eagerly and crash dev clients built before expo-speech was added.
const hasSpeech = !!NativeModules.ExpoSpeech;

const SCREEN_WIDTH = Dimensions.get("window").width;

// ─── Per-card animated item ───────────────────────────────────────────────────

const DOT_GAP = 36; // desired consistent gap between card bottom and dots

interface CarouselItemProps {
  item: Word;
  index: number;
  scrollX: Animated.Value;
  isBookmarked: boolean;
  isLearned: boolean;
  onMarkLearned: () => void;
  onBookmark: () => void;
  onHeightChange?: (height: number) => void;
}

const CarouselCard = React.memo(
  ({
    item,
    index,
    scrollX,
    isBookmarked,
    isLearned,
    onMarkLearned,
    onBookmark,
    onHeightChange,
  }: CarouselItemProps) => {
    const { colors } = useTheme();
    const player = useAudioPlayer(item.audioUrl ?? null);
    const playerStatus = useAudioPlayerStatus(player);
    const isPlaying = playerStatus?.playing ?? false;

    const playPronunciation = async () => {
      if (isPlaying) return;
      if (item.audioUrl) {
        try {
          player.seekTo(0);
          player.play();
        } catch {}
      } else if (hasSpeech) {
        try {
          const S = require("expo-speech");
          const speaking = await S.isSpeakingAsync();
          if (!speaking) S.speak(item.word, { language: 'en' });
        } catch {}
      }
    };

    const animations = useRef(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];
      return {
        scale: scrollX.interpolate({
          inputRange,
          outputRange: [0.91, 1, 0.91],
          extrapolate: "clamp",
        }),
        rotateZ: scrollX.interpolate({
          inputRange,
          outputRange: ["4deg", "0deg", "-4deg"],
          extrapolate: "clamp",
        }),
        opacity: scrollX.interpolate({
          inputRange,
          outputRange: [0.6, 1, 0.6],
          extrapolate: "clamp",
        }),
      };
    }).current();

    return (
      <View style={styles.carouselItem}>
        <Animated.View
          style={{
            transform: [
              { scale: animations.scale },
              { rotateZ: animations.rotateZ },
            ],
            opacity: animations.opacity,
          }}
          onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
        >
          <Card style={styles.wordCard}>
            {isLearned && (
              <View
                style={[
                  styles.learnedBanner,
                  { backgroundColor: colors.correctLight },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.correct}
                />
                <Text
                  variant="caption"
                  style={{ color: colors.correct, fontWeight: "700" }}
                >
                  Learned
                </Text>
              </View>
            )}

            <Text variant="h2" color="heading" style={styles.wordTitle}>
              {item.word}
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" color="muted">
                Part of Speech:
              </Text>
              <Badge label={item.partOfSpeech} variant="primary" />
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" color="muted">
                Pronunciation:
              </Text>
              <View style={styles.phoneticRow}>
                <View style={[styles.phonetic, { backgroundColor: colors.primaryLight }]}>
                  <Text variant="body" color="body">
                    {item.pronunciation || "N/A"}
                  </Text>
                </View>
                {(item.audioUrl || hasSpeech) && (
                  <TouchableOpacity
                    onPress={playPronunciation}
                    style={[styles.speakerBtn, { backgroundColor: colors.primaryLight }]}
                    disabled={isPlaying}
                  >
                    <Ionicons
                      name={isPlaying ? "volume-high" : "volume-medium-outline"}
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
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
              <Text
                variant="body"
                color="muted"
                style={styles.definition}
              >
                "{item.definition}"
              </Text>
            </View>

            {item.example && (
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
                <Text
                  variant="bodySmall"
                  color="muted"
                  style={styles.example}
                >
                  "{item.example}"
                </Text>
              </View>
            )}

            {item.synonyms && item.synonyms.length > 0 && (
              <View style={styles.meaningSection}>
                <View style={styles.sectionLabelRow}>
                  <Ionicons name="swap-horizontal" size={16} color={colors.correct} />
                  <Text variant="label" color="heading" style={styles.sectionLabel}>
                    Synonyms
                  </Text>
                </View>
                <View style={styles.tagContainer}>
                  {item.synonyms.slice(0, 6).map((synonym) => (
                    <Badge key={synonym} label={synonym} variant="correct" />
                  ))}
                </View>
              </View>
            )}

            {item.antonyms && item.antonyms.length > 0 && (
              <View style={styles.meaningSection}>
                <View style={styles.sectionLabelRow}>
                  <Ionicons name="code" size={16} color={colors.accent} />
                  <Text variant="label" color="heading" style={styles.sectionLabel}>
                    Antonyms
                  </Text>
                </View>
                <View style={styles.tagContainer}>
                  {item.antonyms.slice(0, 6).map((antonym) => (
                    <Badge key={antonym} label={antonym} variant="accent" />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text variant="caption" color="muted">Difficulty</Text>
                <Badge
                  label={item.difficulty}
                  variant={item.difficulty === 'easy' ? 'correct' : item.difficulty === 'hard' ? 'accent' : 'primary'}
                />
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="muted">Category</Text>
                <Badge label={item.category} variant="muted" />
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[
                  styles.detailsBtn,
                  {
                    backgroundColor: isLearned
                      ? colors.correct
                      : colors.primary,
                    opacity: isLearned ? 0.75 : 1,
                  },
                ]}
                onPress={onMarkLearned}
                disabled={isLearned}
              >
                <Ionicons
                  name={
                    isLearned ? "checkmark-circle-outline" : "school-outline"
                  }
                  size={17}
                  color={colors.white}
                />
                <Text variant="button" style={{ color: colors.white }}>
                  {isLearned ? "Learned ✓" : "Mark as Learned"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={onBookmark}
              >
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>
      </View>
    );
  },
);

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    currentStreak,
    userName,
    toggleBookmark,
    isWordBookmarked,
    notificationHistory,
    dailyWords,
    currentWordIndex,
    isLoadingDailyWords,
    dailyWordsError,
    fetchDailyWords,
    refreshDailyWords,
    setCurrentWordIndex,
    learnedWords,
    markWordLearned,
  } = useAppStore();

  const todayKey = new Date().toISOString().split('T')[0];
  const todayLearnedCount = learnedWords.filter(
    w => w.lastReviewed?.startsWith(todayKey)
  ).length;

  // Filter out already-learned words so the carousel never shows them again
  const unlearnedDailyWords = useMemo(() =>
    dailyWords.filter(w =>
      !learnedWords.some(l => l.wordId.toLowerCase() === w.word.toLowerCase())
    ),
    [dailyWords, learnedWords]
  );

  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [localActiveIndex, setLocalActiveIndex] = useState(0);
  const [cardHeights, setCardHeights] = useState<Record<number, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDailyWords();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDailyWords();
  }, []);

  // Only auto-fetch when the carousel is completely empty — never interrupt visible cards.
  useEffect(() => {
    if (unlearnedDailyWords.length === 0 && !isLoadingDailyWords && dailyWords.length > 0) {
      refreshDailyWords();
    }
  }, [unlearnedDailyWords.length]);

  const N = unlearnedDailyWords.length;

  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const prevStoreIndex = useRef(currentWordIndex);
  const userScrolling = useRef(false);

  // Fires synchronously before native paint — re-centers instantly when N changes
  useLayoutEffect(() => {
    if (N === 0) return;
    scrollX.setValue(currentWordIndex * SCREEN_WIDTH);
    setLocalActiveIndex(currentWordIndex);
    prevStoreIndex.current = currentWordIndex;
    flatListRef.current?.scrollToIndex({ index: currentWordIndex, animated: false });
  }, [N]);

  useEffect(() => {
    if (prevStoreIndex.current === currentWordIndex || N === 0) return;
    prevStoreIndex.current = currentWordIndex;
    setLocalActiveIndex(currentWordIndex);
    flatListRef.current?.scrollToIndex({ index: currentWordIndex, animated: true });
  }, [currentWordIndex, N]);

  const handleScrollBeginDrag = useCallback(() => {
    userScrolling.current = true;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      userScrolling.current = false;
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.max(0, Math.min(N - 1, Math.round(x / SCREEN_WIDTH)));
      setLocalActiveIndex(idx);
      prevStoreIndex.current = idx;
      setCurrentWordIndex(idx);
    },
    [N, setCurrentWordIndex],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  const handleMarkLearned = useCallback(
    (word: Word) => {
      if (N === 0) return;
      if (N === 1) {
        markWordLearned(word.word);
        return;
      }
      const r = localActiveIndex;
      const nextIdx = r + 1 < N ? r + 1 : 0;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setLocalActiveIndex(nextIdx);
      prevStoreIndex.current = nextIdx;

      setTimeout(() => {
        const newCurrentWordIndex = r < N - 1 ? r : 0;
        prevStoreIndex.current = newCurrentWordIndex;
        setCurrentWordIndex(newCurrentWordIndex);
        markWordLearned(word.word);
      }, 350);
    },
    [N, localActiveIndex, markWordLearned, setCurrentWordIndex],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Word; index: number }) => (
      <CarouselCard
        item={item}
        index={index}
        scrollX={scrollX}
        isBookmarked={isWordBookmarked(item.id)}
        isLearned={learnedWords.some(
          (w) => w.wordId.toLowerCase() === item.word.toLowerCase(),
        )}
        onMarkLearned={() => handleMarkLearned(item)}
        onBookmark={() => toggleBookmark(item)}
        onHeightChange={(h) =>
          setCardHeights((prev) =>
            prev[index] === h ? prev : { ...prev, [index]: h },
          )
        }
      />
    ),
    [
      scrollX,
      isWordBookmarked,
      learnedWords,
      handleMarkLearned,
      toggleBookmark,
    ],
  );

  const maxCardHeight =
    Object.values(cardHeights).length > 0
      ? Math.max(...Object.values(cardHeights))
      : 0;
  const activeCardHeight = cardHeights[localActiveIndex] ?? 0;
  // Negative margin pulls dots up into the whitespace below shorter cards,
  // so dots always sit DOT_GAP below each card's actual content bottom.
  const dotsMarginTop =
    maxCardHeight > 0 && activeCardHeight > 0
      ? -(maxCardHeight - activeCardHeight) + DOT_GAP
      : DOT_GAP;

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
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={10}
          />
        }
      >
        {/* Hero — always primary blue, same in dark/light */}
        <View style={styles.hero}>
          <View style={styles.heroPatternA} />
          <View style={styles.heroPatternB} />

          <View style={styles.headerTop}>
            <View style={styles.userPill}>
              <View style={styles.avatar}>
                <Text variant="caption" color="white">
                  {userName?.charAt(0) || "W"}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.userPillText}>
                {userName || "WordWise"}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color={colors.streak} />
                <Text variant="caption" style={styles.streakText}>
                  {currentStreak}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => setShowNotificationHistory(true)}
              >
                <Ionicons
                  name="notifications-outline"
                  size={17}
                  color={colors.white}
                />
                {notificationHistory.length > 0 && (
                  <View
                    style={[
                      styles.notificationDot,
                      { backgroundColor: colors.accent },
                    ]}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroTextWrap}>
            <Text variant="h1" color="white" style={styles.heroTitle}>
              Today's{" "}
              <Text style={[styles.heroTitleAccent, { color: colors.streak }]}>
                Words!
              </Text>
            </Text>
            <Text variant="bodySmall" style={styles.heroSubtitle}>
              Swipe through your daily words — learn them all!
            </Text>
            <Text variant="caption" style={styles.heroDate}>
              {today}
            </Text>
          </View>
        </View>

        {/* Word Carousel */}
        {isLoadingDailyWords && N === 0 ? (
          <Card style={styles.singleCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                variant="body"
                color="muted"
                style={{ marginTop: spacing[3] }}
              >
                Loading your words...
              </Text>
            </View>
          </Card>
        ) : dailyWordsError ? (
          <Card style={styles.singleCard}>
            <View style={styles.loadingContainer}>
              <Ionicons
                name="cloud-offline-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text
                variant="h4"
                color="heading"
                style={{ marginTop: spacing[3] }}
              >
                Could not load words
              </Text>
              <Text
                variant="body"
                color="muted"
                style={{ marginTop: spacing[2], textAlign: "center" }}
              >
                Check your connection and try again.
              </Text>
              <TouchableOpacity
                onPress={fetchDailyWords}
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Text variant="button" color="white">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : N === 0 && todayLearnedCount >= 20 ? (
          <Card style={styles.singleCard}>
            <View style={styles.loadingContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.correct} />
              <Text variant="h4" color="heading" style={{ marginTop: spacing[3] }}>
                All caught up!
              </Text>
              <Text variant="body" color="muted" style={{ marginTop: spacing[2], textAlign: "center" }}>
                You've learned {todayLearnedCount} words today. Come back tomorrow for more!
              </Text>
            </View>
          </Card>
        ) : (
          <>
            <View style={styles.carouselWrapper}>
              <Animated.FlatList
                ref={flatListRef as any}
                data={unlearnedDailyWords}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                initialScrollIndex={currentWordIndex}
                getItemLayout={getItemLayout}
                keyExtractor={(_, index) => String(index)}
                renderItem={renderItem}
                onScrollBeginDrag={handleScrollBeginDrag}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false },
                )}
                onScrollToIndexFailed={({ index }) => {
                  requestAnimationFrame(() => {
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: false,
                    });
                  });
                }}
              />
            </View>

            {N > 1 && (
              <View
                style={[styles.paginationDots, { marginTop: dotsMarginTop }]}
              >
                {unlearnedDailyWords.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      { backgroundColor: colors.border },
                      index === localActiveIndex && {
                        width: 18,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Quick Quiz */}
        <TouchableOpacity
          style={[styles.quizCard, { backgroundColor: colors.correctLight }]}
          onPress={() => router.push("/quiz")}
        >
          <View style={styles.quizContent}>
            <View
              style={[
                styles.quizIcon,
                { backgroundColor: colors.correctLight },
              ]}
            >
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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Notification History Modal */}
      <Modal
        visible={showNotificationHistory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNotificationHistory(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotificationHistory(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
            onPress={() => {}}
          >
            <View
              style={[styles.modalHandle, { backgroundColor: colors.border }]}
            />
            <View style={styles.modalHeader}>
              <Text variant="h4" color="heading">
                Notification History
              </Text>
              <TouchableOpacity
                onPress={() => setShowNotificationHistory(false)}
              >
                <Ionicons name="close" size={22} color={colors.textHeading} />
              </TouchableOpacity>
            </View>

            {notificationHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-off-outline"
                  size={44}
                  color={colors.textMuted}
                />
                <Text
                  variant="body"
                  color="muted"
                  style={styles.emptyStateText}
                >
                  No notifications yet
                </Text>
                <Text
                  variant="bodySmall"
                  color="muted"
                  style={styles.emptyStateHint}
                >
                  Word reminders will appear here once received
                </Text>
              </View>
            ) : (
              <FlatList
                data={notificationHistory}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyList}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.historyItem,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <View
                      style={[
                        styles.historyIcon,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name="book-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.historyText}>
                      <Text variant="label" color="heading">
                        {item.word}
                      </Text>
                      {item.definition ? (
                        <Text
                          variant="bodySmall"
                          color="muted"
                          style={styles.historyDefinition}
                          numberOfLines={2}
                        >
                          {item.definition}
                        </Text>
                      ) : null}
                      <Text
                        variant="caption"
                        color="muted"
                        style={styles.historyTime}
                      >
                        {new Date(item.receivedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  hero: {
    position: "relative",
    backgroundColor: "#378ADD", // always primary blue — same in dark & light
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
  userPillText: { color: "#FFFFFF", fontWeight: "600" },
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
  streakText: { color: "#FFFFFF", fontWeight: "700" },
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
    borderWidth: 1,
    borderColor: "#FFFFFF",
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
  heroTitleAccent: { fontSize: 32, fontWeight: "700" },
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

  singleCard: {
    marginHorizontal: spacing[4],
    marginTop: -34,
    marginBottom: spacing[4],
    borderRadius: 28,
    paddingTop: spacing[5],
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  carouselWrapper: { marginTop: -34 },
  carouselItem: { width: SCREEN_WIDTH, paddingHorizontal: spacing[4] },
  wordCard: {
    borderRadius: 23,
    paddingTop: spacing[5],
    marginBottom: spacing[2],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  learnedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginBottom: spacing[3],
    alignSelf: "center",
    paddingHorizontal: spacing[4],
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  dot: { width: 6, height: 6, borderRadius: 3 },

  wordTitle: { textAlign: "center", marginBottom: spacing[4] },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  phoneticRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  phonetic: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  speakerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  meaningSection: { marginTop: spacing[3] },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  sectionLabel: {},
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  metaRow: { flexDirection: "row", gap: spacing[4], marginTop: spacing[3] },
  metaItem: { gap: spacing[1] },
  definition: { fontStyle: "italic", textAlign: "center" },
  example: { fontStyle: "italic", textAlign: "center" },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[6],
    gap: spacing[3],
  },
  detailsBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },

  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    marginTop: spacing[3],
    marginBottom: spacing[4],
  },
  quizContent: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  quizIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  quizText: { gap: 2 },
  quizTitle: { fontSize: 24 },
  quizSubtext: {},

  loadingContainer: {
    padding: spacing[7],
    alignItems: "center",
    justifyContent: "center",
  },
  retryBtn: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
  },
  bottomSpacer: { height: 0 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius["3xl"],
    borderTopRightRadius: borderRadius["3xl"],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
    maxHeight: "75%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
    alignSelf: "center",
    marginBottom: spacing[4],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing[10],
    gap: spacing[2],
  },
  emptyStateText: { marginTop: spacing[2] },
  emptyStateHint: { textAlign: "center", paddingHorizontal: spacing[6] },
  historyList: { gap: spacing[2], paddingBottom: spacing[4] },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  historyText: { flex: 1, gap: spacing[1] },
  historyDefinition: { lineHeight: 18 },
  historyTime: { marginTop: spacing[1] },
});
