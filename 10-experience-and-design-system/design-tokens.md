---
name: "Design Tokens"
version: "1.2.0"
updated: "2026-04-23"
description: "Emdash brand tokens (#060610/#00E5FF/#50AAE3/#7C3AED). HSL scales 50-950, 4px spacing, 1.25 type scale, W3C DTCG JSON format. CSS custom properties + TypeScript constants. Dark-first with light overrides."
---

# Design Tokens

## Color Scale Generation (HSL manipulation)
```typescript
// scripts/generate-tokens.ts
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function generateScale(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex);
  // Tailwind-style 50-950 scale: lightest → darkest
  const lightnesses: Record<string, number> = {
    '50': 97, '100': 94, '200': 86, '300': 76, '400': 64,
    '500': 50, '600': 40, '700': 32, '800': 24, '900': 17, '950': 10,
  };
  const scale: Record<string, string> = {};
  for (const [step, l] of Object.entries(lightnesses)) {
    scale[step] = `hsl(${h}, ${s}%, ${l}%)`;
  }
  return scale;
}
```

## Token File: CSS Custom Properties
```css
/* src/styles/tokens.css */

/* === Color Tokens (Dark-First) === */
:root {
  /* Brand primaries */
  --color-bg: #060610;
  --color-bg-secondary: #0a0a1a;
  --color-bg-tertiary: #121225;
  --color-bg-card: #0f0f1f;
  --color-bg-elevated: #1a1a35;

  /* Cyan scale (#00E5FF) */
  --color-cyan-50: hsl(187, 100%, 97%);
  --color-cyan-100: hsl(187, 100%, 94%);
  --color-cyan-200: hsl(187, 100%, 86%);
  --color-cyan-300: hsl(187, 100%, 76%);
  --color-cyan-400: hsl(187, 100%, 64%);
  --color-cyan-500: #00E5FF;
  --color-cyan-600: hsl(187, 100%, 40%);
  --color-cyan-700: hsl(187, 100%, 32%);
  --color-cyan-800: hsl(187, 100%, 24%);
  --color-cyan-900: hsl(187, 100%, 17%);
  --color-cyan-950: hsl(187, 100%, 10%);

  /* Blue scale (#50AAE3) */
  --color-blue-50: hsl(207, 70%, 97%);
  --color-blue-100: hsl(207, 70%, 94%);
  --color-blue-200: hsl(207, 70%, 86%);
  --color-blue-300: hsl(207, 70%, 76%);
  --color-blue-400: hsl(207, 70%, 64%);
  --color-blue-500: #50AAE3;
  --color-blue-600: hsl(207, 70%, 40%);
  --color-blue-700: hsl(207, 70%, 32%);
  --color-blue-800: hsl(207, 70%, 24%);
  --color-blue-900: hsl(207, 70%, 17%);
  --color-blue-950: hsl(207, 70%, 10%);

  /* Purple scale (#7C3AED) */
  --color-purple-50: hsl(263, 83%, 97%);
  --color-purple-100: hsl(263, 83%, 94%);
  --color-purple-200: hsl(263, 83%, 86%);
  --color-purple-300: hsl(263, 83%, 76%);
  --color-purple-400: hsl(263, 83%, 64%);
  --color-purple-500: #7C3AED;
  --color-purple-50: hsl(263, 83%, 97%);
  --color-purple-600: hsl(263, 83%, 40%);
  --color-purple-700: hsl(263, 83%, 32%);
  --color-purple-800: hsl(263, 83%, 24%);
  --color-purple-900: hsl(263, 83%, 17%);
  --color-purple-950: hsl(263, 83%, 10%);

  /* Text */
  --color-text: #f0f0f5;
  --color-text-secondary: #a0a0b5;
  --color-text-muted: #606080;

  /* Borders */
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-hover: rgba(255, 255, 255, 0.12);

  /* Semantic */
  --color-action: var(--color-cyan-500);
  --color-action-hover: var(--color-cyan-400);
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;

  /* === Spacing (4px base) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --space-32: 128px;

  /* === Typography (modular scale 1.25 — minor third) === */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.563rem;    /* 25px */
  --text-2xl: 1.953rem;   /* 31.25px */
  --text-3xl: 2.441rem;   /* 39px */
  --text-4xl: 3.052rem;   /* 48.8px */
  --text-hero: 3.815rem;  /* 61px */

  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.04em;
  --tracking-widest: 0.1em;

  /* === Shadows === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
  --shadow-glow-cyan: 0 0 20px rgba(0, 229, 255, 0.15);
  --shadow-glow-purple: 0 0 20px rgba(124, 58, 237, 0.15);

  /* === Border Radius === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* === Transitions === */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

/* === Light Theme Overrides === */
[data-theme="light"] {
  --color-bg: #f8f9fa;
  --color-bg-secondary: #f0f1f3;
  --color-bg-tertiary: #e8e9eb;
  --color-bg-card: #ffffff;
  --color-bg-elevated: #ffffff;
  --color-text: #1a1a2e;
  --color-text-secondary: #4a4a6a;
  --color-text-muted: #8a8aa0;
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-hover: rgba(0, 0, 0, 0.16);
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.15);
}
```

## Token File: TypeScript Constants
```typescript
// src/styles/tokens.ts
export const colors = {
  bg: '#060610',
  bgSecondary: '#0a0a1a',
  bgTertiary: '#121225',
  bgCard: '#0f0f1f',
  bgElevated: '#1a1a35',
  cyan: { 50: 'hsl(187,100%,97%)', 500: '#00E5FF', 900: 'hsl(187,100%,17%)' },
  blue: { 50: 'hsl(207,70%,97%)', 500: '#50AAE3', 900: 'hsl(207,70%,17%)' },
  purple: { 50: 'hsl(263,83%,97%)', 500: '#7C3AED', 900: 'hsl(263,83%,17%)' },
  text: '#f0f0f5',
  textSecondary: '#a0a0b5',
  textMuted: '#606080',
  action: '#00E5FF',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
} as const;

export const spacing = {
  1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px',
  8: '32px', 12: '48px', 16: '64px', 24: '96px', 32: '128px',
} as const;

export const fontSize = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.25rem',
  xl: '1.563rem', '2xl': '1.953rem', '3xl': '2.441rem',
  '4xl': '3.052rem', hero: '3.815rem',
} as const;

export const radius = { sm: '4px', md: '8px', lg: '12px', full: '9999px' } as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof fontSize;
export type RadiusToken = keyof typeof radius;
```

## Usage
```css
/* Apply tokens */
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: border-color var(--duration-normal) var(--ease-default),
              box-shadow var(--duration-normal) var(--ease-default);
}
.card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-glow-cyan);
}
```

Dark-first: all tokens defined for dark. Light is the override, not the default. `prefers-color-scheme: light` maps to `[data-theme="light"]`. Never hardcode colors — always reference tokens.
