# WordWise - API Documentation

Detailed documentation for all API integrations and services used in the WordWise vocabulary app.

---

## Table of Contents

- [Overview](#overview)
- [Free Dictionary API](#free-dictionary-api)
- [Service Layer](#service-layer)
- [Error Handling](#error-handling)
- [Caching Strategy](#caching-strategy)
- [Rate Limiting](#rate-limiting)

---

## Overview

WordWise uses external APIs to fetch word definitions, pronunciations, and related data. The primary data source is the Free Dictionary API.

### API Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Native  │────▶│  Service Layer   │────▶│  Dictionary API │
│    Components   │     │  (dictionaryApi) │     │  (External)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                      │
         │                      ▼
         │              ┌──────────────────┐
         │              │   Zustand Store  │
         │              │   (Caching)      │
         └─────────────▶└──────────────────┘
```

---

## Free Dictionary API

### Base Information

| Property | Value |
|----------|-------|
| **Provider** | [dictionaryapi.dev](https://dictionaryapi.dev/) |
| **Base URL** | `https://api.dictionaryapi.dev/api/v2/entries/en` |
| **Authentication** | None required (public API) |
| **Rate Limit** | None specified (use responsibly) |
| **Format** | JSON |

### Endpoints

#### Get Word Definition

Retrieves complete information about a word including definitions, phonetics, and related words.

```
GET /api/v2/entries/en/{word}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `word` | string | Yes | The word to look up (URL encoded) |

**Example Request:**

```bash
curl https://api.dictionaryapi.dev/api/v2/entries/en/serendipity
```

**Success Response (200 OK):**

```json
[
  {
    "word": "serendipity",
    "phonetic": "/ˌsɛɹ.ənˈdɪp.ɪ.ti/",
    "phonetics": [
      {
        "text": "/ˌsɛɹ.ənˈdɪp.ɪ.ti/",
        "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/serendipity-us.mp3",
        "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=..."
      }
    ],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "An unsought, unintended, and/or unexpected, but fortunate, discovery and/or learning experience that happens by accident.",
            "example": "Unfortunately, the pace of discovery in science is often dependent on serendipity.",
            "synonyms": ["chance", "luck", "fortuity"],
            "antonyms": ["misfortune"]
          }
        ],
        "synonyms": ["chance", "fluke", "fortune"],
        "antonyms": []
      }
    ],
    "license": {
      "name": "CC BY-SA 3.0",
      "url": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "sourceUrls": ["https://en.wiktionary.org/wiki/serendipity"]
  }
]
```

**Error Response (404 Not Found):**

```json
{
  "title": "No Definitions Found",
  "message": "Sorry pal, we couldn't find definitions for the word you were looking for.",
  "resolution": "You can try the search again at later time or head to the web instead."
}
```

### Response Schema

#### DictionaryAPIResponse

```typescript
interface DictionaryAPIResponse {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license?: License;
  sourceUrls?: string[];
}

interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface License {
  name: string;
  url: string;
}
```

---

## Service Layer

### File Location

`src/services/dictionaryApi.ts`

### Functions

#### fetchWordFromAPI

Low-level function to fetch raw data from the API.

```typescript
async function fetchWordFromAPI(word: string): Promise<DictionaryAPIResponse[] | null>
```

**Parameters:**
- `word` (string): The word to fetch

**Returns:**
- `DictionaryAPIResponse[]`: Array of word entries (some words have multiple entries)
- `null`: If word not found or error occurred

**Example:**
```typescript
const rawData = await fetchWordFromAPI('eloquent');
if (rawData) {
  console.log(rawData[0].meanings);
}
```

---

#### transformAPIResponse

Converts raw API response to the app's Word model.

```typescript
function transformAPIResponse(
  apiResponse: DictionaryAPIResponse,
  category?: WordCategory,
  difficulty?: 'easy' | 'medium' | 'hard'
): Word
```

**Parameters:**
- `apiResponse` (DictionaryAPIResponse): Raw API response
- `category` (WordCategory, optional): Word category (default: 'everyday')
- `difficulty` ('easy' | 'medium' | 'hard', optional): Difficulty level (default: 'medium')

**Returns:**
- `Word`: Transformed word object

**Transformation Logic:**

1. **ID Generation**: Combines word + timestamp for uniqueness
2. **Phonetic Selection**: Prioritizes `phonetic` field, falls back to `phonetics` array
3. **Audio URL**: Finds first phonetic entry with audio
4. **Synonyms/Antonyms**: Aggregates from all meanings and definitions (max 5 each)
5. **Definition**: Uses first definition from first meaning
6. **Example**: Uses first available example sentence

---

#### getWord

High-level function to fetch and transform a single word.

```typescript
async function getWord(
  word: string,
  category?: WordCategory,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Word | null>
```

**Parameters:**
- `word` (string): Word to fetch
- `category` (WordCategory, optional): Category to assign
- `difficulty` ('easy' | 'medium' | 'hard', optional): Difficulty to assign

**Returns:**
- `Word | null`: Transformed word or null if not found

**Example:**
```typescript
const word = await getWord('algorithm', 'technology', 'medium');

if (word) {
  console.log(word.definition);
  console.log(word.audioUrl);
}
```

---

#### getWords

Fetch multiple words in parallel.

```typescript
async function getWords(
  words: Array<{
    word: string;
    category?: WordCategory;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>
): Promise<Word[]>
```

**Parameters:**
- `words`: Array of word objects with optional category and difficulty

**Returns:**
- `Word[]`: Array of successfully fetched words (failed fetches are excluded)

**Example:**
```typescript
const words = await getWords([
  { word: 'serendipity', category: 'everyday', difficulty: 'medium' },
  { word: 'algorithm', category: 'technology', difficulty: 'medium' },
  { word: 'paradigm', category: 'business', difficulty: 'hard' }
]);

console.log(`Fetched ${words.length} words`);
```

**Notes:**
- Uses `Promise.allSettled` for fault tolerance
- Failed requests don't block other words
- Order of returned words may differ from input

---

#### searchWords

Client-side search through a word list.

```typescript
function searchWords(query: string, wordList: Word[]): Word[]
```

**Parameters:**
- `query` (string): Search query
- `wordList` (Word[]): Array of words to search through

**Returns:**
- `Word[]`: Matching words

**Search Logic:**
- Case-insensitive matching
- Searches in: word name, definition, synonyms
- Returns empty array for empty query

**Example:**
```typescript
const results = searchWords('chance', bookmarkedWords);
// Returns words with "chance" in name, definition, or synonyms
```

---

## Error Handling

### API Errors

| Status Code | Meaning | Handling |
|-------------|---------|----------|
| 200 | Success | Return data |
| 404 | Word not found | Return `null`, log warning |
| 429 | Rate limited | Retry with backoff (not implemented) |
| 500+ | Server error | Return `null`, log error |

### Error Handling Pattern

```typescript
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      console.log(`Word not found: ${word}`);
      return null;
    }
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error fetching word:', error);
  return null;
}
```

### Fallback Data

When API fails, the app uses curated word data:

```typescript
// In appStore.ts
const fallbackWord: Word = {
  id: 'fallback',
  word: curatedEntry.word,
  definition: 'Unable to load definition. Please check your connection.',
  // ... minimal data
};
```

---

## Caching Strategy

### Current Implementation

1. **Store Caching**: Fetched words are stored in Zustand state
2. **Persistence**: AsyncStorage persists word data across sessions
3. **Word of the Day**: Cached with date stamp to prevent re-fetching

### Cache Keys

| Key | Purpose | TTL |
|-----|---------|-----|
| `todayWord` | Word of the Day | Until midnight |
| `todayWordDate` | Date validation | Until midnight |
| `fetchedWords` | Previously fetched words | Indefinite |
| `bookmarkedWords` | Saved bookmarks | Indefinite |

### Cache Logic Example

```typescript
// Check if we already have today's word
const today = new Date().toISOString().split('T')[0];

if (todayWordDate === today && todayWord) {
  return; // Use cached word
}

// Fetch new word
const word = await getWord(wordForToday);
set({ todayWord: word, todayWordDate: today });
```

---

## Rate Limiting

### Current Approach

- No explicit rate limiting implemented
- API requests are minimized through caching
- Batch requests use `Promise.allSettled` (parallel but fault-tolerant)

### Best Practices

1. **Debounce Search**: 300ms delay on user input
2. **Batch Requests**: Fetch multiple words once, not repeatedly
3. **Cache First**: Check store before API request
4. **Lazy Loading**: Load category words on demand

### Debounced Search Example

```typescript
// In discover.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (localQuery.trim()) {
      searchForWords(localQuery);
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, [localQuery]);
```

---

## Testing API Calls

### Manual Testing

```bash
# Test word lookup
curl https://api.dictionaryapi.dev/api/v2/entries/en/serendipity | json_pp

# Test non-existent word
curl https://api.dictionaryapi.dev/api/v2/entries/en/asdfghjkl
```

### In-App Testing

```typescript
// Debug logging in service
export async function getWord(word: string): Promise<Word | null> {
  console.log(`[API] Fetching: ${word}`);
  const start = Date.now();
  
  const result = await fetchWordFromAPI(word);
  
  console.log(`[API] Fetched in ${Date.now() - start}ms`);
  return result ? transformAPIResponse(result[0]) : null;
}
```

---

## API Alternatives

If Free Dictionary API becomes unavailable, consider these alternatives:

| API | Auth | Features | Notes |
|-----|------|----------|-------|
| [Wordnik](https://www.wordnik.com/developers) | API Key | Definitions, examples, audio | Free tier available |
| [Merriam-Webster](https://dictionaryapi.com/) | API Key | Comprehensive definitions | Free for education |
| [Oxford](https://developer.oxforddictionaries.com/) | API Key | Premium definitions | Paid plans only |
| [Datamuse](https://www.datamuse.com/api/) | None | Related words, rhymes | No definitions |

---

## Changelog

### v1.0.0 (Current)
- ✅ Basic word fetching
- ✅ Phonetic/audio extraction
- ✅ Synonym/antonym aggregation
- ✅ Batch word fetching
- ✅ Client-side search

### Planned
- [ ] Response caching with TTL
- [ ] Offline word database
- [ ] Rate limit handling
- [ ] Request retry logic
