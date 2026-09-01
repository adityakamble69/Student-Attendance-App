// lib/services/student.ts — Phase 2 (Admin CRUD) + Phase 4 (Student Core Self-Service)
import { api } from './api';

export interface Student {
  student_id: number;
  roll_no: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  semester: number | null;
  section: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface StudentListResult {
  students: Student[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateStudentInput {
  rollNo: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  semester?: number;
  section?: string;
}

export type UpdateStudentInput = Partial<CreateStudentInput>;

// Admin CRUD functions
export async function listStudents(page = 1, limit = 20, search = ''): Promise<StudentListResult> {
  const { data } = await api.get('/students', { params: { page, limit, search } });
  return data.data;
}

export async function getStudent(id: number): Promise<Student> {
  const { data } = await api.get(`/students/${id}`);
  return data.data.student;
}

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const { data } = await api.post('/students', input);
  return data.data.student;
}

export async function updateStudent(id: number, input: UpdateStudentInput): Promise<Student> {
  const { data } = await api.put(`/students/${id}`, input);
  return data.data.student;
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`);
}

// Student Self-Service interfaces & functions (Phase 4)

export interface StudentTimetableSlot {
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
  department: string | null;
  semester: number | null;
}

export interface SubjectAttendanceStat {
  subject_id: number;
  subject_name: string;
  teacher_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  percentage: number;
}

export interface StudentStatsResult {
  student: {
    student_id: number;
    name: string;
    roll_no: string;
    email: string;
    department: string | null;
    semester: number | null;
    section: string | null;
  };
  overallPercentage: number;
  totalMarked: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  subjectBreakdown: SubjectAttendanceStat[];
}

export interface StudentAttendanceRecord {
  attendance_id: number;
  class_id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  method: string;
  marked_at: string;
  subject_name: string;
  teacher_name: string;
  room: string | null;
  section: string | null;
  start_time: string;
  end_time: string;
}

export interface StudentHistoryResult {
  records: StudentAttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export async function getMyTimetable(day?: string): Promise<{ timetable: StudentTimetableSlot[]; day: string }> {
  const { data } = await api.get('/students/me/timetable', { params: { day } });
  return data.data;
}

export async function getMyStats(): Promise<StudentStatsResult> {
  const { data } = await api.get('/students/me/stats');
  return data.data;
}

export async function getMyHistory(params?: {
  subjectId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}): Promise<StudentHistoryResult> {
  const { data } = await api.get('/students/me/history', { params });
  return data.data;
}