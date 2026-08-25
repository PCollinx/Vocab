/**
 * Dictionary API Service
 * Uses Free Dictionary API (https://dictionaryapi.dev/)
 * Provides definitions, all meanings, pronunciation (text + audio), and examples.
 */

import { Word, WordMeaning, DictionaryAPIResponse, WordCategory } from '../types';
import { getFallbackWord } from '../data/fallbackWords';

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// In-memory cache — prevents re-fetching the same word within a session
const wordCache = new Map<string, Word>();

/**
 * Fetch raw API response for a word
 */
async function fetchWordFromAPI(
  word: string,
  attempt = 0,
): Promise<DictionaryAPIResponse[] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/${encodeURIComponent(word.toLowerCase())}`,
      { headers: { Accept: 'application/json' }, signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) return null;
      // Retry server errors (5xx) up to 2 more times with back-off
      if (response.status >= 500 && attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        return fetchWordFromAPI(word, attempt + 1);
      }
      return null;
    }

    return await response.json() as DictionaryAPIResponse[];
  } catch (error) {
    clearTimeout(timeoutId);
    if (__DEV__) console.error(`[Dictionary] fetch failed for "${word}":`, error);
    return null;
  }
}

/**
 * Resolve the best phonetic text from all phonetics entries
 */
function resolvePhonetic(apiResponse: DictionaryAPIResponse): string {
  if (apiResponse.phonetic) return apiResponse.phonetic;
  const withText = apiResponse.phonetics.find(p => p.text && p.text.trim());
  return withText?.text ?? '';
}

/**
 * Resolve the best audio URL (prefer .mp3, then any)
 */
function resolveAudio(apiResponse: DictionaryAPIResponse): string | undefined {
  const mp3 = apiResponse.phonetics.find(p => p.audio?.endsWith('.mp3'));
  if (mp3?.audio) return mp3.audio;
  const any = apiResponse.phonetics.find(p => p.audio && p.audio.trim());
  return any?.audio;
}

/**
 * Transform a raw API response into our Word model
 * Extracts ALL meanings so the detail screen can show the full picture.
 */
export function transformAPIResponse(
  apiResponse: DictionaryAPIResponse,
  category: WordCategory = 'everyday',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Word {
  const primaryMeaning = apiResponse.meanings[0];
  const primaryDefinition = primaryMeaning?.definitions[0];

  // Build the full meanings list
  const meanings: WordMeaning[] = apiResponse.meanings.map(m => ({
    partOfSpeech: m.partOfSpeech,
    definitions: m.definitions.map(d => ({
      definition: d.definition,
      example: d.example,
    })),
    synonyms: m.synonyms ?? [],
    antonyms: m.antonyms ?? [],
  }));

  // Flatten synonyms/antonyms from every meaning and definition
  const synonyms: string[] = [];
  const antonyms: string[] = [];
  apiResponse.meanings.forEach(m => {
    synonyms.push(...(m.synonyms ?? []));
    antonyms.push(...(m.antonyms ?? []));
    m.definitions.forEach(d => {
      synonyms.push(...(d.synonyms ?? []));
      antonyms.push(...(d.antonyms ?? []));
    });
  });

  return {
    id: `${apiResponse.word}-${category}`,
    word: apiResponse.word,
    partOfSpeech: primaryMeaning?.partOfSpeech ?? 'noun',
    pronunciation: resolvePhonetic(apiResponse),
    audioUrl: resolveAudio(apiResponse),
    definition: primaryDefinition?.definition ?? 'No definition available',
    example: primaryDefinition?.example,
    synonyms: [...new Set(synonyms)].slice(0, 8),
    antonyms: [...new Set(antonyms)].slice(0, 8),
    meanings,
    category,
    difficulty,
    dateAdded: new Date().toISOString(),
    isBookmarked: false,
    isLearned: false,
  };
}

/**
 * Fetch and return a fully enriched Word.
 * Results are cached in memory for the session lifetime.
 */
export async function getWord(
  word: string,
  category?: WordCategory,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Word | null> {
  const cacheKey = word.toLowerCase();

  if (wordCache.has(cacheKey)) {
    const cached = wordCache.get(cacheKey)!;
    // Apply caller-supplied category/difficulty if provided
    return {
      ...cached,
      ...(category && { category }),
      ...(difficulty && { difficulty }),
    };
  }

  const apiResponse = await fetchWordFromAPI(word);
  if (!apiResponse || apiResponse.length === 0) {
    return getFallbackWord(word, category, difficulty);
  }

  const result = transformAPIResponse(apiResponse[0], category, difficulty);
  wordCache.set(cacheKey, result);
  return result;
}

/**
 * Fetch multiple words one at a time.
 * iOS New Architecture (Expo SDK 57) cancels fetches when concurrent requests
 * pile up against the same host — sequential is the safe path.
 * Failed / missing words are silently skipped.
 */
export async function getWords(
  words: { word: string; category?: WordCategory; difficulty?: 'easy' | 'medium' | 'hard' }[]
): Promise<Word[]> {
  const results: Word[] = [];
  for (const { word, category, difficulty } of words) {
    const result = await getWord(word, category, difficulty);
    if (result) results.push(result);
  }
  return results;
}

/**
 * Client-side search across a word list (searches word, definition, synonyms)
 */
export function searchWords(query: string, wordList: Word[], limit = 20): Word[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: Word[] = [];
  for (const w of wordList) {
    if (
      w.word.toLowerCase().includes(q) ||
      w.definition.toLowerCase().includes(q) ||
      w.synonyms.some(s => s.toLowerCase().includes(q))
    ) {
      results.push(w);
      if (results.length === limit) break;
    }
  }
  return results;
}

/**
 * Clear the in-memory word cache (useful for testing / memory pressure)
 */
export function clearWordCache(): void {
  wordCache.clear();
}
