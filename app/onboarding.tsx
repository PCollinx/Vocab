/**
 * Onboarding Screen
 * Welcome flow for new users
 */

import { useState } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Button } from '../src/components';
import { colors, spacing, borderRadius } from '../src/constants';
import { useAppStore } from '../src/store/appStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Daily words.',
    highlight: 'Lifelong impact!',
    subtitle: 'Your daily dose of vocabulary.',
    icon: 'bulb' as const,
  },
  {
    id: 2,
    title: 'Make every day',
    highlight: 'a learning journey',
    subtitle: 'An engaging way to master new words and expand your knowledge.',
    icon: 'globe' as const,
  },
  {
    id: 3,
    title: 'Track your',
    highlight: 'progress!',
    subtitle: 'Build streaks, earn achievements, and watch yourself grow.',
    icon: 'trending-up' as const,
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const { completeOnboarding } = useAppStore();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Top Section with Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.emojiContainer}>
          <Ionicons name={slide.icon} size={60} color={colors.primary} />
        </View>
      </View>

      {/* Bottom Section with Content */}
      <View style={styles.contentContainer}>
        {/* App Name */}
        <View style={styles.brandContainer}>
          <Ionicons name="book-outline" size={18} color={colors.white} />
          <Text variant="label" color="white">
            WordWise
          </Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text variant="h1" color="white" center>
            {slide.title}
          </Text>
          <Text variant="h1" style={styles.highlight} center>
            {slide.highlight}
          </Text>
        </View>

        {/* Subtitle */}
        <Text variant="body" style={styles.subtitle} center>
          {slide.subtitle}
        </Text>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={currentSlide === slides.length - 1 ? 'Start Learning' : 'Next'}
            onPress={handleNext}
            variant="secondary"
            fullWidth
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emojiContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  titleContainer: {
    marginBottom: spacing[4],
  },
  highlight: {
    color: colors.streak,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing[6],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    paddingHorizontal: spacing[4],
  },
  button: {
    backgroundColor: colors.white,
  },
});
