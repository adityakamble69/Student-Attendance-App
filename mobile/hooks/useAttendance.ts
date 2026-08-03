// hooks/useAttendance.ts — Phase 3/4. Wraps services/attendance.ts calls
// with loading/error state for screens to consume.
import { useState } from 'react';
import { markAttendanceManual } from '../services/attendance';

export function useAttendance() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitManualAttendance(
    classId: number,
    records: Array<{ studentId: number; status: 'Present' | 'Absent' | 'Late' }>
  ) {
    setIsLoading(true);
    setError(null);
    try {
      return await markAttendanceManual(classId, records);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, submitManualAttendance };
}
