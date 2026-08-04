// lib/stores/auth.ts
// Svelte store replacement for the old React AuthContext.
// Holds the logged-in user + role, drives the root layout's redirect choice,
// and persists/restores the session via lib/services/storage.ts.

import { writable, get } from 'svelte/store';
import { getToken, setToken, clearToken, STORAGE_KEYS } from '../services/storage';
import { configureApiAuth } from '../services/api';
import * as authService from '../services/auth';

export type Role = 'admin' | 'teacher' | 'student';

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
  email: string;
}

function createAuthStore() {
  const { subscribe, set } = writable<AuthUser | null>(null);

  async function persistSession(user: AuthUser, accessToken: string, refreshToken: string) {
    await setToken(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await setToken(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await setToken(STORAGE_KEYS.USER, JSON.stringify(user));
    set(user);
  }

  async function login(role: Role, email: string, password: string) {
    const { user, accessToken, refreshToken } = await authService.login(role, email, password);
    await persistSession(user, accessToken, refreshToken);
    return user;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Best-effort — still clear local session even if the request fails
      // (e.g. token already expired).
    }
    await clearToken(STORAGE_KEYS.ACCESS_TOKEN);
    await clearToken(STORAGE_KEYS.REFRESH_TOKEN);
    await clearToken(STORAGE_KEYS.USER);
    set(null);
  }

  // Called once from the root layout on mount — rehydrates the store from
  // localStorage so a page refresh doesn't bounce the user back to /login.
  async function init() {
    const [accessToken, userJson] = await Promise.all([
      getToken(STORAGE_KEYS.ACCESS_TOKEN),
      getToken(STORAGE_KEYS.USER)
    ]);
    if (accessToken && userJson) {
      set(JSON.parse(userJson) as AuthUser);
    }
  }

  return { subscribe, login, logout, init };
}

export const authUser = createAuthStore();
export const isLoading = writable(false);

// Wire the shared axios instance to this store: every request attaches the
// current access token, and a 401 forces the user back to logged-out state.
// (Refresh-token retry-on-401 lands alongside Phase 2's longer sessions —
// for now a 401 just logs the user out cleanly.)
configureApiAuth({
  getAccessToken: () => getToken(STORAGE_KEYS.ACCESS_TOKEN),
  onUnauthorized: () => {
    if (get(authUser)) {
      authUser.logout();
    }
  }
});