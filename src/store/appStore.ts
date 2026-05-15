import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word, WordProgress, QuizSession } from "../types";
import { getWord, getWords, searchWords } from "../services/dictionaryApi";
import {
  CURATED_WORDS,
  getWordForDate,
  getRandomWords,
} from "../data/wordList";
import { generateQuizQuestions } from "../utils/quizGenerator";

interface AppState {
  // User data
  userName: string | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;

  // Streak & Progress
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  lastActiveDate: string | null;
  weeklyActivity: boolean[];

  // Word of the Day
  todayWord: Word | null;
  todayWordDate: string | null;
  todayWordCompleted: boolean;
  isLoadingTodayWord: boolean;

  // Daily Carousel
  dailyWords: Word[];
  dailyWordsDate: string | null;
  currentWordIndex: number;
  isLoadingDailyWords: boolean;

  // Word Library
  fetchedWords: Word[];
  bookmarkedWords: Word[];
  learnedWords: WordProgress[];

  // Quiz
  currentQuiz: QuizSession | null;
  quizHistory: { date: string; score: number; total: number }[];

  // Search
  searchQuery: string;
  searchResults: Word[];
  isSearching: boolean;

  // User Settings
  userAvatar: string | null;
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string;

  // Notification History
  notificationHistory: {
    id: string;
    word: string;
    definition: string;
    receivedAt: string;
  }[];

  // Theme
  isDarkMode: boolean;

  // Auth
  isLoggedIn: boolean;
  userEmail: string | null;
  userAge: number | null;
  userPassword: string | null;

  // Actions
  loadUserData: () => Promise<void>;
  setUserName: (name: string) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;

  // Word of the Day
  fetchTodayWord: () => Promise<void>;
  markTodayWordComplete: () => void;

  // Daily Carousel actions
  fetchDailyWords: () => Promise<void>;
  advanceToNextWord: () => void;
  setCurrentWordIndex: (index: number) => void;

  // Word actions
  fetchWordDetails: (word: string) => Promise<Word | null>;
  fetchCategoryWords: (category: string, count?: number) => Promise<Word[]>;
  markWordLearned: (wordId: string) => void;
  toggleBookmark: (word: Word) => void;
  isWordBookmarked: (wordId: string) => boolean;

  // Search
  searchForWords: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Quiz actions
  startQuiz: (words?: Word[]) => Promise<void>;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  endQuiz: () => void;

  // Streak actions
  updateStreak: () => void;
  checkAndUpdateStreak: () => void;

  // User Settings actions
  setUserAvatar: (avatar: string) => void;
  setDailyGoal: (goal: number) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;

  // Notification History actions
  addNotificationToHistory: (item: { id: string; word: string; definition: string }) => void;

  // Theme actions
  toggleDarkMode: () => void;

  // Auth actions
  signup: (name: string, email: string, age: number, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: { name?: string; email?: string; age?: number; newPassword?: string; currentPassword: string }) => { success: boolean; error?: string };
}

const initialState = {
  userName: null,
  hasCompletedOnboarding: false,
  isLoading: true,
  currentStreak: 0,
  longestStreak: 0,
  totalWordsLearned: 0,
  lastActiveDate: null,
  weeklyActivity: [false, false, false, false, false, false, false],
  todayWord: null,
  todayWordDate: null,
  todayWordCompleted: false,
  isLoadingTodayWord: false,
  dailyWords: [],
  dailyWordsDate: null,
  currentWordIndex: 0,
  isLoadingDailyWords: false,
  fetchedWords: [],
  bookmarkedWords: [],
  learnedWords: [],
  currentQuiz: null,
  quizHistory: [],
  searchQuery: "",
  searchResults: [],
  isSearching: false,  userAvatar: null,
  dailyGoal: 5,
  reminderEnabled: true,
  reminderTime: '09:00',
  notificationHistory: [],
  isDarkMode: false,
  isLoggedIn: false,
  userEmail: null,
  userAge: null,
  userPassword: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadUserData: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ isLoading: false });
        get().checkAndUpdateStreak();
        // Fetch today's word if needed
        get().fetchTodayWord();
      },

      setUserName: (name: string) => {
        set({ userName: name });
      },

      completeOnboarding: async () => {
        set({ hasCompletedOnboarding: true });
      },

      resetOnboarding: async () => {
        set({
          hasCompletedOnboarding: false,
          userName: null,
        });
      },

      // ========== Word of the Day ==========
      fetchTodayWord: async () => {
        const today = new Date().toISOString().split("T")[0];
        const { todayWordDate, todayWord } = get();

        // Already have today's word
        if (todayWordDate === today && todayWord) {
          return;
        }

        set({ isLoadingTodayWord: true });

        try {
          // Get the word for today from our curated list
          const wordEntry = getWordForDate(new Date());
          const fetchedWord = await getWord(
            wordEntry.word,
            wordEntry.category,
            wordEntry.difficulty,
          );

          if (fetchedWord) {
            set({
              todayWord: fetchedWord,
              todayWordDate: today,
              todayWordCompleted: false,
              isLoadingTodayWord: false,
            });
          } else {
            // Fallback to a default word if API fails
            set({
              todayWord: {
                id: `fallback-${today}`,
                word: wordEntry.word,
                partOfSpeech: "noun",
                pronunciation: "",
                definition: "Definition is loading...",
                synonyms: [],
                antonyms: [],
                category: wordEntry.category,
                difficulty: wordEntry.difficulty,
              },
              todayWordDate: today,
              todayWordCompleted: false,
              isLoadingTodayWord: false,
            });
          }
        } catch (error) {
          console.error("Error fetching today word:", error);
          set({ isLoadingTodayWord: false });
        }
      },

      markTodayWordComplete: () => {
        const { todayWord } = get();
        set({ todayWordCompleted: true });
        if (todayWord) {
          get().markWordLearned(todayWord.id);
        }
      },

      // ========== Daily Carousel ==========
      fetchDailyWords: async () => {
        const today = new Date().toISOString().split('T')[0];
        const { dailyWordsDate, dailyWords, dailyGoal } = get();

        if (dailyWordsDate === today && dailyWords.length > 0) return;

        set({ isLoadingDailyWords: true });
        try {
          const goal = Math.max(1, dailyGoal);
          const todayEntry = getWordForDate(new Date());
          const extras = getRandomWords(goal + 2)
            .filter(w => w.word !== todayEntry.word)
            .slice(0, goal - 1);
          const words = await getWords([todayEntry, ...extras]);
          set({ dailyWords: words, dailyWordsDate: today, currentWordIndex: 0, isLoadingDailyWords: false });
        } catch (error) {
          console.error('Error fetching daily words:', error);
          set({ isLoadingDailyWords: false });
        }
      },

      advanceToNextWord: () => {
        const { currentWordIndex, dailyWords } = get();
        if (dailyWords.length === 0) return;
        set({ currentWordIndex: (currentWordIndex + 1) % dailyWords.length });
      },

      setCurrentWordIndex: (index: number) => {
        set({ currentWordIndex: index });
      },

      // ========== Word Actions ==========
      fetchWordDetails: async (word: string) => {
        try {
          const fetchedWord = await getWord(word);
          if (fetchedWord) {
            const { fetchedWords } = get();
            // Add to cache if not already there
            if (!fetchedWords.find((w) => w.word === fetchedWord.word)) {
              set({ fetchedWords: [...fetchedWords, fetchedWord] });
            }
          }
          return fetchedWord;
        } catch (error) {
          console.error("Error fetching word:", error);
          return null;
        }
      },

      fetchCategoryWords: async (category: string, count = 10) => {
        const categoryWords = CURATED_WORDS.filter(
          (w) => w.category === category,
        );
        const selected = categoryWords
          .sort(() => Math.random() - 0.5)
          .slice(0, count);

        const words = await getWords(selected);

        // Update cache
        const { fetchedWords } = get();
        const newWords = words.filter(
          (w) => !fetchedWords.find((fw) => fw.word === w.word),
        );
        if (newWords.length > 0) {
          set({ fetchedWords: [...fetchedWords, ...newWords] });
        }

        return words;
      },

      markWordLearned: (wordId: string) => {
        const { learnedWords, totalWordsLearned } = get();

        const existingIndex = learnedWords.findIndex(
          (w) => w.wordId === wordId,
        );

        if (existingIndex >= 0) {
          const updated = [...learnedWords];
          updated[existingIndex] = {
            ...updated[existingIndex],
            timesReviewed: updated[existingIndex].timesReviewed + 1,
            lastReviewed: new Date().toISOString(),
            masteryLevel: Math.min(updated[existingIndex].masteryLevel + 1, 5),
          };
          set({ learnedWords: updated });
        } else {
          const newProgress: WordProgress = {
            wordId,
            learned: true,
            masteryLevel: 1,
            lastReviewed: new Date().toISOString(),
            timesReviewed: 1,
            timesCorrect: 1,
          };
          set({
            learnedWords: [...learnedWords, newProgress],
            totalWordsLearned: totalWordsLearned + 1,
          });
        }

        // Auto-advance carousel if the learned word is the current one
        const { dailyWords, currentWordIndex } = get();
        const currentCarouselWord = dailyWords[currentWordIndex];
        if (currentCarouselWord && currentCarouselWord.word.toLowerCase() === wordId.toLowerCase()) {
          get().advanceToNextWord();
        }

        get().updateStreak();
      },

      toggleBookmark: (word: Word) => {
        const { bookmarkedWords } = get();
        const isBookmarked = bookmarkedWords.some((w) => w.id === word.id);

        if (isBookmarked) {
          set({
            bookmarkedWords: bookmarkedWords.filter((w) => w.id !== word.id),
          });
        } else {
          set({
            bookmarkedWords: [
              ...bookmarkedWords,
              { ...word, isBookmarked: true },
            ],
          });
        }
      },

      isWordBookmarked: (wordId: string) => {
        return get().bookmarkedWords.some((w) => w.id === wordId);
      },

      // ========== Search ==========
      searchForWords: async (query: string) => {
        set({ searchQuery: query, isSearching: true });

        if (!query.trim()) {
          set({ searchResults: [], isSearching: false });
          return;
        }

        // Search local cache first
        const { fetchedWords, bookmarkedWords } = get();
        const localResults = searchWords(query, [
          ...fetchedWords,
          ...bookmarkedWords,
        ]);

        // Also try to fetch from API
        const apiWord = await getWord(query);

        let results = [...localResults];
        if (apiWord && !results.find((w) => w.word === apiWord.word)) {
          results = [apiWord, ...results];
        }

        set({ searchResults: results, isSearching: false });
      },

      clearSearch: () => {
        set({ searchQuery: "", searchResults: [], isSearching: false });
      },

      // ========== Quiz ==========
      startQuiz: async (words?: Word[]) => {
        let quizWords = words;

        if (!quizWords || quizWords.length < 4) {
          // Fetch random words for quiz
          const randomEntries = getRandomWords(5);
          quizWords = await getWords(randomEntries);
        }

        if (quizWords.length < 4) {
          console.error("Not enough words for quiz");
          return;
        }

        const questions = generateQuizQuestions(quizWords.slice(0, 5));

        const session: QuizSession = {
          id: `quiz-${Date.now()}`,
          questions,
          currentIndex: 0,
          score: 0,
          totalQuestions: questions.length,
          startedAt: new Date().toISOString(),
          isComplete: false,
        };

        set({ currentQuiz: session });
      },

      answerQuestion: (answer: string) => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;

        const currentQuestion = currentQuiz.questions[currentQuiz.currentIndex];
        const isCorrect = answer === currentQuestion.correctAnswer;

        const updatedQuestions = [...currentQuiz.questions];
        updatedQuestions[currentQuiz.currentIndex] = {
          ...currentQuestion,
          userAnswer: answer,
          isCorrect,
        };

        set({
          currentQuiz: {
            ...currentQuiz,
            questions: updatedQuestions,
            score: isCorrect ? currentQuiz.score + 1 : currentQuiz.score,
          },
        });
      },

      nextQuestion: () => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;

        const nextIndex = currentQuiz.currentIndex + 1;
        const isComplete = nextIndex >= currentQuiz.totalQuestions;

        if (isComplete) {
          const { quizHistory } = get();
          set({
            currentQuiz: {
              ...currentQuiz,
              currentIndex: nextIndex,
              isComplete: true,
              completedAt: new Date().toISOString(),
            },
            quizHistory: [
              ...quizHistory,
              {
                date: new Date().toISOString(),
                score: currentQuiz.score,
                total: currentQuiz.totalQuestions,
              },
            ],
          });

          // Update streak for completing quiz
          get().updateStreak();
        } else {
          set({
            currentQuiz: {
              ...currentQuiz,
              currentIndex: nextIndex,
            },
          });
        }
      },

      endQuiz: () => {
        set({ currentQuiz: null });
      },

      // ========== Streak ==========
      updateStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        const { lastActiveDate, currentStreak, longestStreak, weeklyActivity } =
          get();

        if (lastActiveDate === today) {
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = currentStreak;

        if (lastActiveDate === yesterdayStr) {
          newStreak = currentStreak + 1;
        } else if (lastActiveDate !== today) {
          newStreak = 1;
        }

        const dayOfWeek = new Date().getDay();
        const newWeeklyActivity = [...weeklyActivity];
        newWeeklyActivity[dayOfWeek === 0 ? 6 : dayOfWeek - 1] = true;

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, longestStreak),
          lastActiveDate: today,
          weeklyActivity: newWeeklyActivity,
        });
      },

      checkAndUpdateStreak: () => {
        const { lastActiveDate } = get();

        if (!lastActiveDate) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActiveDate < yesterdayStr) {
          set({ currentStreak: 0 });
        }
      },

      // ========== User Settings ==========
      setUserAvatar: (avatar: string) => {
        set({ userAvatar: avatar });
      },

      setDailyGoal: (goal: number) => {
        // Clamp goal between 1 and 10
        const clampedGoal = Math.max(1, Math.min(10, goal));
        set({ dailyGoal: clampedGoal });
      },

      setReminderEnabled: (enabled: boolean) => {
        set({ reminderEnabled: enabled });
      },

      setReminderTime: (time: string) => {
        set({ reminderTime: time });
      },

      addNotificationToHistory: (item) => {
        const { notificationHistory } = get();
        if (notificationHistory.some((n) => n.id === item.id)) return;
        set({
          notificationHistory: [
            { ...item, receivedAt: new Date().toISOString() },
            ...notificationHistory,
          ].slice(0, 50),
        });
      },

      toggleDarkMode: () => {
        set({ isDarkMode: !get().isDarkMode });
      },

      signup: async (name, email, age, password) => {
        const { userEmail } = get();
        if (userEmail && userEmail === email) {
          return { success: false, error: 'An account with this email already exists.' };
        }
        set({ userName: name, userEmail: email, userAge: age, userPassword: password, isLoggedIn: true });
        return { success: true };
      },

      login: async (email, password) => {
        const { userEmail, userPassword } = get();
        if (!userEmail || !userPassword) {
          return { success: false, error: 'No account found. Please sign up first.' };
        }
        if (userEmail !== email || userPassword !== password) {
          return { success: false, error: 'Invalid email or password.' };
        }
        set({ isLoggedIn: true });
        return { success: true };
      },

      logout: () => {
        set({ isLoggedIn: false });
      },

      updateProfile: ({ name, email, age, newPassword, currentPassword }) => {
        const { userPassword } = get();
        if (userPassword !== currentPassword) {
          return { success: false, error: 'Current password is incorrect.' };
        }
        const updates: Partial<AppState> = {};
        if (name !== undefined) updates.userName = name;
        if (email !== undefined) updates.userEmail = email;
        if (age !== undefined) updates.userAge = age;
        if (newPassword) updates.userPassword = newPassword;
        set(updates);
        return { success: true };
      },
    }),
    {
      name: "wordwise-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userName: state.userName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        totalWordsLearned: state.totalWordsLearned,
        lastActiveDate: state.lastActiveDate,
        weeklyActivity: state.weeklyActivity,
        todayWord: state.todayWord,
        todayWordDate: state.todayWordDate,
        todayWordCompleted: state.todayWordCompleted,
        dailyWords: state.dailyWords,
        dailyWordsDate: state.dailyWordsDate,
        currentWordIndex: state.currentWordIndex,
        bookmarkedWords: state.bookmarkedWords,
        learnedWords: state.learnedWords,
        quizHistory: state.quizHistory,
        userAvatar: state.userAvatar,
        dailyGoal: state.dailyGoal,
        reminderEnabled: state.reminderEnabled,
        reminderTime: state.reminderTime,
        notificationHistory: state.notificationHistory,
        isDarkMode: state.isDarkMode,
        isLoggedIn: state.isLoggedIn,
        userEmail: state.userEmail,
        userAge: state.userAge,
        userPassword: state.userPassword,
      }),
    },
  ),
);
