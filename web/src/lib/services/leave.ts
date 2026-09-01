// lib/services/leave.ts — Phase 7: Leave Service.
import { api } from './api';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveItem {
  leave_id: number;
  student_id: number;
  reason: string;
  from_date: string;
  to_date: string;
  status: LeaveStatus;
  reviewed_by: number | null;
  created_at: string;
  student_name?: string;
  roll_no?: string;
  department?: string | null;
  section?: string | null;
  semester?: number | null;
}

export interface ApplyLeaveInput {
  reason: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
}

export async function applyLeave(input: ApplyLeaveInput): Promise<LeaveItem> {
  const { data } = await api.post('/leave/apply', input);
  return data.data.leave;
}

export async function getMyLeaves(): Promise<LeaveItem[]> {
  const { data } = await api.get('/leave/my');
  return data.data.leaves;
}

export async function listAllLeaves(status?: LeaveStatus): Promise<{ leaves: LeaveItem[]; total: number }> {
  const { data } = await api.get('/leave', { params: { status } });
  return data.data;
}

export async function reviewLeave(leaveId: number, status: 'Approved' | 'Rejected'): Promise<LeaveItem> {
  const { data } = await api.patch(`/leave/${leaveId}/review`, { status });
  return data.data.leave;
}
