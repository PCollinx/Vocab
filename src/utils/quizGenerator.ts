import { Word, QuizQuestion } from '../types';

export function generateQuizQuestions(words: Word[]): QuizQuestion[] {
  return words.map((word, index) => {
    const questionTypes: QuizQuestion['type'][] = ['multiple-choice', 'match-synonym'];
    const type = questionTypes[index % questionTypes.length];

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
