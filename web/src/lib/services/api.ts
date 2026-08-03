// lib/services/api.ts
// Single shared axios instance with token-refresh/401 interceptors (rules.md).
// Phase 1 fills in the actual refresh-token flow once auth.ts exists.

import axios from 'axios';

// TODO: move to a real config/env source (SvelteKit $env) once
// Railway/Render URLs exist — placeholder for local dev against the Phase 0 server.
const BASE_URL = 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

let getAccessToken: () => Promise<string | null> = async () => null;
let onUnauthorized: () => void = () => {};

export function configureApiAuth(opts: {
  getAccessToken: () => Promise<string | null>;
  onUnauthorized: () => void;
}) {
  getAccessToken = opts.getAccessToken;
  onUnauthorized = opts.onUnauthorized;
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Phase 1: attempt refresh-token flow here before giving up.
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
