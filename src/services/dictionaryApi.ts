/**
 * Dictionary API Service
 * Uses Free Dictionary API (https://dictionaryapi.dev/)
 */

import { Word, DictionaryAPIResponse, WordCategory } from '../types';

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Fetch word details from the dictionary API
 */
export async function fetchWordFromAPI(word: string): Promise<DictionaryAPIResponse[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word.toLowerCase())}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Word not found: ${word}`);
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: DictionaryAPIResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching word:', error);
    return null;
  }
}

/**
 * Transform API response to our Word model
 */
export function transformAPIResponse(
  apiResponse: DictionaryAPIResponse,
  category: WordCategory = 'everyday',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Word {
  // Get the first meaning
  const primaryMeaning = apiResponse.meanings[0];
  const primaryDefinition = primaryMeaning?.definitions[0];
  
  // Get phonetic text (try multiple sources)
  const phonetic = apiResponse.phonetic || 
    apiResponse.phonetics.find(p => p.text)?.text || 
    '';
  
  // Get audio URL (prefer .mp3)
  const audioUrl = apiResponse.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;
  
  // Collect synonyms from all definitions
  const synonyms: string[] = [];
  const antonyms: string[] = [];
  
  apiResponse.meanings.forEach(meaning => {
    synonyms.push(...meaning.synonyms);
    antonyms.push(...meaning.antonyms);
    meaning.definitions.forEach(def => {
      synonyms.push(...def.synonyms);
      antonyms.push(...def.antonyms);
    });
  });
  
  return {
    id: `${apiResponse.word}-${Date.now()}`,
    word: apiResponse.word,
    partOfSpeech: primaryMeaning?.partOfSpeech || 'noun',
    pronunciation: phonetic,
    audioUrl: audioUrl,
    definition: primaryDefinition?.definition || 'No definition available',
    example: primaryDefinition?.example,
    synonyms: [...new Set(synonyms)].slice(0, 5), // Unique, max 5
    antonyms: [...new Set(antonyms)].slice(0, 5),
    category,
    difficulty,
    dateAdded: new Date().toISOString(),
    isBookmarked: false,
    isLearned: false,
  };
}

/**
 * Fetch and transform a word
 */
export async function getWord(
  word: string,
  category?: WordCategory,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Word | null> {
  const apiResponse = await fetchWordFromAPI(word);
  
  if (!apiResponse || apiResponse.length === 0) {
    return null;
  }
  
  return transformAPIResponse(apiResponse[0], category, difficulty);
}

/**
 * Fetch multiple words at once
 */
export async function getWords(
  words: { word: string; category?: WordCategory; difficulty?: 'easy' | 'medium' | 'hard' }[]
): Promise<Word[]> {
  const results = await Promise.allSettled(
    words.map(({ word, category, difficulty }) => getWord(word, category, difficulty))
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<Word | null> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value as Word);
}

/**
 * Search for words (simple client-side search from a word list)
 */
export function searchWords(query: string, wordList: Word[]): Word[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return [];
  
  return wordList.filter(word => 
    word.word.toLowerCase().includes(lowerQuery) ||
    word.definition.toLowerCase().includes(lowerQuery) ||
    word.synonyms.some(s => s.toLowerCase().includes(lowerQuery))
  );
}
