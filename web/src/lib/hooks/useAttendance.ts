// lib/hooks/useAttendance.ts — Phase 3/4. Wraps lib/services/attendance.ts
// calls with loading/error state for components to consume.

import { markAttendanceManual, type AttendanceRecordInput } from '../services/attendance';

export async function submitManualAttendance(
  classId: number,
  date: string,
  records: AttendanceRecordInput[]
) {
  return markAttendanceManual(classId, date, records);
}
