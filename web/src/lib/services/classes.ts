// lib/services/classes.ts
// A "class" here = subject + teacher + timing slot.
import { api } from './api';

export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ClassItem {
  class_id: number;
  subject_id: number;
  teacher_id: number;
  subject_name: string;
  teacher_name: string;
  room: string | null;
  day: Day;
  start_time: string;
  end_time: string;
  section: string | null;
  enrolled_count?: number;
  is_marked?: boolean;
}

export interface ClassListResult {
  classes: ClassItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ClassStudentItem {
  student_id: number;
  roll_no: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  semester: number | null;
  section: string | null;
}

export interface ClassRosterResult {
  class: ClassItem;
  students: ClassStudentItem[];
  total: number;
}

export async function listClasses(page = 1, limit = 20): Promise<ClassListResult> {
  const { data } = await api.get('/classes', { params: { page, limit } });
  return data.data;
}

export async function getClass(id: number): Promise<ClassItem> {
  const { data } = await api.get(`/classes/${id}`);
  return data.data.class;
}

export async function getMyClasses(params?: { day?: string; date?: string }): Promise<ClassItem[]> {
  const { data } = await api.get('/classes/my-classes', { params });
  return data.data.classes;
}

export async function getClassStudents(id: number): Promise<ClassRosterResult> {
  const { data } = await api.get(`/classes/${id}/students`);
  return data.data;
}

export interface CreateClassInput {
  subjectId: number;
  teacherId: number;
  room?: string;
  day: Day;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  section?: string;
}

export async function createClass(input: CreateClassInput): Promise<ClassItem> {
  const { data } = await api.post('/classes', input);
  return data.data.class;
}

export type UpdateClassInput = Partial<CreateClassInput>;

export async function updateClass(id: number, input: UpdateClassInput): Promise<ClassItem> {
  const { data } = await api.put(`/classes/${id}`, input);
  return data.data.class;
}

export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/${id}`);
}

export async function enrollStudentsInClass(id: number, studentIds: number[]): Promise<void> {
  await api.post(`/classes/${id}/enroll`, { studentIds });
}

export async function enrollBySection(
  id: number,
  filter: { semester?: number; section?: string; department?: string }
): Promise<void> {
  await api.post(`/classes/${id}/enroll-section`, filter);
}

export async function unenrollStudent(id: number, studentId: number): Promise<void> {
  await api.delete(`/classes/${id}/enroll/${studentId}`);
}