// lib/services/subject.ts
import { api } from './api';

export interface Subject {
  subject_id: number;
  subject_name: string;
  semester: number | null;
  department: string | null;
}

export interface SubjectListResult {
  subjects: Subject[];
  page: number;
  limit: number;
  total: number;
}

export async function listSubjects(page = 1, limit = 20, search = ''): Promise<SubjectListResult> {
  const { data } = await api.get('/subjects', { params: { page, limit, search } });
  return data.data;
}

export async function getSubject(id: number): Promise<Subject> {
  const { data } = await api.get(`/subjects/${id}`);
  return data.data.subject;
}

export interface CreateSubjectInput {
  subjectName: string;
  semester?: number;
  department?: string;
}

export async function createSubject(input: CreateSubjectInput): Promise<Subject> {
  const { data } = await api.post('/subjects', input);
  return data.data.subject;
}

export interface UpdateSubjectInput {
  subjectName?: string;
  semester?: number;
  department?: string;
}

export async function updateSubject(id: number, input: UpdateSubjectInput): Promise<Subject> {
  const { data } = await api.put(`/subjects/${id}`, input);
  return data.data.subject;
}

export async function deleteSubject(id: number): Promise<void> {
  await api.delete(`/subjects/${id}`);
}