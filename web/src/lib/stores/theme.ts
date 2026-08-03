// lib/stores/theme.ts
// Thin re-export so components can pull tokens the same way screens
// used to via ThemeContext. For now just re-exports lib/utils/theme.ts.
// (Future dark-mode toggle can turn this into a real writable store.)

import { colors, spacing, radius, typography, motion, statusColor } from '../utils/theme';

export const theme = { colors, spacing, radius, typography, motion, statusColor };
export type Theme = typeof theme;
