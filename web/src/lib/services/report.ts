// lib/services/report.ts — Phase 6: Report Service.
import { api } from './api';

export interface ClassReportData {
  class: {
    class_id: number;
    subject_name: string;
    teacher_name: string;
    section: string | null;
    room: string | null;
  };
  records: Array<{
    date: string;
    roll_no: string;
    name: string;
    email: string;
    status: string;
    method: string;
    marked_at: string;
  }>;
  totalRecords: number;
}

export interface InstituteSummaryItem {
  subject_name: string;
  teacher_name: string;
  section: string | null;
  total_sessions: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  attendance_percentage: number;
}

export async function getClassReport(classId: number, params?: { fromDate?: string; toDate?: string }): Promise<ClassReportData> {
  const { data } = await api.get(`/reports/class/${classId}`, { params });
  return data.data;
}

export async function downloadClassCsv(classId: number, params?: { fromDate?: string; toDate?: string }): Promise<string> {
  const response = await api.get(`/reports/class/${classId}/csv`, {
    params,
    responseType: 'text',
  });
  return response.data;
}

export async function getInstituteReport(): Promise<{ summary: InstituteSummaryItem[] }> {
  const { data } = await api.get('/reports/institute');
  return data.data;
}

export async function downloadInstituteCsv(): Promise<string> {
  const response = await api.get('/reports/institute/csv', {
    responseType: 'text',
  });
  return response.data;
}
