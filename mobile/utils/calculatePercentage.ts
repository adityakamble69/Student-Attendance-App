// utils/calculatePercentage.ts
// Per rules.md §5: attendance % logic must live in ONE shared function,
// reused by both API and any client-side preview — this is the client copy,
// the backend equivalent belongs in backend/services/attendanceService.js (Phase 3).
export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}
