// lib/services/notification.ts — Phase 8: Notification Service.
import { api } from './api';

export interface NotificationItem {
  notification_id: number;
  title: string;
  message: string;
  type: string;
  target_role: string;
  recipient_id: number | null;
  sender_role: string;
  is_read: boolean;
  created_at: string;
}

export async function getMyNotifications(): Promise<NotificationItem[]> {
  const { data } = await api.get('/notifications/my');
  return data.data.notifications;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function sendBroadcast(input: { title: string; message: string; targetRole?: string }): Promise<NotificationItem> {
  const { data } = await api.post('/notifications/broadcast', input);
  return data.data.notification;
}
