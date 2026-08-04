// lib/services/storage.ts — token storage for the web client.
// Mobile used react-native-encrypted-storage; the browser has no direct
// equivalent, so tokens live in localStorage for now (guarded for SSR).
// TODO Phase 1: consider httpOnly cookies set by the backend instead of
// localStorage, since localStorage is readable by any script (XSS risk) —
// flag for rules.md security review before this goes further than Phase 0/1.

import { browser } from '$app/environment';

// Shared key names so auth.ts / stores/auth.ts don't hardcode strings in
// multiple places.
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'attendance_access_token',
  REFRESH_TOKEN: 'attendance_refresh_token',
  USER: 'attendance_user'
} as const;

export async function setToken(key: string, value: string) {
  if (!browser) return;
  localStorage.setItem(key, value);
}

export async function getToken(key: string): Promise<string | null> {
  if (!browser) return null;
  return localStorage.getItem(key);
}

export async function clearToken(key: string) {
  if (!browser) return;
  localStorage.removeItem(key);
}