// lib/hooks/useAttendance.ts — Phase 3/4. Wraps lib/services/attendance.ts
// calls with loading/error state for components to consume.
// React version used useState; Svelte components just declare local
// `let` state and call these plain functions directly, e.g.:
//
//   let isLoading = false;
//   let error: string | null = null;
//   const result = await submitManualAttendance(classId, records);

import { markAttendanceManual } from '../services/attendance';

export async function submitManualAttendance(
  classId: number,
  records: Array<{ studentId: number; status: 'Present' | 'Absent' | 'Late' }>
) {
  return markAttendanceManual(classId, records);
}
