/**
 * Quiz Screen
 * Interactive vocabulary quiz with multiple question types
 */

import { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Card, Button } from '../src/components';
import { colors, spacing, borderRadius } from '../src/constants';
import { useAppStore } from '../src/store/appStore';

export default function QuizScreen() {
  const router = useRouter();
  const { 
    currentQuiz, 
    startQuiz, 
    answerQuestion, 
    nextQuestion, 
    endQuiz 
  } = useAppStore();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initQuiz = async () => {
      if (!currentQuiz) {
        await startQuiz();
      }
      setIsLoading(false);
    };
    initQuiz();
  }, []);

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    answerQuestion(selectedAnswer);
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    nextQuestion();
  };

  const handleFinish = () => {
    router.back();
    endQuiz();
  };

  if (isLoading || !currentQuiz) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color="muted" style={{ marginTop: spacing[4] }}>
            Loading quiz...
          </Text>
        </View>
      </Container>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuiz.currentIndex];
  const isComplete = currentQuiz.isComplete;
  const progress = (currentQuiz.currentIndex + 1) / currentQuiz.totalQuestions;

  // Quiz Complete Screen
  if (isComplete) {
    const percentage = Math.round((currentQuiz.score / currentQuiz.totalQuestions) * 100);
    const getMessage = () => {
      if (percentage >= 80) return { emoji: 'trophy', text: 'Excellent!', color: colors.correct };
      if (percentage >= 60) return { emoji: 'thumbs-up', text: 'Good job!', color: colors.streak };
      return { emoji: 'fitness', text: 'Keep practicing!', color: colors.accent };
    };
    const result = getMessage();

    return (
      <Container>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textHeading} />
          </TouchableOpacity>
          <Text variant="h4" color="heading">Quiz Complete</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: result.color + '20' }]}>
            <Ionicons name={result.emoji as any} size={60} color={result.color} />
          </View>
          
          <Text variant="h2" color="heading" style={styles.resultTitle}>
            {result.text}
          </Text>
          
          <Text variant="bodyLarge" color="muted" style={styles.resultSubtitle}>
            You scored
          </Text>
          
          <View style={styles.scoreContainer}>
            <Text variant="h1" style={{ color: result.color, fontSize: 48 }}>
              {currentQuiz.score}
            </Text>
            <Text variant="h3" color="muted">
              /{currentQuiz.totalQuestions}
            </Text>
          </View>
          
          <Text variant="body" color="muted">
            {percentage}% correct
          </Text>

          <View style={styles.resultActions}>
            <Button
              title="Try Again"
              onPress={() => {
                endQuiz();
                startQuiz();
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              variant="outline"
              fullWidth
              style={styles.resultBtn}
            />
            <Button
              title="Done"
              onPress={handleFinish}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </Container>
    );
  }

  // Quiz Question Screen
  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.textHeading} />
        </TouchableOpacity>
        <Text variant="label" color="muted">
          Question {currentQuiz.currentIndex + 1} of {currentQuiz.totalQuestions}
        </Text>
        <View style={styles.scoreDisplay}>
          <Ionicons name="checkmark-circle" size={18} color={colors.correct} />
          <Text variant="label" color="heading">{currentQuiz.score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <View style={styles.questionBadge}>
          <Ionicons 
            name={currentQuestion.type === 'multiple-choice' ? 'help-circle' : 'swap-horizontal'} 
            size={20} 
            color={colors.primary} 
          />
          <Text variant="caption" color="primary">
            {currentQuestion.type === 'multiple-choice' ? 'Definition' : 'Synonym'}
          </Text>
        </View>

        <Text variant="h3" color="heading" style={styles.questionText}>
          {currentQuestion.question}
        </Text>

        {/* Word Info */}
        <View style={styles.wordInfo}>
          <Text variant="caption" color="muted">
            {currentQuestion.word.partOfSpeech}
          </Text>
        </View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionBtn,
                isSelected && !showResult && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelectAnswer(option)}
              disabled={showResult}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionLetter,
                  isSelected && !showResult && styles.optionLetterSelected,
                  showCorrect && styles.optionLetterCorrect,
                  showWrong && styles.optionLetterWrong,
                ]}>
                  <Text 
                    variant="label" 
                    color={isSelected || showCorrect || showWrong ? 'white' : 'muted'}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text 
                  variant="body" 
                  color="heading" 
                  style={styles.optionText}
                  numberOfLines={3}
                >
                  {option}
                </Text>
              </View>
              {showCorrect && (
                <Ionicons name="checkmark-circle" size={24} color={colors.correct} />
              )}
              {showWrong && (
                <Ionicons name="close-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {!showResult ? (
          <Button
            title="Check Answer"
            onPress={handleSubmitAnswer}
            variant="primary"
            fullWidth
            disabled={!selectedAnswer}
          />
        ) : (
          <Button
            title={currentQuiz.currentIndex + 1 === currentQuiz.totalQuestions ? 'See Results' : 'Next Question'}
            onPress={handleNext}
            variant="primary"
            fullWidth
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    marginBottom: spacing[6],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  questionContainer: {
    marginBottom: spacing[6],
  },
  questionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  questionText: {
    lineHeight: 32,
  },
  wordInfo: {
    marginTop: spacing[2],
  },
  optionsContainer: {
    gap: spacing[3],
    flex: 1,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionCorrect: {
    borderColor: colors.correct,
    backgroundColor: colors.correctLight,
  },
  optionWrong: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing[3],
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterSelected: {
    backgroundColor: colors.primary,
  },
  optionLetterCorrect: {
    backgroundColor: colors.correct,
  },
  optionLetterWrong: {
    backgroundColor: colors.accent,
  },
  optionText: {
    flex: 1,
  },
  actionContainer: {
    paddingVertical: spacing[4],
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  resultTitle: {
    marginBottom: spacing[2],
  },
  resultSubtitle: {
    marginBottom: spacing[2],
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing[2],
  },
  resultActions: {
    width: '100%',
    marginTop: spacing[8],
    gap: spacing[3],
  },
  resultBtn: {
    marginBottom: spacing[2],
  },
});
