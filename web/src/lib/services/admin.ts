// lib/services/admin.ts
import { api } from './api';

export interface DashboardCounts {
  totalTeachers: number;
  totalStudents: number;
  totalSubjects: number;
  totalClasses: number;
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
}