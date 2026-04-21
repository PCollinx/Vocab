/**
 * App Store
 * Global state management with zustand + AsyncStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, WordProgress, QuizQuestion, QuizSession } from '../types';
import { getWord, getWords, searchWords } from '../services/dictionaryApi';
import { CURATED_WORDS, getWordForDate, getRandomWords } from '../data/wordList';

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

  // Actions
  loadUserData: () => Promise<void>;
  setUserName: (name: string) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;

  // Word of the Day
  fetchTodayWord: () => Promise<void>;
  markTodayWordComplete: () => void;

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
  fetchedWords: [],
  bookmarkedWords: [],
  learnedWords: [],
  currentQuiz: null,
  quizHistory: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
};

// Helper to generate quiz questions
function generateQuizQuestions(words: Word[]): QuizQuestion[] {
  return words.map((word, index) => {
    const questionTypes: QuizQuestion['type'][] = ['multiple-choice', 'match-synonym'];
    const type = questionTypes[index % questionTypes.length];
    
    // Generate wrong options
    const otherWords = words.filter(w => w.id !== word.id);
    const wrongOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => type === 'match-synonym' ? (w.synonyms[0] || w.word) : w.definition);
    
    let question: string;
    let correctAnswer: string;
    let options: string[];
    
    if (type === 'multiple-choice') {
      question = `What is the definition of "${word.word}"?`;
      correctAnswer = word.definition;
      options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    } else {
      question = `Which word is a synonym of "${word.word}"?`;
      correctAnswer = word.synonyms[0] || word.word;
      const synonymOptions = otherWords
        .flatMap(w => w.synonyms.length > 0 ? [w.synonyms[0]] : [w.word])
        .slice(0, 3);
      options = [correctAnswer, ...synonymOptions].sort(() => Math.random() - 0.5);
    }
    
    return {
      id: `q-${index}-${Date.now()}`,
      type,
      word,
      question,
      options,
      correctAnswer,
    };
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadUserData: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
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
        const today = new Date().toISOString().split('T')[0];
        const { todayWordDate, todayWord } = get();
        
        // Already have today's word
        if (todayWordDate === today && todayWord) {
          return;
        }
        
        set({ isLoadingTodayWord: true });
        
        try {
          // Get the word for today from our curated list
          const wordEntry = getWordForDate(new Date());
          const fetchedWord = await getWord(wordEntry.word, wordEntry.category, wordEntry.difficulty);
          
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
                partOfSpeech: 'noun',
                pronunciation: '',
                definition: 'Definition is loading...',
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
          console.error('Error fetching today word:', error);
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

      // ========== Word Actions ==========
      fetchWordDetails: async (word: string) => {
        try {
          const fetchedWord = await getWord(word);
          if (fetchedWord) {
            const { fetchedWords } = get();
            // Add to cache if not already there
            if (!fetchedWords.find(w => w.word === fetchedWord.word)) {
              set({ fetchedWords: [...fetchedWords, fetchedWord] });
            }
          }
          return fetchedWord;
        } catch (error) {
          console.error('Error fetching word:', error);
          return null;
        }
      },

      fetchCategoryWords: async (category: string, count = 10) => {
        const categoryWords = CURATED_WORDS.filter(w => w.category === category);
        const selected = categoryWords.sort(() => Math.random() - 0.5).slice(0, count);
        
        const words = await getWords(selected);
        
        // Update cache
        const { fetchedWords } = get();
        const newWords = words.filter(w => !fetchedWords.find(fw => fw.word === w.word));
        if (newWords.length > 0) {
          set({ fetchedWords: [...fetchedWords, ...newWords] });
        }
        
        return words;
      },

      markWordLearned: (wordId: string) => {
        const { learnedWords, totalWordsLearned } = get();
        
        const existingIndex = learnedWords.findIndex(w => w.wordId === wordId);
        
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
        const isBookmarked = bookmarkedWords.some(w => w.id === word.id);
        
        if (isBookmarked) {
          set({ bookmarkedWords: bookmarkedWords.filter(w => w.id !== word.id) });
        } else {
          set({ bookmarkedWords: [...bookmarkedWords, { ...word, isBookmarked: true }] });
        }
      },

      isWordBookmarked: (wordId: string) => {
        return get().bookmarkedWords.some(w => w.id === wordId);
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
        const localResults = searchWords(query, [...fetchedWords, ...bookmarkedWords]);
        
        // Also try to fetch from API
        const apiWord = await getWord(query);
        
        let results = [...localResults];
        if (apiWord && !results.find(w => w.word === apiWord.word)) {
          results = [apiWord, ...results];
        }
        
        set({ searchResults: results, isSearching: false });
      },

      clearSearch: () => {
        set({ searchQuery: '', searchResults: [], isSearching: false });
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
          console.error('Not enough words for quiz');
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
        const today = new Date().toISOString().split('T')[0];
        const { lastActiveDate, currentStreak, longestStreak, weeklyActivity } = get();
        
        if (lastActiveDate === today) {
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

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
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActiveDate < yesterdayStr) {
          set({ currentStreak: 0 });
        }
      },
    }),
    {
      name: 'wordwise-storage',
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
        bookmarkedWords: state.bookmarkedWords,
        learnedWords: state.learnedWords,
        quizHistory: state.quizHistory,
      }),
    }
  )
);
