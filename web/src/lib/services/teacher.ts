// lib/services/teacher.ts
import { api } from './api';

export interface Teacher {
  teacher_id: number;
  name: string;
  email: string;
  department: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface TeacherListResult {
  teachers: Teacher[];
  page: number;
  limit: number;
  total: number;
}

export async function listTeachers(page = 1, limit = 20, search = ''): Promise<TeacherListResult> {
  const { data } = await api.get('/teachers', { params: { page, limit, search } });
  return data.data;
}

export async function getTeacher(id: number): Promise<Teacher> {
  const { data } = await api.get(`/teachers/${id}`);
  return data.data.teacher;
}

export interface CreateTeacherInput {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export async function createTeacher(input: CreateTeacherInput): Promise<Teacher> {
  const { data } = await api.post('/teachers', input);
  return data.data.teacher;
}

export interface UpdateTeacherInput {
  name?: string;
  email?: string;
  department?: string;
  password?: string;
}

export async function updateTeacher(id: number, input: UpdateTeacherInput): Promise<Teacher> {
  const { data } = await api.put(`/teachers/${id}`, input);
  return data.data.teacher;
}

export async function deleteTeacher(id: number): Promise<void> {
  await api.delete(`/teachers/${id}`);
}