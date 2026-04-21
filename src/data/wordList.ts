/**
 * Curated Word List
 * A collection of interesting vocabulary words for daily learning
 */

import { WordCategory } from '../types';

interface WordEntry {
  word: string;
  category: WordCategory;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Curated list of vocabulary words organized by category
 */
export const CURATED_WORDS: WordEntry[] = [
  // === EVERYDAY (Easy to Medium) ===
  { word: 'serendipity', category: 'everyday', difficulty: 'medium' },
  { word: 'ephemeral', category: 'everyday', difficulty: 'medium' },
  { word: 'eloquent', category: 'everyday', difficulty: 'medium' },
  { word: 'resilient', category: 'everyday', difficulty: 'easy' },
  { word: 'meticulous', category: 'everyday', difficulty: 'medium' },
  { word: 'pragmatic', category: 'everyday', difficulty: 'medium' },
  { word: 'empathy', category: 'everyday', difficulty: 'easy' },
  { word: 'perseverance', category: 'everyday', difficulty: 'easy' },
  { word: 'ambiguous', category: 'everyday', difficulty: 'medium' },
  { word: 'candid', category: 'everyday', difficulty: 'easy' },
  { word: 'diligent', category: 'everyday', difficulty: 'easy' },
  { word: 'mundane', category: 'everyday', difficulty: 'easy' },
  { word: 'nostalgic', category: 'everyday', difficulty: 'easy' },
  { word: 'spontaneous', category: 'everyday', difficulty: 'easy' },
  { word: 'versatile', category: 'everyday', difficulty: 'easy' },
  
  // === BUSINESS ===
  { word: 'synergy', category: 'business', difficulty: 'medium' },
  { word: 'leverage', category: 'business', difficulty: 'easy' },
  { word: 'paradigm', category: 'business', difficulty: 'medium' },
  { word: 'scalable', category: 'business', difficulty: 'easy' },
  { word: 'benchmark', category: 'business', difficulty: 'easy' },
  { word: 'stakeholder', category: 'business', difficulty: 'easy' },
  { word: 'streamline', category: 'business', difficulty: 'easy' },
  { word: 'innovative', category: 'business', difficulty: 'easy' },
  { word: 'entrepreneur', category: 'business', difficulty: 'medium' },
  { word: 'acquisition', category: 'business', difficulty: 'medium' },
  { word: 'diversify', category: 'business', difficulty: 'medium' },
  { word: 'arbitrage', category: 'business', difficulty: 'hard' },
  { word: 'fiduciary', category: 'business', difficulty: 'hard' },
  
  // === SCIENCE ===
  { word: 'hypothesis', category: 'science', difficulty: 'easy' },
  { word: 'phenomenon', category: 'science', difficulty: 'medium' },
  { word: 'catalyst', category: 'science', difficulty: 'medium' },
  { word: 'entropy', category: 'science', difficulty: 'hard' },
  { word: 'empirical', category: 'science', difficulty: 'medium' },
  { word: 'synthesis', category: 'science', difficulty: 'medium' },
  { word: 'anomaly', category: 'science', difficulty: 'medium' },
  { word: 'equilibrium', category: 'science', difficulty: 'medium' },
  { word: 'osmosis', category: 'science', difficulty: 'medium' },
  { word: 'photosynthesis', category: 'science', difficulty: 'easy' },
  { word: 'biodiversity', category: 'science', difficulty: 'easy' },
  { word: 'quantum', category: 'science', difficulty: 'hard' },
  { word: 'mutation', category: 'science', difficulty: 'easy' },
  
  // === LITERATURE ===
  { word: 'metaphor', category: 'literature', difficulty: 'easy' },
  { word: 'allegory', category: 'literature', difficulty: 'medium' },
  { word: 'irony', category: 'literature', difficulty: 'easy' },
  { word: 'protagonist', category: 'literature', difficulty: 'easy' },
  { word: 'narrative', category: 'literature', difficulty: 'easy' },
  { word: 'hyperbole', category: 'literature', difficulty: 'medium' },
  { word: 'juxtaposition', category: 'literature', difficulty: 'hard' },
  { word: 'symbolism', category: 'literature', difficulty: 'medium' },
  { word: 'mellifluous', category: 'literature', difficulty: 'hard' },
  { word: 'eloquence', category: 'literature', difficulty: 'medium' },
  { word: 'verbose', category: 'literature', difficulty: 'medium' },
  { word: 'euphemism', category: 'literature', difficulty: 'medium' },
  { word: 'paradox', category: 'literature', difficulty: 'medium' },
  
  // === TECHNOLOGY ===
  { word: 'algorithm', category: 'technology', difficulty: 'medium' },
  { word: 'interface', category: 'technology', difficulty: 'easy' },
  { word: 'encryption', category: 'technology', difficulty: 'medium' },
  { word: 'bandwidth', category: 'technology', difficulty: 'easy' },
  { word: 'latency', category: 'technology', difficulty: 'medium' },
  { word: 'protocol', category: 'technology', difficulty: 'medium' },
  { word: 'synchronous', category: 'technology', difficulty: 'medium' },
  { word: 'asynchronous', category: 'technology', difficulty: 'medium' },
  { word: 'recursive', category: 'technology', difficulty: 'hard' },
  { word: 'virtualization', category: 'technology', difficulty: 'hard' },
  { word: 'deprecated', category: 'technology', difficulty: 'medium' },
  { word: 'scalability', category: 'technology', difficulty: 'medium' },
  
  // === ARTS ===
  { word: 'aesthetic', category: 'arts', difficulty: 'medium' },
  { word: 'renaissance', category: 'arts', difficulty: 'medium' },
  { word: 'abstract', category: 'arts', difficulty: 'easy' },
  { word: 'composition', category: 'arts', difficulty: 'easy' },
  { word: 'avant-garde', category: 'arts', difficulty: 'hard' },
  { word: 'impressionism', category: 'arts', difficulty: 'medium' },
  { word: 'chiaroscuro', category: 'arts', difficulty: 'hard' },
  { word: 'mosaic', category: 'arts', difficulty: 'easy' },
  { word: 'surrealism', category: 'arts', difficulty: 'medium' },
  { word: 'minimalism', category: 'arts', difficulty: 'easy' },
  { word: 'baroque', category: 'arts', difficulty: 'medium' },
  
  // === HISTORY ===
  { word: 'revolution', category: 'history', difficulty: 'easy' },
  { word: 'democracy', category: 'history', difficulty: 'easy' },
  { word: 'colonialism', category: 'history', difficulty: 'medium' },
  { word: 'aristocracy', category: 'history', difficulty: 'medium' },
  { word: 'sovereignty', category: 'history', difficulty: 'medium' },
  { word: 'imperialism', category: 'history', difficulty: 'medium' },
  { word: 'feudalism', category: 'history', difficulty: 'medium' },
  { word: 'renaissance', category: 'history', difficulty: 'medium' },
  { word: 'dynasty', category: 'history', difficulty: 'easy' },
  { word: 'antiquity', category: 'history', difficulty: 'medium' },
  { word: 'monarchy', category: 'history', difficulty: 'easy' },
  
  // === ACADEMIC ===
  { word: 'ubiquitous', category: 'academic', difficulty: 'hard' },
  { word: 'dichotomy', category: 'academic', difficulty: 'hard' },
  { word: 'esoteric', category: 'academic', difficulty: 'hard' },
  { word: 'pedagogy', category: 'academic', difficulty: 'hard' },
  { word: 'epistemology', category: 'academic', difficulty: 'hard' },
  { word: 'cognition', category: 'academic', difficulty: 'medium' },
  { word: 'inference', category: 'academic', difficulty: 'medium' },
  { word: 'methodology', category: 'academic', difficulty: 'medium' },
  { word: 'rhetoric', category: 'academic', difficulty: 'medium' },
  { word: 'semantics', category: 'academic', difficulty: 'hard' },
  { word: 'axiom', category: 'academic', difficulty: 'hard' },
  { word: 'conjecture', category: 'academic', difficulty: 'medium' },
  { word: 'postulate', category: 'academic', difficulty: 'hard' },
];

/**
 * Get words by category
 */
export function getWordsByCategory(category: WordCategory): WordEntry[] {
  return CURATED_WORDS.filter(w => w.category === category);
}

/**
 * Get words by difficulty
 */
export function getWordsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): WordEntry[] {
  return CURATED_WORDS.filter(w => w.difficulty === difficulty);
}

/**
 * Get random words from the list
 */
export function getRandomWords(count: number, excludeWords: string[] = []): WordEntry[] {
  const available = CURATED_WORDS.filter(w => !excludeWords.includes(w.word));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get a word for a specific day (deterministic based on date)
 */
export function getWordForDate(date: Date): WordEntry {
  // Use date to create a deterministic index
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % CURATED_WORDS.length;
  return CURATED_WORDS[index];
}

/**
 * Category display information
 */
export const CATEGORY_INFO: Record<WordCategory, { name: string; icon: string; color: string }> = {
  business: { name: 'Business', icon: 'briefcase', color: '#378ADD' },
  science: { name: 'Science', icon: 'flask', color: '#639922' },
  literature: { name: 'Literature', icon: 'book', color: '#D85A30' },
  technology: { name: 'Technology', icon: 'laptop', color: '#EF9F27' },
  arts: { name: 'Arts', icon: 'color-palette', color: '#9B59B6' },
  history: { name: 'History', icon: 'time', color: '#34495E' },
  everyday: { name: 'Everyday', icon: 'chatbubbles', color: '#378ADD' },
  academic: { name: 'Academic', icon: 'school', color: '#2C3E50' },
};
