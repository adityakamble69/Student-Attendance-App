// services/auth.ts — Phase 1 fills in real login/register/refresh calls.
import { api } from './api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function refreshToken(refreshToken: string) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
}
