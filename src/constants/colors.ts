/**
 * Vocabulary App — Sky & Coral Color System
 * Supports light and dark themes.
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

// ─── Shared colour interface ──────────────────────────────────────────────────

export interface Colors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryText: string;
  primaryLightText: string;
  accent: string;
  accentLight: string;
  accentText: string;
  accentLightText: string;
  correct: string;
  correctLight: string;
  correctText: string;
  correctLightText: string;
  streak: string;
  streakLight: string;
  streakText: string;
  streakLightText: string;
  wrong: string;
  wrongLight: string;
  wrongText: string;
  wrongLightText: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  textHeading: string;
  textBody: string;
  textMuted: string;
  textHint: string;
  border: string;
  borderStrong: string;
  white: string;
  black: string;
  transparent: string;
}

// ─── Light theme ─────────────────────────────────────────────────────────────

export const colors: Colors = {
  primary: blue[400],
  primaryLight: blue[50],
  primaryDark: blue[600],
  primaryText: blue[50],
  primaryLightText: blue[800],

  accent: coral[400],
  accentLight: coral[50],
  accentText: coral[50],
  accentLightText: coral[800],

  correct: green[400],
  correctLight: green[50],
  correctText: green[50],
  correctLightText: green[800],

  streak: amber[200],
  streakLight: amber[50],
  streakText: amber[50],
  streakLightText: amber[800],

  wrong: coral[400],
  wrongLight: coral[50],
  wrongText: coral[50],
  wrongLightText: coral[600],

  background: gray[50],
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  textHeading: gray[900],
  textBody: gray[600],
  textMuted: gray[400],
  textHint: gray[200],

  border: gray[100],
  borderStrong: gray[400],

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkColors: Colors = {
  primary: blue[400],
  primaryLight: "#162035",
  primaryDark: blue[600],
  primaryText: blue[50],
  primaryLightText: blue[200],

  accent: coral[200],
  accentLight: "#2D1610",
  accentText: coral[50],
  accentLightText: coral[200],

  correct: green[200],
  correctLight: "#112310",
  correctText: green[50],
  correctLightText: green[200],

  streak: amber[200],
  streakLight: "#271C05",
  streakText: amber[50],
  streakLightText: amber[200],

  wrong: coral[200],
  wrongLight: "#2D1610",
  wrongText: coral[50],
  wrongLightText: coral[200],

  background: "#111218",
  surface: "#1C1D26",
  surfaceElevated: "#252630",

  textHeading: "#EDEEF5",
  textBody: "#9192A3",
  textMuted: "#7C7E96",
  textHint: "#52546A",

  border: "#252632",
  borderStrong: "#3E3F54",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};
