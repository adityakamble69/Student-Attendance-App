// lib/services/classes.ts
// A "class" here = subject + teacher + timing slot. Creating/editing one
// is how an admin assigns a teacher to a subject (see backend
// models/classModel.js for the reasoning — no separate assignment table).

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
}

export interface ClassListResult {
  classes: ClassItem[];
  page: number;
  limit: number;
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