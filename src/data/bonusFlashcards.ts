// Bonus flashcards shown while daily words load.
// None of these words appear in wordList.ts.

export type BonusCard = {
  word: string;
  partOfSpeech: string;
  definition: string;
  emoji: string;
};

export const BONUS_CARDS: BonusCard[] = [
  { word: "petrichor",        partOfSpeech: "noun",      emoji: "🌧️", definition: "The pleasant smell of rain falling on dry earth." },
  { word: "apricity",         partOfSpeech: "noun",      emoji: "☀️", definition: "The warmth of the sun on a cold winter's day." },
  { word: "phosphene",        partOfSpeech: "noun",      emoji: "✨", definition: "The light you see when you press on your closed eyelids." },
  { word: "psithurism",       partOfSpeech: "noun",      emoji: "🍃", definition: "The soft, whispering sound of wind rustling through leaves." },
  { word: "borborygmus",      partOfSpeech: "noun",      emoji: "🫃", definition: "The rumbling or gurgling sound your stomach makes when hungry." },
  { word: "sillage",          partOfSpeech: "noun",      emoji: "🌸", definition: "The invisible scent trail left in the air by someone's perfume." },
  { word: "velleity",         partOfSpeech: "noun",      emoji: "💭", definition: "A wish or desire so faint it never actually leads to action." },
  { word: "sempiternal",      partOfSpeech: "adjective", emoji: "♾️", definition: "Lasting or existing forever; eternal and unchanging." },
  { word: "limerence",        partOfSpeech: "noun",      emoji: "💘", definition: "An involuntary state of intense romantic longing for another person." },
  { word: "meraki",           partOfSpeech: "noun",      emoji: "🎨", definition: "Putting your soul, creativity, and love into something you do." },
  { word: "hiraeth",          partOfSpeech: "noun",      emoji: "🏡", definition: "A deep longing for a home you can never return to, or that never was." },
  { word: "saudade",          partOfSpeech: "noun",      emoji: "🌅", definition: "A melancholic longing for something beautiful that has passed." },
  { word: "solivagant",       partOfSpeech: "noun",      emoji: "🚶", definition: "A person who wanders alone through the world." },
  { word: "quiddity",         partOfSpeech: "noun",      emoji: "🔮", definition: "The essential nature or 'what-ness' that makes a thing what it is." },
  { word: "schadenfreude",    partOfSpeech: "noun",      emoji: "😏", definition: "Pleasure secretly derived from another person's misfortune." },
  { word: "defenestration",   partOfSpeech: "noun",      emoji: "🪟", definition: "The act of throwing someone or something out of a window." },
  { word: "callipygian",      partOfSpeech: "adjective", emoji: "🍑", definition: "Having well-shaped or beautiful buttocks. (From Greek: kallos + pygē.)" },
  { word: "fugacious",        partOfSpeech: "adjective", emoji: "🦋", definition: "Tending to disappear quickly; fleeting and hard to hold onto." },
  { word: "tintinnabulation", partOfSpeech: "noun",      emoji: "🔔", definition: "The light, clear ringing sound of bells." },
  { word: "absquatulate",     partOfSpeech: "verb",      emoji: "🏃", definition: "To leave a place abruptly and without explanation." },
  { word: "flibbertigibbet",  partOfSpeech: "noun",      emoji: "💬", definition: "A frivolous, flighty, or excessively talkative person." },
  { word: "snollygoster",     partOfSpeech: "noun",      emoji: "🐍", definition: "A shrewd, dishonest person who cannot be trusted, especially a politician." },
  { word: "collywobbles",     partOfSpeech: "noun",      emoji: "😰", definition: "Stomach butterflies or nausea brought on by nervousness or anxiety." },
  { word: "kerfuffle",        partOfSpeech: "noun",      emoji: "🌀", definition: "A commotion or fuss, especially one caused by conflicting views." },
  { word: "brouhaha",         partOfSpeech: "noun",      emoji: "📣", definition: "A noisy, overexcited public reaction or uproar." },
  { word: "lollygag",         partOfSpeech: "verb",      emoji: "🛋️", definition: "To spend time aimlessly; to dawdle or idle about without purpose." },
  { word: "cattywampus",      partOfSpeech: "adjective", emoji: "↗️", definition: "Askew, not in alignment; in a state of disarray." },
  { word: "bumfuzzle",        partOfSpeech: "verb",      emoji: "😵", definition: "To confuse or fluster someone completely." },
  { word: "gobbledegook",     partOfSpeech: "noun",      emoji: "🤷", definition: "Language that is unnecessarily complicated and hard to understand." },
  { word: "tmesis",           partOfSpeech: "noun",      emoji: "✂️", definition: "Inserting a word inside another for emphasis — like 'abso-blooming-lutely'." },
];

export function randomBonusCard(): BonusCard {
  return BONUS_CARDS[Math.floor(Math.random() * BONUS_CARDS.length)];
}
