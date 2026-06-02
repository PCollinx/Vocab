# WordWise - Vocabulary Learning App

A React Native vocabulary learning application built with Expo that helps users expand their vocabulary through daily words, quizzes, and progress tracking.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [API Reference](#api-reference)
- [State Management](#state-management)
- [Design System](#design-system)
- [Components](#components)
- [Screens](#screens)
- [Data Models](#data-models)

---

## Overview

WordWise is a mobile vocabulary learning app designed for users who want to improve their English vocabulary. The app provides:

- **Daily Word of the Day** - Learn a new word every day
- **Vocabulary Quiz** - Test your knowledge with multiple-choice questions
- **Word Categories** - Browse words by topic (Business, Science, Literature, etc.)
- **Bookmarks** - Save words for later review
- **Progress Tracking** - Track streaks and learning progress
- **Audio Pronunciation** - Listen to word pronunciations

---

## Tech Stack

| Technology             | Version  | Purpose                            |
| ---------------------- | -------- | ---------------------------------- |
| **React Native**       | 0.81.5   | Cross-platform mobile framework    |
| **Expo**               | ~54.0.33 | Development platform & build tools |
| **TypeScript**         | ~5.9.2   | Type safety                        |
| **expo-router**        | ~6.0.23  | File-based navigation              |
| **zustand**            | ^5.0.12  | State management                   |
| **AsyncStorage**       | 2.2.0    | Persistent local storage           |
| **expo-audio**         | ~1.1.1   | Audio playback for pronunciations  |
| **@expo/vector-icons** | ^15.0.3  | Icon library (Ionicons)            |

### Key Dependencies

```json
{
  "expo": "~54.0.33",
  "expo-router": "~6.0.23",
  "expo-audio": "~1.1.1",
  "zustand": "^5.0.12",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@expo/vector-icons": "^15.0.3",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0"
}
```

---

## Project Structure

```
vocab/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx           # Tab navigator configuration
│   │   ├── index.tsx             # Home screen (Word of the Day)
│   │   ├── discover.tsx          # Discover/Search screen
│   │   ├── progress.tsx          # Progress & stats screen
│   │   └── profile.tsx           # User profile screen
│   ├── category/
│   │   └── [category].tsx        # Dynamic category detail screen
│   ├── word/
│   │   └── [id].tsx              # Dynamic word detail screen
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Entry point (redirect)
│   ├── onboarding.tsx            # Onboarding flow
│   └── quiz.tsx                  # Quiz screen
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── IconButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Text.tsx
│   │   └── index.ts
│   │
│   ├── constants/                # Design tokens & constants
│   │   ├── colors.ts             # Color system (Sky & Coral)
│   │   ├── typography.ts         # Font styles
│   │   ├── spacing.ts            # Spacing scale
│   │   └── index.ts
│   │
│   ├── data/                     # Static data
│   │   ├── wordList.ts           # Curated vocabulary words (100+)
│   │   └── index.ts
│   │
│   ├── services/                 # API services
│   │   ├── dictionaryApi.ts      # Dictionary API integration
│   │   └── index.ts
│   │
│   ├── store/                    # State management
│   │   └── appStore.ts           # Zustand store
│   │
│   ├── types/                    # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── navigation/               # Navigation utilities
│   ├── screens/                  # (Legacy) Screen components
│   └── utils/                    # Helper functions
│
├── assets/                       # Images, fonts, etc.
├── designs/                      # Design files
├── app.json                      # Expo configuration
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vocab

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

---

## Features

### 1. Word of the Day

- Displays a new vocabulary word each day
- Shows definition, pronunciation, examples, synonyms, and antonyms
- Audio pronunciation playback
- Mark as learned / bookmark functionality

### 2. Discover & Search

- Browse words by 8 categories
- Real-time search with API integration
- View bookmarked words
- Featured word suggestions

### 3. Quiz System

- Multiple-choice vocabulary questions
- Synonym matching questions
- Progress tracking during quiz
- Score display with percentage
- Quiz history tracking

### 4. Word Categories

- **Business** - Professional terminology
- **Science** - Scientific vocabulary
- **Literature** - Literary terms
- **Technology** - Tech-related words
- **Arts** - Artistic terminology
- **History** - Historical vocabulary
- **Everyday** - Common useful words
- **Academic** - Scholarly terms

### 5. Progress Tracking

- Daily learning streaks
- Weekly activity visualization
- Total words learned counter
- Mastery level tracking

### 6. Bookmarks

- Save favorite words
- Quick access from Discover screen
- Persistent storage

---

## API Reference

### Free Dictionary API

The app uses the [Free Dictionary API](https://dictionaryapi.dev/) to fetch word definitions.

**Base URL:** `https://api.dictionaryapi.dev/api/v2/entries/en`

**Endpoint:** `GET /{word}`

#### Request Example

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/serendipity
```

#### Response Structure

```typescript
interface DictionaryAPIResponse {
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
```

### API Service Functions

Location: `src/services/dictionaryApi.ts`

| Function                                                 | Description                       | Parameters                         | Returns                           |
| -------------------------------------------------------- | --------------------------------- | ---------------------------------- | --------------------------------- |
| `fetchWordFromAPI(word)`                                 | Raw API fetch                     | `word: string`                     | `DictionaryAPIResponse[] \| null` |
| `transformAPIResponse(response, category?, difficulty?)` | Transform API data to Word model  | See types                          | `Word`                            |
| `getWord(word, category?, difficulty?)`                  | Fetch and transform a single word | See types                          | `Word \| null`                    |
| `getWords(words)`                                        | Fetch multiple words in parallel  | `{word, category?, difficulty?}[]` | `Word[]`                          |
| `searchWords(query, wordList)`                           | Client-side search                | `query: string, wordList: Word[]`  | `Word[]`                          |

#### Usage Example

```typescript
import { getWord, getWords } from "../services/dictionaryApi";

// Fetch a single word
const word = await getWord("serendipity", "everyday", "medium");

// Fetch multiple words
const words = await getWords([
  { word: "eloquent", category: "literature" },
  { word: "algorithm", category: "technology", difficulty: "medium" },
]);
```

---

## State Management

The app uses **Zustand** with **AsyncStorage** persistence for global state management.

### Store Location

`src/store/appStore.ts`

### State Structure

```typescript
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
}
```

### Available Actions

| Action                                 | Description                         |
| -------------------------------------- | ----------------------------------- |
| `loadUserData()`                       | Initialize user data from storage   |
| `setUserName(name)`                    | Set the user's display name         |
| `completeOnboarding()`                 | Mark onboarding as complete         |
| `resetOnboarding()`                    | Reset to show onboarding again      |
| `fetchTodayWord()`                     | Fetch the word of the day           |
| `markTodayWordComplete()`              | Mark today's word as learned        |
| `fetchWordDetails(word)`               | Get full details for a word         |
| `fetchCategoryWords(category, count?)` | Get words from a category           |
| `markWordLearned(wordId)`              | Mark a word as learned              |
| `toggleBookmark(word)`                 | Add/remove word from bookmarks      |
| `isWordBookmarked(wordId)`             | Check if word is bookmarked         |
| `searchForWords(query)`                | Search for words via API            |
| `clearSearch()`                        | Clear search results                |
| `startQuiz(words?)`                    | Start a new quiz session            |
| `answerQuestion(answer)`               | Submit an answer                    |
| `nextQuestion()`                       | Move to next question               |
| `endQuiz()`                            | End the current quiz                |
| `updateStreak()`                       | Update daily streak                 |
| `checkAndUpdateStreak()`               | Check and update streak on app open |

### Usage Example

```typescript
import { useAppStore } from '../store/appStore';

function MyComponent() {
  const {
    todayWord,
    isLoadingTodayWord,
    fetchTodayWord,
    toggleBookmark
  } = useAppStore();

  useEffect(() => {
    fetchTodayWord();
  }, []);

  return (
    // ... component JSX
  );
}
```

---

## Design System

### Color System: Sky & Coral

The app uses a custom "Sky & Coral" color palette designed for a premium, friendly feel.

#### Primary Colors (Sky Blue)

| Token          | Hex     | Usage                        |
| -------------- | ------- | ---------------------------- |
| `primary`      | #378ADD | Buttons, CTAs, active states |
| `primaryLight` | #E6F1FB | Light backgrounds            |
| `primaryDark`  | #185FA5 | Pressed states               |

#### Accent Colors (Coral)

| Token         | Hex     | Usage                    |
| ------------- | ------- | ------------------------ |
| `accent`      | #D85A30 | Highlights, warm moments |
| `accentLight` | #FAECE7 | Light backgrounds        |

#### Semantic Colors

| Token     | Hex     | Usage                     |
| --------- | ------- | ------------------------- |
| `correct` | #639922 | Correct answers, mastered |
| `wrong`   | #D85A30 | Wrong answers             |
| `streak`  | #EF9F27 | Streaks, rewards          |

#### Neutral Colors

| Token         | Hex     | Usage             |
| ------------- | ------- | ----------------- |
| `background`  | #F1EFE8 | App background    |
| `surface`     | #FFFFFF | Cards, containers |
| `textHeading` | #2C2C2A | Headings          |
| `textBody`    | #5F5E5A | Body text         |
| `textMuted`   | #888780 | Secondary text    |
| `border`      | #D3D1C7 | Borders           |

### Typography Scale

```typescript
const textStyles = {
  h1: { fontSize: 32, fontWeight: "700", lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: "600", lineHeight: 28 },
  bodyLarge: { fontSize: 18, fontWeight: "400", lineHeight: 28 },
  body: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
  label: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
};
```

### Spacing Scale

```typescript
const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
};
```

---

## Components

### Text

Typography component with preset variants and colors.

```tsx
import { Text } from '../components';

<Text variant="h1" color="heading">Title</Text>
<Text variant="body" color="muted">Description</Text>
```

**Props:**

- `variant`: 'h1' | 'h2' | 'h3' | 'bodyLarge' | 'body' | 'bodySmall' | 'caption' | 'label'
- `color`: 'heading' | 'body' | 'muted' | 'hint' | 'primary' | 'accent' | 'correct' | 'wrong' | 'white'
- `center`: boolean

### Button

Configurable button component.

```tsx
import { Button } from '../components';

<Button title="Get Started" onPress={handlePress} variant="primary" />
<Button title="Cancel" onPress={handleCancel} variant="outline" />
```

**Props:**

- `title`: string
- `onPress`: () => void
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `disabled`: boolean

### Card

Container component with elevation.

```tsx
import { Card } from "../components";

<Card variant="elevated" padding="lg">
  <Text>Card content</Text>
</Card>;
```

**Props:**

- `variant`: 'default' | 'elevated' | 'filled'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `children`: ReactNode

### Badge

Small label/tag component.

```tsx
import { Badge } from '../components';

<Badge label="noun" variant="primary" />
<Badge label="Easy" variant="correct" />
```

**Props:**

- `label`: string
- `variant`: 'primary' | 'accent' | 'correct' | 'streak' | 'muted'

### Container

Screen container with safe area handling.

```tsx
import { Container } from "../components";

<Container backgroundColor={colors.primary} statusBarStyle="light-content">
  {/* Screen content */}
</Container>;
```

### ProgressBar

Progress indicator component.

```tsx
import { ProgressBar } from "../components";

<ProgressBar progress={0.75} color={colors.primary} />;
```

---

## Screens

### Tab Screens

| Screen       | File                      | Description                    |
| ------------ | ------------------------- | ------------------------------ |
| **Home**     | `app/(tabs)/index.tsx`    | Word of the Day, quick actions |
| **Discover** | `app/(tabs)/discover.tsx` | Search, categories, bookmarks  |
| **Progress** | `app/(tabs)/progress.tsx` | Stats, streak, activity        |
| **Profile**  | `app/(tabs)/profile.tsx`  | User settings                  |

### Stack Screens

| Screen          | File                          | Description           |
| --------------- | ----------------------------- | --------------------- |
| **Onboarding**  | `app/onboarding.tsx`          | First-time user flow  |
| **Quiz**        | `app/quiz.tsx`                | Vocabulary quiz       |
| **Word Detail** | `app/word/[id].tsx`           | Full word information |
| **Category**    | `app/category/[category].tsx` | Words by category     |

---

## Data Models

### Word

```typescript
interface Word {
  id: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  audioUrl?: string;
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: "easy" | "medium" | "hard";
  category: WordCategory;
  isBookmarked?: boolean;
  isLearned?: boolean;
  dateAdded?: string;
  lastReviewed?: string;
}
```

### WordCategory

```typescript
type WordCategory =
  | "business"
  | "science"
  | "literature"
  | "technology"
  | "arts"
  | "history"
  | "everyday"
  | "academic";
```

### WordProgress

```typescript
interface WordProgress {
  wordId: string;
  learned: boolean;
  masteryLevel: number; // 0-5
  lastReviewed: string;
  timesReviewed: number;
  timesCorrect: number;
}
```

### QuizQuestion

```typescript
interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "fill-blank" | "match-synonym";
  word: Word;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}
```

### QuizSession

```typescript
interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string;
  isComplete: boolean;
}
```

---

## Curated Word List

The app includes a curated list of 100+ vocabulary words organized by category and difficulty.

Location: `src/data/wordList.ts`

### Categories & Word Counts

| Category       | Description           | Difficulty Distribution     |
| -------------- | --------------------- | --------------------------- |
| **Everyday**   | Common useful words   | Easy: 10, Medium: 5         |
| **Business**   | Professional terms    | Easy: 5, Medium: 5, Hard: 3 |
| **Science**    | Scientific vocabulary | Easy: 4, Medium: 6, Hard: 3 |
| **Literature** | Literary terms        | Easy: 4, Medium: 6, Hard: 3 |
| **Technology** | Tech terminology      | Easy: 3, Medium: 6, Hard: 3 |
| **Arts**       | Artistic vocabulary   | Easy: 3, Medium: 4, Hard: 2 |
| **History**    | Historical terms      | Easy: 3, Medium: 4, Hard: 2 |
| **Academic**   | Scholarly words       | Easy: 3, Medium: 5, Hard: 3 |

### Utility Functions

```typescript
// Get words by category
const businessWords = getWordsByCategory("business");

// Get word for a specific date (deterministic)
const todayWord = getWordForDate(new Date());

// Get random words for quiz
const quizWords = getRandomWords(10);

// Category metadata
const categoryInfo = CATEGORY_INFO["business"];
// { name: 'Business', icon: 'briefcase-outline', color: '#378ADD' }
```

---

## Navigation

The app uses **expo-router** for file-based routing.

### Route Structure

```
/                     → Redirect to /onboarding or /(tabs)
/onboarding          → Onboarding flow
/(tabs)              → Tab navigator
  /                  → Home (Word of the Day)
  /discover          → Discover & Search
  /progress          → Progress stats
  /profile           → User profile
/quiz                → Quiz screen
/word/[id]           → Word detail (dynamic route)
/category/[category] → Category words (dynamic route)
```

### Navigation Examples

```typescript
import { useRouter } from "expo-router";

const router = useRouter();

// Navigate to a screen
router.push("/quiz");

// Navigate with params
router.push(`/word/${wordId}`);
router.push(`/category/${categoryName}`);

// Go back
router.back();

// Replace current screen
router.replace("/(tabs)");
```

---

## Future Enhancements (Phase 4+)

- [ ] **Push Notifications** - Daily word reminders (expo-notifications)
- [ ] **Text-to-Speech** - Pronunciation via device TTS (expo-speech)
- [ ] **Animations** - Smooth transitions (react-native-reanimated)
- [ ] **Dark Mode** - System theme support
- [ ] **Offline Mode** - Cache words for offline access
- [ ] **Spaced Repetition** - Smart review scheduling
- [ ] **Social Features** - Share progress, compete with friends
- [ ] **Custom Word Lists** - User-created collections

---

## License

This project is for educational purposes.

---

## Credits

- **Dictionary API**: [Free Dictionary API](https://dictionaryapi.dev/)
- **Icons**: [Ionicons](https://ionic.io/ionicons) via @expo/vector-icons
- **Design System**: Custom "Sky & Coral" palette

## conig setup

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyAEWkwInvhE5xkgF4ZTqKxWWGlaHsTW-TE",
authDomain: "wordwise-695a3.firebaseapp.com",
projectId: "wordwise-695a3",
storageBucket: "wordwise-695a3.firebasestorage.app",
messagingSenderId: "549372255118",
appId: "1:549372255118:web:251b7fc0362f0bf11fa2df",
measurementId: "G-0JWZ19D907"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
