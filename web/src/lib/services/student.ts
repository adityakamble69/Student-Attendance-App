// lib/services/student.ts
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

export async function listStudents(page = 1, limit = 20, search = ''): Promise<StudentListResult> {
  const { data } = await api.get('/students', { params: { page, limit, search } });
  return data.data;
}

export async function getStudent(id: number): Promise<Student> {
  const { data } = await api.get(`/students/${id}`);
  return data.data.student;
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

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const { data } = await api.post('/students', input);
  return data.data.student;
}

export interface UpdateStudentInput {
  rollNo?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  department?: string;
  semester?: number;
  section?: string;
}

export async function updateStudent(id: number, input: UpdateStudentInput): Promise<Student> {
  const { data } = await api.put(`/students/${id}`, input);
  return data.data.student;
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`);
}