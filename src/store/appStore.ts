import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../services/firebase';
import { Word, WordProgress, QuizSession } from "../types";
import { getWord, getWords, searchWords } from "../services/dictionaryApi";
import {
  CURATED_WORDS,
  getWordForDate,
  getRandomWords,
} from "../data/wordList";
import { generateQuizQuestions } from "../utils/quizGenerator";

function firebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/requires-recent-login': return 'Please log out and log back in to make this change.';
    case 'auth/account-exists-with-different-credential': return 'An account already exists with this email. Try a different sign-in method.';
    default: return 'Something went wrong. Please try again.';
  }
}

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
  dailyWordsError: boolean;

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
  userBio: string;
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string;
  notificationInterval: number; // hours between each notification (1, 2, 3, or 4)

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
  refreshDailyWords: () => Promise<void>;
  appendDailyWords: () => Promise<void>;
  clearTodayLearned: () => void;
  removeDailyWord: (wordId: string) => void;
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
  startQuiz: (words?: Word[]) => Promise<QuizSession | null>;
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
  setNotificationInterval: (hours: number) => void;

  // Notification History actions
  addNotificationToHistory: (item: { id: string; word: string; definition: string }) => void;

  // Theme actions
  toggleDarkMode: () => void;

  // Auth actions
  signup: (name: string, email: string, age: number, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: { name?: string; bio?: string; age?: number; newPassword?: string; currentPassword: string }) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password?: string) => Promise<{ success: boolean; error?: string }>;
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
  dailyWordsError: false,
  fetchedWords: [],
  bookmarkedWords: [],
  learnedWords: [],
  currentQuiz: null,
  quizHistory: [],
  searchQuery: "",
  searchResults: [],
  isSearching: false,  userAvatar: null,
  userBio: 'Vocabulary enthusiast',
  dailyGoal: 5,
  reminderEnabled: true,
  reminderTime: '09:00',
  notificationInterval: 2,
  notificationHistory: [],
  isDarkMode: false,
  isLoggedIn: false,
  userEmail: null,
  userAge: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadUserData: async () => {
        get().checkAndUpdateStreak();
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
          if (__DEV__) console.error("Error fetching today word:", error);
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
        const { dailyWordsDate, dailyWords, dailyGoal, learnedWords } = get();

        if (dailyWordsDate === today && dailyWords.length > 0) return;

        set({ isLoadingDailyWords: true, dailyWordsError: false });
        try {
          const goal = Math.max(1, dailyGoal);
          const todayEntry = getWordForDate(new Date());
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          const recentlyLearned = learnedWords
            .filter(w => w.lastReviewed >= thirtyDaysAgo)
            .map(w => w.wordId);
          const exclude = [todayEntry.word, ...recentlyLearned];
          const extras = getRandomWords(goal + 5, exclude).slice(0, goal + 4);
          const fetched = await getWords([todayEntry, ...extras]);
          const words = fetched.slice(0, goal);
          if (words.length === 0) throw new Error('No words returned');
          set({ dailyWords: words, dailyWordsDate: today, currentWordIndex: 0, isLoadingDailyWords: false, dailyWordsError: false });
        } catch (error) {
          if (__DEV__) console.error('Error fetching daily words:', error);
          set({ isLoadingDailyWords: false, dailyWordsError: true });
        }
      },

      refreshDailyWords: async () => {
        set({ isLoadingDailyWords: true, dailyWordsError: false });
        try {
          const { dailyGoal, learnedWords } = get();
          const goal = Math.max(1, dailyGoal);
          const todayEntry = getWordForDate(new Date());
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          const recentlyLearned = learnedWords
            .filter(w => w.lastReviewed >= thirtyDaysAgo)
            .map(w => w.wordId);
          const exclude = [todayEntry.word, ...recentlyLearned];
          const extras = getRandomWords(goal + 5, exclude).slice(0, goal + 4);
          const fetched = await getWords([todayEntry, ...extras]);
          const words = fetched.slice(0, goal);
          if (words.length === 0) throw new Error('No words returned');
          const today = new Date().toISOString().split('T')[0];
          set({ dailyWords: words, dailyWordsDate: today, currentWordIndex: 0, isLoadingDailyWords: false, dailyWordsError: false });
        } catch (error) {
          if (__DEV__) console.error('Error refreshing daily words:', error);
          set({ isLoadingDailyWords: false, dailyWordsError: true });
        }
      },

      appendDailyWords: async () => {
        const { dailyWords, learnedWords } = get();
        const exclude = [
          ...dailyWords.map(w => w.word),
          ...learnedWords.map(w => w.wordId),
        ];
        const candidates = getRandomWords(15, exclude).slice(0, 14);
        if (candidates.length === 0) return;
        try {
          const fetched = await getWords(
            candidates.map(e => ({ word: e.word, category: e.category, difficulty: e.difficulty }))
          );
          const newWords = fetched.slice(0, 10);
          if (newWords.length > 0) {
            set({ dailyWords: [...get().dailyWords, ...newWords] });
          }
        } catch {}
      },

      clearTodayLearned: () => {
        const { learnedWords, totalWordsLearned } = get();
        const todayKey = new Date().toISOString().split('T')[0];
        const todayEntries = learnedWords.filter(w => w.lastReviewed?.startsWith(todayKey));
        const kept = learnedWords.filter(w => !w.lastReviewed?.startsWith(todayKey));
        set({
          learnedWords: kept,
          totalWordsLearned: Math.max(0, totalWordsLearned - todayEntries.length),
        });
      },

      removeDailyWord: (wordId: string) => {
        const { dailyWords, currentWordIndex } = get();
        const filtered = dailyWords.filter(w => w.word.toLowerCase() !== wordId.toLowerCase());
        const newIndex = Math.min(currentWordIndex, Math.max(0, filtered.length - 1));
        set({ dailyWords: filtered, currentWordIndex: newIndex });
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
          if (__DEV__) console.error("Error fetching word:", error);
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
          const randomEntries = getRandomWords(5);
          quizWords = await getWords(randomEntries);
        }

        if (quizWords.length < 4) {
          if (__DEV__) console.error("Not enough words for quiz");
          return null;
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
        return session;
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

      setNotificationInterval: (hours: number) => {
        set({ notificationInterval: hours });
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
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await firebaseUpdateProfile(credential.user, { displayName: name });
          set({ userName: name, userEmail: email, userAge: age, isLoggedIn: true });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: firebaseAuthError(error.code) };
        }
      },

      login: async (email, password) => {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          set({ isLoggedIn: true, userEmail: email });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: firebaseAuthError(error.code) };
        }
      },

      logout: () => {
        signOut(auth);
        set({ isLoggedIn: false });
      },

      updateProfile: async ({ name, bio, age, newPassword, currentPassword }) => {
        const user = auth.currentUser;
        if (!user || !user.email) return { success: false, error: 'Not logged in.' };
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          if (name !== undefined) {
            await firebaseUpdateProfile(user, { displayName: name });
          }
          if (newPassword) await updatePassword(user, newPassword);
          const updates: Partial<AppState> = {};
          if (name !== undefined) updates.userName = name;
          if (bio !== undefined) updates.userBio = bio;
          if (age !== undefined) updates.userAge = age;
          set(updates);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: firebaseAuthError(error.code) };
        }
      },

      deleteAccount: async (password?: string) => {
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'Not logged in.' };
        try {
          const provider = user.providerData[0]?.providerId;
          if (provider === 'google.com') {
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signIn();
            const { idToken } = await GoogleSignin.getTokens();
            if (!idToken) throw new Error('No ID token');
            const credential = GoogleAuthProvider.credential(idToken);
            await reauthenticateWithCredential(user, credential);
          } else {
            if (!user.email || !password) return { success: false, error: 'Password is required.' };
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
          }
          await deleteUser(user);
          set({ ...initialState, isLoading: false, hasCompletedOnboarding: true });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: firebaseAuthError(error.code) };
        }
      },
    }),
    {
      name: "wordwise-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false;
      },
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
        userBio: state.userBio,
        dailyGoal: state.dailyGoal,
        reminderEnabled: state.reminderEnabled,
        reminderTime: state.reminderTime,
        notificationInterval: state.notificationInterval,
        notificationHistory: state.notificationHistory,
        isDarkMode: state.isDarkMode,
        isLoggedIn: state.isLoggedIn,
        userEmail: state.userEmail,
        userAge: state.userAge,
      }),
    },
  ),
);
