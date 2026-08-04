// lib/services/auth.ts — talks to backend/routes/authRoutes.js
import { api } from './api';
import type { Role } from '../stores/auth';

export interface AuthResponseUser {
  id: number;
  role: Role;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthResponseUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(role: Role, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', { role, email, password });
  return data.data as AuthResponse;
}

export async function register(payload: {
  role: Role;
  name: string;
  email: string;
  password: string;
  rollNo?: string;
  phone?: string;
  department?: string;
  semester?: number;
  section?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', payload);
  return data.data as AuthResponse;
}

export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}