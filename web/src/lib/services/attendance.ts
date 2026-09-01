// lib/services/attendance.ts — Phase 3: Teacher Attendance API endpoints.
import { api } from './api';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecordInput {
  studentId: number;
  status: AttendanceStatus;
}

export interface MarkAttendanceResult {
  message: string;
  count: number;
  date: string;
  classId: number;
}

export interface StudentAttendanceItem {
  student_id: number;
  roll_no: string;
  name: string;
  email: string;
  department: string | null;
  semester: number | null;
  section: string | null;
  attendance_id: number | null;
  status: AttendanceStatus | null;
  marked_by: string | null;
  method: string | null;
  marked_at: string | null;
}

export interface ClassAttendanceData {
  class: {
    class_id: number;
    subject_id: number;
    teacher_id: number;
    subject_name: string;
    teacher_name: string;
    room: string | null;
    day: string;
    start_time: string;
    end_time: string;
    section: string | null;
  };
  date: string;
  students: StudentAttendanceItem[];
  isMarked: boolean;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface AttendanceSessionSummary {
  date: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  last_marked_at: string;
  marked_by: string;
  method: string;
}

export interface AttendanceHistoryResult {
  class: {
    class_id: number;
    subject_name: string;
    teacher_name: string;
    section: string | null;
    room: string | null;
  };
  sessions: AttendanceSessionSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface TeacherClassOverview {
  class_id: number;
  subject_name: string;
  semester: number;
  room: string | null;
  day: string;
  start_time: string;
  end_time: string;
  section: string | null;
  is_marked_today: boolean;
}

export interface TeacherDashboardSummary {
  day: string;
  date: string;
  scheduledToday: number;
  completedToday: number;
  pendingToday: number;
  totalStudents: number;
  classes: TeacherClassOverview[];
}

/**
 * Mark or update batch attendance for a class.
 */
export async function markAttendanceManual(
  classId: number,
  date: string,
  records: AttendanceRecordInput[]
): Promise<MarkAttendanceResult> {
  const { data } = await api.post('/attendance/mark-manual', {
    classId,
    date,
    records,
  });
  return data.data;
}

/**
 * Get enrolled students and marked attendance status for a class on a specific date.
 */
export async function getClassAttendance(
  classId: number,
  date?: string
): Promise<ClassAttendanceData> {
  const { data } = await api.get(`/attendance/class/${classId}`, {
    params: { date },
  });
  return data.data;
}

/**
 * Get date-wise attendance history logs for a class.
 */
export async function getAttendanceHistory(
  classId: number,
  params?: { fromDate?: string; toDate?: string; page?: number; limit?: number }
): Promise<AttendanceHistoryResult> {
  const { data } = await api.get('/attendance/history', {
    params: { classId, ...params },
  });
  return data.data;
}

/**
 * Get teacher dashboard stats and today's classes overview.
 */
export async function getTeacherDashboardSummary(
  day?: string,
  date?: string
): Promise<TeacherDashboardSummary> {
  const { data } = await api.get('/attendance/teacher-summary', {
    params: { day, date },
  });
  return data.data;
}
