// utils/theme.ts
// Single source of truth for design tokens — see design.md.
// Import this everywhere instead of hardcoding hex values or spacing.

export const colors = {
  ink: '#191919',
  ink70: '#191919B3',
  ink50: '#19191980',
  ink40: '#19191966',
  background: '#FFFFFF',
  surfaceMuted: '#F4F3F3',
  surfaceMutedPress: '#EAEAEA',
  borderHairline: '#E5E7EB',

  // Status accents — only place color beyond ink is used (design.md §2)
  present: '#16A34A',
  late: '#F59E0B',
  absent: '#DC2626',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screenPadding: 20,
};

export const radius = {
  card: 12,
  pill: 9999,
};

export const typography = {
  // Serif — ONLY for dashboard hero numbers + section headers (design.md §3)
  displaySerif: {
    fontFamily: "'PT Serif', serif",
    fontWeight: '400' as const,
  },
  // Sans — everything else
  ui: {
    fontFamily: "'Inter', sans-serif",
  },
  scale: {
    dashboardStat: 44,
    screenTitle: 24,
    sectionHeader: 18,
    body: 14,
    microLabel: 11,
    caption: 12,
  },
};

export const motion = {
  pressDurationMs: 200,
};

export const statusColor: Record<'Present' | 'Late' | 'Absent', string> = {
  Present: colors.present,
  Late: colors.late,
  Absent: colors.absent,
};
