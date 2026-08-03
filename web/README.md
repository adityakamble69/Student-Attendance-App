# Web — Phase 0 Notes

This folder replaces the old `mobile/` (React Native) client with a
**SvelteKit** app. It's a 1:1 port of the Phase 0 skeleton:

| Old (mobile/, React Native) | New (web/, SvelteKit) |
|---|---|
| `App.tsx` + `navigation/RootNavigator.tsx` | `src/routes/+layout.svelte` |
| `navigation/AuthStack.tsx` + `screens/auth/LoginScreen.tsx` | `src/routes/login/+page.svelte` |
| `navigation/AdminStack.tsx` + `screens/admin/AdminHomeScreen.tsx` | `src/routes/admin/+page.svelte` |
| `navigation/TeacherStack.tsx` + `screens/teacher/TeacherHomeScreen.tsx` | `src/routes/teacher/+page.svelte` |
| `navigation/StudentStack.tsx` + `screens/student/StudentHomeScreen.tsx` | `src/routes/student/+page.svelte` |
| `context/AuthContext.tsx` | `src/lib/stores/auth.ts` (Svelte store) |
| `context/ThemeContext.tsx` | `src/lib/stores/theme.ts` |
| `services/*.ts` | `src/lib/services/*.ts` (same, `storage.ts` now uses `localStorage` instead of `react-native-encrypted-storage`) |
| `hooks/*.ts` | `src/lib/hooks/*.ts` (plain async functions — Svelte components keep their own `let` state instead of React's `useState`) |
| `utils/*.ts` | `src/lib/utils/*.ts` (unchanged, framework-agnostic) |
| `components/` | `src/lib/components/` (still empty, same purpose) |
| `assets/` | `static/` |

## Getting started

```bash
cd web
npm install
npm run dev
```

## Notes / TODOs carried over from mobile

- `src/lib/services/storage.ts`: tokens currently sit in `localStorage`.
  Flag for a rules.md security review before Phase 1 — httpOnly cookies
  set by the backend are worth considering instead, since `localStorage`
  is readable by any script on the page (XSS risk). The RN version used
  `react-native-encrypted-storage`, which has no direct browser equivalent.
- `src/lib/hooks/useGeolocation.ts`: now wraps the browser
  `navigator.geolocation` API instead of `react-native-geolocation-service`.
  Still needs the pre-permission explanation screen before Phase 5.
- Everything under `src/routes/`, `src/lib/` is ready to use as-is —
  no native shell step needed like the old RN `android/`/`ios/` folders.
