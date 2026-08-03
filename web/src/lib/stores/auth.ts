// lib/stores/auth.ts
// Svelte store replacement for the old React AuthContext.
// Holds the logged-in user + role, drives the root layout's redirect choice.
// Phase 1 wires this up to lib/services/auth.ts + lib/services/storage.ts.

import { writable } from 'svelte/store';

export type Role = 'admin' | 'teacher' | 'student';

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
}

function createAuthStore() {
  const { subscribe, set } = writable<AuthUser | null>(null);

  return {
    subscribe,
    login: (user: AuthUser) => set(user),
    logout: () => set(null)
  };
}

export const authUser = createAuthStore();
export const isLoading = writable(false);
