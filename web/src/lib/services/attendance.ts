// lib/services/attendance.ts — Phase 3 (Teacher Manual) + Phase 5 (Smart QR/OTP/GPS)
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

export interface QrSessionData {
  classId: number;
  teacherId: number;
  date: string;
  token: string;
  expiresAt: number;
  nextRotationAt: number;
  rotationSeconds: number;
  active?: boolean;
}

export interface OtpSessionData {
  classId: number;
  teacherId: number;
  date: string;
  code: string;
  expiresAt: number;
  ttlSeconds: number;
  remainingSeconds?: number;
  active?: boolean;
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

export async function getClassAttendance(
  classId: number,
  date?: string
): Promise<ClassAttendanceData> {
  const { data } = await api.get(`/attendance/class/${classId}`, {
    params: { date },
  });
  return data.data;
}

export async function getAttendanceHistory(
  classId: number,
  params?: { fromDate?: string; toDate?: string; page?: number; limit?: number }
): Promise<AttendanceHistoryResult> {
  const { data } = await api.get('/attendance/history', {
    params: { classId, ...params },
  });
  return data.data;
}

export async function getTeacherDashboardSummary(
  day?: string,
  date?: string
): Promise<TeacherDashboardSummary> {
  const { data } = await api.get('/attendance/teacher-summary', {
    params: { day, date },
  });
  return data.data;
}

// Phase 5: QR Code Attendance Methods
export async function startQrSession(classId: number, date?: string): Promise<QrSessionData> {
  const { data } = await api.post('/attendance/qr/start', { classId, date });
  return data.data;
}

export async function getActiveQrSession(classId: number): Promise<QrSessionData> {
  const { data } = await api.get(`/attendance/qr/active/${classId}`);
  return data.data;
}

export async function rotateQrSession(classId: number): Promise<QrSessionData> {
  const { data } = await api.post(`/attendance/qr/rotate/${classId}`);
  return data.data;
}

export async function scanQrAttendance(input: {
  classId: number;
  token: string;
  lat?: number;
  lng?: number;
}): Promise<{ message: string; status: string; date: string }> {
  const { data } = await api.post('/attendance/qr/scan', input);
  return data.data;
}

// Phase 5: OTP Attendance Methods
export async function generateOtpSession(classId: number, date?: string): Promise<OtpSessionData> {
  const { data } = await api.post('/attendance/otp/generate', { classId, date });
  return data.data;
}

export async function getActiveOtpSession(classId: number): Promise<OtpSessionData> {
  const { data } = await api.get(`/attendance/otp/active/${classId}`);
  return data.data;
}

export async function submitOtpAttendance(input: {
  classId: number;
  code: string;
  lat?: number;
  lng?: number;
}): Promise<{ message: string; status: string; date: string }> {
  const { data } = await api.post('/attendance/otp/submit', input);
  return data.data;
}

// Phase 5: GPS Attendance Method
export async function markGpsAttendance(input: {
  classId: number;
  lat: number;
  lng: number;
}): Promise<{ message: string; distanceMeters: number }> {
  const { data } = await api.post('/attendance/gps/mark', input);
  return data.data;
}
