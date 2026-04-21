/**
 * Vocabulary App — Sky & Coral Color System
 * For kids/teens · Premium & confident feel
 */

// Sky blue ramp (Primary)
export const blue = {
  50: "#E6F1FB",
  100: "#B5D4F4",
  200: "#85B7EB",
  400: "#378ADD",
  600: "#185FA5",
  800: "#0C447C",
  900: "#042C53",
} as const;

// Coral ramp (Accent / wrong answer)
export const coral = {
  50: "#FAECE7",
  100: "#F5C4B3",
  200: "#F0997B",
  400: "#D85A30",
  600: "#993C1D",
  800: "#712B13",
  900: "#4A1B0C",
} as const;

// Green ramp (Correct / mastered)
export const green = {
  50: "#EAF3DE",
  100: "#C0DD97",
  200: "#97C459",
  400: "#639922",
  600: "#3B6D11",
  800: "#27500A",
  900: "#173404",
} as const;

// Amber ramp (Streaks / rewards)
export const amber = {
  50: "#FAEEDA",
  100: "#FAC775",
  200: "#EF9F27",
  400: "#BA7517",
  600: "#854F0B",
  800: "#633806",
  900: "#412402",
} as const;

// Gray ramp (Neutral / UI)
export const gray = {
  50: "#F1EFE8",
  100: "#D3D1C7",
  200: "#B4B2A9",
  400: "#888780",
  600: "#5F5E5A",
  800: "#444441",
  900: "#2C2C2A",
} as const;

// Semantic design tokens
export const colors = {
  // Primary — buttons, active nav, CTAs
  primary: blue[400],
  primaryLight: blue[50],
  primaryDark: blue[600],
  primaryText: blue[50],
  primaryLightText: blue[800],

  // Accent — coral highlights, warm moments
  accent: coral[400],
  accentLight: coral[50],
  accentText: coral[50],
  accentLightText: coral[800],

  // Correct answer / mastered word
  correct: green[400],
  correctLight: green[50],
  correctText: green[50],
  correctLightText: green[800],

  // Streak / XP / reward
  streak: amber[200],
  streakLight: amber[50],
  streakText: amber[50],
  streakLightText: amber[800],

  // Wrong answer (uses coral, keeps tone warm not harsh)
  wrong: coral[400],
  wrongLight: coral[50],
  wrongText: coral[50],
  wrongLightText: coral[600],

  // Surfaces & backgrounds
  background: gray[50],
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  // Typography
  textHeading: gray[900],
  textBody: gray[600],
  textMuted: gray[400],
  textHint: gray[200],

  // Borders
  border: gray[100],
  borderStrong: gray[400],

  // Common
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type Colors = typeof colors;
