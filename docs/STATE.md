# WordWise - State Management

Documentation for the Zustand store and state management patterns in the WordWise app.

---

## Table of Contents

- [Overview](#overview)
- [Store Architecture](#store-architecture)
- [State Structure](#state-structure)
- [Actions Reference](#actions-reference)
- [Persistence](#persistence)
- [Usage Patterns](#usage-patterns)
- [Debugging](#debugging)

---

## Overview

WordWise uses **Zustand** for state management with **AsyncStorage** for persistence.

### Why Zustand?

- **Minimal boilerplate**: Simple API without reducers or action types
- **TypeScript support**: Full type inference
- **Persistence**: Built-in middleware for AsyncStorage
- **Performance**: Automatic re-render optimization
- **DevTools**: Compatible with React DevTools

### Store Location

`src/store/appStore.ts`

### Basic Usage

```typescript
import { useAppStore } from '../store/appStore';

function MyComponent() {
  // Select specific state
  const todayWord = useAppStore(state => state.todayWord);
  
  // Select multiple values
  const { currentStreak, totalWordsLearned } = useAppStore();
  
  // Get actions
  const { fetchTodayWord, toggleBookmark } = useAppStore();
  
  return (/* ... */);
}
```

---

## Store Architecture

```
┌────────────────────────────────────────────────────────┐
│                     Zustand Store                       │
├────────────────────────────────────────────────────────┤
│  State                                                  │
│  ├── User Data (name, onboarding)                      │
│  ├── Progress (streak, learned words)                  │
│  ├── Word of the Day                                   │
│  ├── Word Library (fetched, bookmarked)                │
│  ├── Quiz (session, history)                           │
│  └── Search (query, results)                           │
├────────────────────────────────────────────────────────┤
│  Actions                                                │
│  ├── User Actions                                       │
│  ├── Word Actions                                       │
│  ├── Quiz Actions                                       │
│  └── Streak Actions                                    │
├────────────────────────────────────────────────────────┤
│  Middleware                                             │
│  └── persist (AsyncStorage)                            │
└────────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────┐
│                   AsyncStorage                          │
│  Key: "wordwise-storage"                               │
└────────────────────────────────────────────────────────┘
```

---

## State Structure

### Complete State Interface

```typescript
interface AppState {
  // ========== USER DATA ==========
  userName: string | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;

  // ========== STREAK & PROGRESS ==========
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  lastActiveDate: string | null;      // ISO date string
  weeklyActivity: boolean[];          // 7 days [Mon...Sun]

  // ========== WORD OF THE DAY ==========
  todayWord: Word | null;
  todayWordDate: string | null;       // ISO date string
  todayWordCompleted: boolean;
  isLoadingTodayWord: boolean;

  // ========== WORD LIBRARY ==========
  fetchedWords: Word[];               // Previously fetched words
  bookmarkedWords: Word[];            // Saved words
  learnedWords: WordProgress[];       // Learning progress

  // ========== QUIZ ==========
  currentQuiz: QuizSession | null;
  quizHistory: {
    date: string;
    score: number;
    total: number;
  }[];

  // ========== SEARCH ==========
  searchQuery: string;
  searchResults: Word[];
  isSearching: boolean;
}
```

### Initial State

```typescript
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
```

---

## Actions Reference

### User Actions

#### `loadUserData()`

Initialize user data from storage.

```typescript
loadUserData: async () => {
  set({ isLoading: true });
  // Data loaded automatically by persist middleware
  set({ isLoading: false });
}
```

**Usage:**
```typescript
useEffect(() => {
  loadUserData();
}, []);
```

---

#### `setUserName(name: string)`

Set the user's display name.

```typescript
setUserName: (name) => {
  set({ userName: name });
}
```

**Usage:**
```typescript
const { setUserName } = useAppStore();
setUserName('John');
```

---

#### `completeOnboarding()`

Mark onboarding as complete and navigate to main app.

```typescript
completeOnboarding: async () => {
  set({ hasCompletedOnboarding: true });
}
```

---

#### `resetOnboarding()`

Reset to show onboarding again (for testing).

```typescript
resetOnboarding: async () => {
  set({ 
    hasCompletedOnboarding: false,
    userName: null 
  });
}
```

---

### Word of the Day Actions

#### `fetchTodayWord()`

Fetch the word of the day. Uses caching to prevent re-fetching.

```typescript
fetchTodayWord: async () => {
  const { todayWordDate } = get();
  const today = new Date().toISOString().split('T')[0];
  
  // Use cached word if same day
  if (todayWordDate === today && get().todayWord) {
    return;
  }
  
  set({ isLoadingTodayWord: true });
  
  // Get curated word for today (deterministic)
  const wordEntry = getWordForDate(new Date());
  
  // Fetch full definition from API
  const word = await getWord(wordEntry.word, wordEntry.category, wordEntry.difficulty);
  
  set({
    todayWord: word,
    todayWordDate: today,
    isLoadingTodayWord: false,
    todayWordCompleted: false,
  });
}
```

**Usage:**
```typescript
useEffect(() => {
  fetchTodayWord();
}, []);
```

---

#### `markTodayWordComplete()`

Mark today's word as learned and update progress.

```typescript
markTodayWordComplete: () => {
  set((state) => ({
    todayWordCompleted: true,
    totalWordsLearned: state.totalWordsLearned + 1,
  }));
  
  get().updateStreak();
}
```

---

### Word Library Actions

#### `fetchWordDetails(word: string)`

Fetch full details for a specific word.

```typescript
fetchWordDetails: async (word) => {
  const wordData = await getWord(word);
  
  if (wordData) {
    set((state) => ({
      fetchedWords: [...state.fetchedWords, wordData]
    }));
  }
  
  return wordData;
}
```

---

#### `fetchCategoryWords(category: string, count?: number)`

Fetch words from a specific category.

```typescript
fetchCategoryWords: async (category, count = 10) => {
  const categoryWords = CURATED_WORDS
    .filter(w => w.category === category)
    .slice(0, count);
  
  const words = await getWords(categoryWords);
  return words;
}
```

---

#### `toggleBookmark(word: Word)`

Add or remove a word from bookmarks.

```typescript
toggleBookmark: (word) => {
  set((state) => {
    const isBookmarked = state.bookmarkedWords.some(
      w => w.word === word.word
    );
    
    if (isBookmarked) {
      return {
        bookmarkedWords: state.bookmarkedWords.filter(
          w => w.word !== word.word
        )
      };
    } else {
      return {
        bookmarkedWords: [...state.bookmarkedWords, word]
      };
    }
  });
}
```

**Usage:**
```typescript
const { toggleBookmark, isWordBookmarked } = useAppStore();

<IconButton
  icon={isWordBookmarked(word.id) ? 'bookmark' : 'bookmark-outline'}
  onPress={() => toggleBookmark(word)}
/>
```

---

#### `isWordBookmarked(wordId: string): boolean`

Check if a word is in bookmarks.

```typescript
isWordBookmarked: (wordId) => {
  return get().bookmarkedWords.some(
    w => w.word.toLowerCase() === wordId.toLowerCase()
  );
}
```

---

#### `markWordLearned(wordId: string)`

Mark a word as learned and track progress.

```typescript
markWordLearned: (wordId) => {
  set((state) => {
    const existing = state.learnedWords.find(w => w.wordId === wordId);
    
    if (existing) {
      // Update existing progress
      return {
        learnedWords: state.learnedWords.map(w =>
          w.wordId === wordId
            ? { ...w, timesReviewed: w.timesReviewed + 1, lastReviewed: new Date().toISOString() }
            : w
        )
      };
    } else {
      // Add new progress
      return {
        learnedWords: [...state.learnedWords, {
          wordId,
          learned: true,
          masteryLevel: 1,
          lastReviewed: new Date().toISOString(),
          timesReviewed: 1,
          timesCorrect: 0,
        }],
        totalWordsLearned: state.totalWordsLearned + 1,
      };
    }
  });
}
```

---

### Search Actions

#### `searchForWords(query: string)`

Search for words via API.

```typescript
searchForWords: async (query) => {
  if (!query.trim()) {
    set({ searchResults: [], searchQuery: '' });
    return;
  }
  
  set({ isSearching: true, searchQuery: query });
  
  // Search curated words first
  const curatedMatches = CURATED_WORDS
    .filter(w => w.word.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);
  
  // Fetch full definitions
  const words = await getWords(curatedMatches);
  
  set({
    searchResults: words,
    isSearching: false,
  });
}
```

**Usage:**
```typescript
// Debounced search
useEffect(() => {
  const timer = setTimeout(() => {
    if (query.trim()) {
      searchForWords(query);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [query]);
```

---

#### `clearSearch()`

Clear search state.

```typescript
clearSearch: () => {
  set({
    searchQuery: '',
    searchResults: [],
    isSearching: false,
  });
}
```

---

### Quiz Actions

#### `startQuiz(words?: Word[])`

Start a new quiz session.

```typescript
startQuiz: async (words) => {
  // Get random words if none provided
  const quizWords = words || await getWords(getRandomWords(5));
  
  // Generate questions
  const questions: QuizQuestion[] = quizWords.map((word, i) => ({
    id: `q-${i}`,
    type: 'multiple-choice',
    word,
    question: 'What is the definition of this word?',
    options: generateOptions(word, quizWords),
    correctAnswer: word.definition,
  }));
  
  set({
    currentQuiz: {
      id: `quiz-${Date.now()}`,
      questions,
      currentIndex: 0,
      score: 0,
      totalQuestions: questions.length,
      startedAt: new Date().toISOString(),
      isComplete: false,
    }
  });
}
```

---

#### `answerQuestion(answer: string)`

Submit an answer for the current question.

```typescript
answerQuestion: (answer) => {
  set((state) => {
    if (!state.currentQuiz) return state;
    
    const currentQuestion = state.currentQuiz.questions[state.currentQuiz.currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    const updatedQuestions = [...state.currentQuiz.questions];
    updatedQuestions[state.currentQuiz.currentIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect,
    };
    
    return {
      currentQuiz: {
        ...state.currentQuiz,
        questions: updatedQuestions,
        score: isCorrect ? state.currentQuiz.score + 1 : state.currentQuiz.score,
      }
    };
  });
}
```

---

#### `nextQuestion()`

Move to the next question or complete quiz.

```typescript
nextQuestion: () => {
  set((state) => {
    if (!state.currentQuiz) return state;
    
    const nextIndex = state.currentQuiz.currentIndex + 1;
    const isComplete = nextIndex >= state.currentQuiz.totalQuestions;
    
    if (isComplete) {
      // Save to history
      return {
        currentQuiz: {
          ...state.currentQuiz,
          isComplete: true,
          completedAt: new Date().toISOString(),
        },
        quizHistory: [...state.quizHistory, {
          date: new Date().toISOString(),
          score: state.currentQuiz.score,
          total: state.currentQuiz.totalQuestions,
        }]
      };
    }
    
    return {
      currentQuiz: {
        ...state.currentQuiz,
        currentIndex: nextIndex,
      }
    };
  });
}
```

---

#### `endQuiz()`

End the current quiz session.

```typescript
endQuiz: () => {
  set({ currentQuiz: null });
}
```

---

### Streak Actions

#### `updateStreak()`

Update the user's daily streak.

```typescript
updateStreak: () => {
  const today = new Date().toISOString().split('T')[0];
  const { lastActiveDate, currentStreak, longestStreak } = get();
  
  if (lastActiveDate === today) return; // Already updated today
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let newStreak = currentStreak;
  
  if (lastActiveDate === yesterdayStr) {
    // Consecutive day
    newStreak = currentStreak + 1;
  } else if (lastActiveDate !== today) {
    // Streak broken
    newStreak = 1;
  }
  
  set({
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, longestStreak),
    lastActiveDate: today,
    weeklyActivity: updateWeeklyActivity(get().weeklyActivity),
  });
}
```

---

#### `checkAndUpdateStreak()`

Check streak on app open (called during initialization).

```typescript
checkAndUpdateStreak: () => {
  const { lastActiveDate, currentStreak } = get();
  const today = new Date().toISOString().split('T')[0];
  
  if (lastActiveDate) {
    const lastDate = new Date(lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays > 1) {
      // Streak broken - reset
      set({ currentStreak: 0 });
    }
  }
}
```

---

## Persistence

### Configuration

```typescript
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'wordwise-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
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
```

### What's Persisted

| State | Persisted | Reason |
|-------|-----------|--------|
| `userName` | ✅ | User preference |
| `hasCompletedOnboarding` | ✅ | App flow state |
| `currentStreak` | ✅ | Progress tracking |
| `bookmarkedWords` | ✅ | User data |
| `learnedWords` | ✅ | Progress tracking |
| `todayWord` | ✅ | Cache optimization |
| `quizHistory` | ✅ | Progress tracking |
| `isLoading` | ❌ | UI state |
| `currentQuiz` | ❌ | Transient session |
| `searchResults` | ❌ | Transient data |
| `fetchedWords` | ❌ | Re-fetchable |

### Storage Key

```
AsyncStorage key: "wordwise-storage"
```

### Storage Size Considerations

- Bookmarked words: ~1KB per word
- Quiz history: ~100 bytes per entry
- Total estimated: < 1MB for typical use

---

## Usage Patterns

### Selecting State (Performance)

```typescript
// ✅ Good - Select specific values
const todayWord = useAppStore(state => state.todayWord);

// ✅ Good - Select multiple related values
const { currentStreak, longestStreak } = useAppStore(
  state => ({ 
    currentStreak: state.currentStreak, 
    longestStreak: state.longestStreak 
  }),
  shallow // Use shallow comparison
);

// ⚠️ Avoid - Selecting entire store causes unnecessary re-renders
const store = useAppStore();
```

### Computed Values

```typescript
// Create a selector for computed values
const useProgress = () => useAppStore(state => ({
  percentage: Math.round((state.totalWordsLearned / 100) * 100),
  isComplete: state.totalWordsLearned >= 100,
}));

// Usage
const { percentage, isComplete } = useProgress();
```

### Async Actions Pattern

```typescript
// Actions that fetch data
const loadWord = useCallback(async () => {
  const { fetchWordDetails } = useAppStore.getState();
  setLoading(true);
  try {
    const word = await fetchWordDetails(wordId);
    setWord(word);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
}, [wordId]);
```

### Outside React Components

```typescript
// Access store outside React
const state = useAppStore.getState();
const { toggleBookmark } = useAppStore.getState();

// Subscribe to changes
const unsubscribe = useAppStore.subscribe(
  (state) => console.log('State changed:', state)
);
```

---

## Debugging

### Enable Logging

```typescript
// Add logging middleware
const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... store
      }),
      { name: 'wordwise-storage' }
    ),
    { name: 'WordWise' }
  )
);
```

### React DevTools

Zustand state appears in React DevTools under the component using `useAppStore`.

### Console Debugging

```typescript
// Log current state
console.log(useAppStore.getState());

// Log specific value
console.log(useAppStore.getState().todayWord);

// Subscribe to changes
useAppStore.subscribe(console.log);
```

### Clear Storage (Reset)

```typescript
// Clear all persisted data
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('wordwise-storage');
```

---

## Best Practices

1. **Select minimally**: Only subscribe to the state you need
2. **Use shallow comparison**: For object selections
3. **Keep actions atomic**: One action, one responsibility
4. **Don't nest deeply**: Flat state structure is easier to update
5. **Persist selectively**: Only persist what's necessary
6. **Handle loading states**: Track async operation status
7. **Type everything**: Full TypeScript coverage
