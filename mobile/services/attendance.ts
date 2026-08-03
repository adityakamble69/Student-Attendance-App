// services/attendance.ts — Phase 3+ fills in real endpoints.
import { api } from './api';

export async function markAttendanceManual(classId: number, records: Array<{ studentId: number; status: 'Present' | 'Absent' | 'Late' }>) {
  const { data } = await api.post(`/attendance/manual`, { classId, records });
  return data;
}
