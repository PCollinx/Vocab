/**
 * Global type definitions
 */

// API response types from Free Dictionary API
export interface DictionaryAPIResponse {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
    sourceUrl?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  license?: {
    name: string;
    url: string;
  };
  sourceUrls?: string[];
}

// All meanings returned by the dictionary API for a word
export interface WordMeaning {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example?: string;
  }>;
  synonyms: string[];
  antonyms: string[];
}

// Word data structure
export interface Word {
  id: string;
  word: string;
  partOfSpeech: string;    // primary part of speech (from first meaning)
  pronunciation: string;
  audioUrl?: string;
  definition: string;       // primary definition (backward-compatible)
  example?: string;         // primary example (backward-compatible)
  synonyms: string[];
  antonyms: string[];
  meanings?: WordMeaning[]; // full list of meanings from the API
  difficulty: 'easy' | 'medium' | 'hard';
  category: WordCategory;
  isBookmarked?: boolean;
  isLearned?: boolean;
  dateAdded?: string;
  lastReviewed?: string;
}

export type WordCategory = 
  | 'business'
  | 'science'
  | 'literature'
  | 'technology'
  | 'arts'
  | 'history'
  | 'everyday'
  | 'academic';

// User learning progress
export interface WordProgress {
  wordId: string;
  learned: boolean;
  masteryLevel: number; // 0-5, where 5 is fully mastered
  lastReviewed: string; // ISO date
  timesReviewed: number;
  timesCorrect: number;
}

// User streak data
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date
  weeklyActivity: boolean[]; // 7 days, starting from Monday
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  totalWordsLearned: number;
  streak: StreakData;
}

// Daily word selection
export interface DailyWord {
  word: Word;
  date: string; // ISO date
  completed: boolean;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'match-synonym';
  word: Word;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string;
  isComplete: boolean;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  selectedAnswer: string;
  timeTaken: number; // in milliseconds
}

// Navigation types (will be expanded with expo-router)
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  WordDetail: { wordId: string };
  Quiz: { wordId?: string };
  Progress: undefined;
  Profile: undefined;
};
