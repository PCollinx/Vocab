import { Word, QuizQuestion } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateQuizQuestions(words: Word[]): QuizQuestion[] {
  return shuffle(words).map((word, index) => {
    const otherWords = shuffle(words.filter(w => w.id !== word.id));

    // Only offer match-synonym when the word actually has synonyms
    const canUseSynonym = word.synonyms.length > 0;
    const type: QuizQuestion['type'] =
      canUseSynonym && Math.random() < 0.5 ? 'match-synonym' : 'multiple-choice';

    let question: string;
    let correctAnswer: string;
    let wrongOptions: string[];

    if (type === 'multiple-choice') {
      question = `What is the definition of "${word.word}"?`;
      correctAnswer = word.definition;
      wrongOptions = otherWords
        .map(w => w.definition)
        .filter(def => def && def !== correctAnswer)
        .slice(0, 3);
    } else {
      question = `Which of these is a synonym of "${word.word}"?`;
      correctAnswer = word.synonyms[0];
      // Collect synonyms from other words, deduplicate, exclude correct answer
      const candidates = [...new Set(
        otherWords.flatMap(w => w.synonyms)
      )].filter(s => s && s !== correctAnswer);
      wrongOptions = candidates.slice(0, 3);
      // Pad with word names if not enough unique synonyms available
      if (wrongOptions.length < 3) {
        const extra = otherWords
          .map(w => w.word)
          .filter(w => w !== correctAnswer && !wrongOptions.includes(w))
          .slice(0, 3 - wrongOptions.length);
        wrongOptions = [...wrongOptions, ...extra];
      }
    }

    return {
      id: `q-${index}-${Date.now()}`,
      type,
      word,
      question,
      options: shuffle([correctAnswer, ...wrongOptions]),
      correctAnswer,
    };
  });
}
