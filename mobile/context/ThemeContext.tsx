// context/ThemeContext.tsx
// Thin wrapper so screens can pull tokens from context if needed later
// (e.g. future dark-mode toggle). For now just re-exports utils/theme.ts.

import React, { createContext, useContext, ReactNode } from 'react';
import { colors, spacing, radius, typography, motion } from '../utils/theme';

const theme = { colors, spacing, radius, typography, motion };
type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
