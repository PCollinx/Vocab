# WordWise - Component Library

Documentation for all reusable UI components in the WordWise vocabulary app.

---

## Table of Contents

- [Overview](#overview)
- [Design Tokens](#design-tokens)
- [Components](#components)
  - [Text](#text)
  - [Button](#button)
  - [Card](#card)
  - [Badge](#badge)
  - [Container](#container)
  - [ProgressBar](#progressbar)
  - [IconButton](#iconbutton)
- [Usage Examples](#usage-examples)

---

## Overview

All components are located in `src/components/` and exported via barrel file.

### Import Pattern

```typescript
// Import multiple components
import { Text, Button, Card, Badge, Container } from '../src/components';

// Import single component
import { Text } from '../src/components/Text';
```

### Component Principles

1. **Consistent API**: All components use similar prop patterns
2. **Theme Integration**: Components use design tokens from `src/constants/`
3. **Type Safety**: Full TypeScript support with exported types
4. **Accessibility**: Semantic structure and color contrast

---

## Design Tokens

### Colors

Location: `src/constants/colors.ts`

```typescript
import { colors } from '../constants';

// Primary palette
colors.primary        // #378ADD - Main brand color
colors.primaryLight   // #E6F1FB - Light variant
colors.primaryDark    // #185FA5 - Dark variant

// Accent (Coral)
colors.accent         // #D85A30 - Secondary brand color
colors.accentLight    // #FAECE7 - Light variant

// Semantic colors
colors.correct        // #639922 - Success/correct
colors.wrong          // #D85A30 - Error/wrong
colors.streak         // #EF9F27 - Rewards/streaks

// Neutrals
colors.background     // #F1EFE8 - App background
colors.surface        // #FFFFFF - Card backgrounds
colors.textHeading    // #2C2C2A - Headings
colors.textBody       // #5F5E5A - Body text
colors.textMuted      // #888780 - Secondary text
colors.textHint       // #B4B2A9 - Hint text
colors.border         // #D3D1C7 - Borders
```

### Spacing

Location: `src/constants/spacing.ts`

```typescript
import { spacing } from '../constants';

spacing[1]   // 4px
spacing[2]   // 8px
spacing[3]   // 12px
spacing[4]   // 16px
spacing[5]   // 20px
spacing[6]   // 24px
spacing[8]   // 32px
spacing[10]  // 40px
spacing[12]  // 48px
spacing[16]  // 64px
spacing[20]  // 80px
```

### Border Radius

```typescript
import { borderRadius } from '../constants';

borderRadius.sm     // 4
borderRadius.md     // 8
borderRadius.lg     // 12
borderRadius.xl     // 16
borderRadius['2xl'] // 20
borderRadius['3xl'] // 24
borderRadius.full   // 9999 (circle)
```

### Typography

Location: `src/constants/typography.ts`

```typescript
import { textStyles } from '../constants';

textStyles.h1        // 32px, bold
textStyles.h2        // 24px, bold
textStyles.h3        // 20px, semibold
textStyles.bodyLarge // 18px, regular
textStyles.body      // 16px, regular
textStyles.bodySmall // 14px, regular
textStyles.caption   // 12px, regular
textStyles.label     // 14px, semibold
```

---

## Components

### Text

Typography component with preset variants and semantic colors.

**Location:** `src/components/Text.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | TextVariant | `'body'` | Typography style preset |
| `color` | TextColor | `'body'` | Text color preset |
| `center` | boolean | `false` | Center text alignment |
| `children` | ReactNode | required | Text content |
| `style` | StyleProp | - | Additional styles |
| `...rest` | TextProps | - | React Native Text props |

#### Variants

```typescript
type TextVariant = 
  | 'h1'        // Large heading (32px, bold)
  | 'h2'        // Medium heading (24px, bold)
  | 'h3'        // Small heading (20px, semibold)
  | 'bodyLarge' // Large body (18px)
  | 'body'      // Default body (16px)
  | 'bodySmall' // Small body (14px)
  | 'caption'   // Caption text (12px)
  | 'label';    // Label text (14px, semibold)
```

#### Colors

```typescript
type TextColor = 
  | 'heading'  // #2C2C2A - For headings
  | 'body'     // #5F5E5A - Default text
  | 'muted'    // #888780 - Secondary text
  | 'hint'     // #B4B2A9 - Placeholder text
  | 'primary'  // #378ADD - Primary brand
  | 'accent'   // #D85A30 - Accent color
  | 'correct'  // #639922 - Success
  | 'wrong'    // #D85A30 - Error
  | 'white';   // #FFFFFF - White text
```

#### Examples

```tsx
// Heading
<Text variant="h1" color="heading">Welcome Back!</Text>

// Body text
<Text variant="body" color="muted">
  Learn a new word every day
</Text>

// Centered caption
<Text variant="caption" color="hint" center>
  Tap to learn more
</Text>

// Custom styling
<Text variant="h2" style={{ marginBottom: 16 }}>
  Word of the Day
</Text>
```

---

### Button

Configurable button component with multiple variants.

**Location:** `src/components/Button.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Button text |
| `onPress` | () => void | required | Press handler |
| `variant` | ButtonVariant | `'primary'` | Visual style |
| `size` | ButtonSize | `'md'` | Size preset |
| `fullWidth` | boolean | `false` | Full width button |
| `disabled` | boolean | `false` | Disabled state |
| `loading` | boolean | `false` | Loading state |
| `icon` | ReactNode | - | Left icon |
| `style` | StyleProp | - | Additional styles |

#### Variants

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `primary` | Primary blue | White | None |
| `secondary` | Primary light | Primary dark | None |
| `outline` | Transparent | Primary | Primary |
| `ghost` | Transparent | Primary | None |

#### Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 36px | 12px | 14px |
| `md` | 48px | 16px | 16px |
| `lg` | 56px | 20px | 18px |

#### Examples

```tsx
// Primary button
<Button 
  title="Get Started" 
  onPress={handleStart} 
  variant="primary"
/>

// Outline button
<Button 
  title="Cancel" 
  onPress={handleCancel} 
  variant="outline"
/>

// Full width with icon
<Button 
  title="Start Quiz" 
  onPress={startQuiz} 
  fullWidth
  icon={<Ionicons name="play" size={20} color="white" />}
/>

// Disabled state
<Button 
  title="Submit" 
  onPress={submit} 
  disabled={!isValid}
/>

// Loading state
<Button 
  title="Saving..." 
  onPress={save} 
  loading={isSaving}
/>
```

---

### Card

Container component with elevation and padding options.

**Location:** `src/components/Card.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | CardVariant | `'default'` | Visual style |
| `padding` | CardPadding | `'md'` | Padding preset |
| `children` | ReactNode | required | Card content |
| `onPress` | () => void | - | Makes card pressable |
| `style` | StyleProp | - | Additional styles |

#### Variants

| Variant | Background | Shadow | Border |
|---------|------------|--------|--------|
| `default` | White | Light shadow | None |
| `elevated` | White | Medium shadow | None |
| `filled` | Gray 50 | None | None |

#### Padding Options

| Padding | Value |
|---------|-------|
| `none` | 0 |
| `sm` | 12px |
| `md` | 16px |
| `lg` | 24px |

#### Examples

```tsx
// Basic card
<Card>
  <Text variant="h3">Card Title</Text>
  <Text variant="body">Card content goes here</Text>
</Card>

// Elevated card with large padding
<Card variant="elevated" padding="lg">
  <Text variant="h2">Featured Word</Text>
</Card>

// Filled card (no shadow)
<Card variant="filled" padding="sm">
  <Text variant="caption">"Example sentence here"</Text>
</Card>

// Pressable card
<Card onPress={() => router.push('/word/1')}>
  <Text>Tap to view details</Text>
</Card>
```

---

### Badge

Small label/tag component for categorization.

**Location:** `src/components/Badge.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Badge text |
| `variant` | BadgeVariant | `'primary'` | Color variant |
| `size` | BadgeSize | `'md'` | Size preset |

#### Variants

| Variant | Background | Text Color |
|---------|------------|------------|
| `primary` | Primary light | Primary dark |
| `accent` | Accent light | Accent dark |
| `correct` | Correct light | Correct dark |
| `streak` | Streak light | Streak dark |
| `muted` | Gray 100 | Gray 600 |

#### Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| `sm` | 4px 8px | 10px |
| `md` | 6px 12px | 12px |
| `lg` | 8px 16px | 14px |

#### Examples

```tsx
// Part of speech badge
<Badge label="noun" variant="primary" />

// Difficulty badges
<Badge label="Easy" variant="correct" />
<Badge label="Medium" variant="streak" />
<Badge label="Hard" variant="accent" />

// Category badge
<Badge label="Technology" variant="muted" />

// Small size
<Badge label="New" variant="primary" size="sm" />
```

---

### Container

Screen container with safe area and status bar handling.

**Location:** `src/components/Container.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Screen content |
| `backgroundColor` | string | `colors.background` | Background color |
| `statusBarStyle` | StatusBarStyle | `'dark-content'` | Status bar appearance |
| `edges` | Edge[] | `['top', 'bottom']` | Safe area edges |
| `style` | StyleProp | - | Additional styles |

#### Examples

```tsx
// Default container
<Container>
  <Text variant="h1">Screen Title</Text>
</Container>

// Colored background with light status bar
<Container 
  backgroundColor={colors.primary}
  statusBarStyle="light-content"
>
  <Text variant="h1" color="white">Dark Header</Text>
</Container>

// Only top safe area
<Container edges={['top']}>
  <Text>Content extends to bottom</Text>
</Container>
```

---

### ProgressBar

Horizontal progress indicator.

**Location:** `src/components/ProgressBar.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | number | required | Progress value (0-1) |
| `color` | string | `colors.primary` | Fill color |
| `backgroundColor` | string | `colors.border` | Track color |
| `height` | number | `8` | Bar height |
| `animated` | boolean | `true` | Animate changes |
| `style` | StyleProp | - | Additional styles |

#### Examples

```tsx
// Basic progress bar
<ProgressBar progress={0.5} />

// Custom colors
<ProgressBar 
  progress={0.75} 
  color={colors.correct}
  backgroundColor={colors.correctLight}
/>

// Quiz progress
<ProgressBar 
  progress={currentQuestion / totalQuestions}
  color={colors.primary}
  height={6}
/>

// Streak progress
<ProgressBar 
  progress={streakDays / 7}
  color={colors.streak}
/>
```

---

### IconButton

Circular button for icon-only actions.

**Location:** `src/components/IconButton.tsx`

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | required | Ionicons name |
| `onPress` | () => void | required | Press handler |
| `size` | number | `24` | Icon size |
| `color` | string | `colors.textBody` | Icon color |
| `backgroundColor` | string | `'transparent'` | Background color |
| `disabled` | boolean | `false` | Disabled state |

#### Examples

```tsx
// Back button
<IconButton 
  icon="arrow-back" 
  onPress={() => router.back()} 
/>

// Bookmark toggle
<IconButton 
  icon={isBookmarked ? "bookmark" : "bookmark-outline"}
  onPress={toggleBookmark}
  color={isBookmarked ? colors.primary : colors.textMuted}
/>

// Play audio
<IconButton 
  icon="volume-high"
  onPress={playAudio}
  color={colors.white}
  size={20}
/>

// With background
<IconButton 
  icon="settings"
  onPress={openSettings}
  backgroundColor={colors.surface}
  size={28}
/>
```

---

## Usage Examples

### Word Card Component

```tsx
function WordCard({ word, onPress, onBookmark }) {
  return (
    <Card variant="elevated" padding="lg" onPress={onPress}>
      <View style={styles.header}>
        <Badge label={word.partOfSpeech} variant="primary" />
        <IconButton 
          icon={word.isBookmarked ? "bookmark" : "bookmark-outline"}
          onPress={onBookmark}
          color={word.isBookmarked ? colors.primary : colors.textMuted}
        />
      </View>
      
      <Text variant="h2" color="heading" style={styles.word}>
        {word.word}
      </Text>
      
      <Text variant="caption" color="muted">
        {word.pronunciation}
      </Text>
      
      <Text variant="body" color="body" style={styles.definition}>
        {word.definition}
      </Text>
      
      <View style={styles.tags}>
        <Badge label={word.difficulty} variant="correct" size="sm" />
        <Badge label={word.category} variant="muted" size="sm" />
      </View>
    </Card>
  );
}
```

### Quiz Question Component

```tsx
function QuizQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  
  return (
    <Container>
      <ProgressBar 
        progress={question.index / question.total}
        color={colors.primary}
      />
      
      <Text variant="h2" color="heading" center>
        {question.text}
      </Text>
      
      <Card variant="filled" padding="md">
        <Text variant="h3" color="primary" center>
          {question.word}
        </Text>
      </Card>
      
      {question.options.map((option, i) => (
        <Button
          key={i}
          title={option}
          variant={selected === i ? 'primary' : 'outline'}
          onPress={() => setSelected(i)}
          fullWidth
          style={{ marginTop: spacing[3] }}
        />
      ))}
      
      <Button
        title="Submit Answer"
        onPress={() => onAnswer(question.options[selected])}
        variant="primary"
        fullWidth
        disabled={selected === null}
        style={{ marginTop: spacing[6] }}
      />
    </Container>
  );
}
```

### Stats Card Component

```tsx
function StatsCard({ icon, value, label, color }) {
  return (
    <Card variant="default" padding="md" style={styles.statsCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text variant="h2" color="heading">{value}</Text>
      <Text variant="caption" color="muted">{label}</Text>
    </Card>
  );
}

// Usage
<View style={styles.statsGrid}>
  <StatsCard 
    icon="flame" 
    value={streak} 
    label="Day Streak" 
    color={colors.streak}
  />
  <StatsCard 
    icon="book" 
    value={wordsLearned} 
    label="Words Learned" 
    color={colors.correct}
  />
</View>
```

---

## Component File Template

```tsx
/**
 * ComponentName
 * Brief description of the component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, borderRadius } from '../constants';

interface ComponentNameProps {
  // Required props
  children: React.ReactNode;
  
  // Optional props
  variant?: 'default' | 'alternate';
  style?: StyleProp<ViewStyle>;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  return (
    <View style={[styles.container, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base styles
  },
  default: {
    // Default variant styles
  },
  alternate: {
    // Alternate variant styles
  },
});
```

---

## Best Practices

1. **Use design tokens**: Always import from `constants/` instead of hardcoding values
2. **Compose components**: Build complex UI from simple components
3. **Consistent naming**: Use descriptive prop names matching design system
4. **Type everything**: Define TypeScript interfaces for all props
5. **Document props**: Include JSDoc comments for complex props
6. **Test variants**: Verify all variant combinations work correctly
