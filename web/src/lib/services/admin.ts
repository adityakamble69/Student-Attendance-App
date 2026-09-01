// lib/services/admin.ts — Phase 2 + Phase 6: Admin Analytics Service.
import { api } from './api';

export interface DepartmentStat {
  department: string;
  student_count: number;
}

export interface LowAttendanceAlert {
  student_id: number;
  roll_no: string;
  name: string;
  department: string | null;
  section: string | null;
  total_records: number;
  present_count: number;
  percentage: number;
}

export interface AdminDashboardData {
  totalTeachers: number;
  totalStudents: number;
  totalSubjects: number;
  totalClasses: number;
  pendingLeaves: number;
  todayStats: {
    date: string;
    totalMarked: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendancePercentage: number;
  };
  departments: DepartmentStat[];
  lowAttendanceAlerts: LowAttendanceAlert[];
}

export async function getDashboardCounts(): Promise<AdminDashboardData> {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
}