# rules.md — Development Rules for Student Attendance App

## 1. General Principles
- Build one phase at a time (see `phases.md`). Do not start Phase N+1 before Phase N is working and tested.
- Every feature must map to a requirement in `PRD.md`. If it doesn't, flag it before building it.
- Always update `memory.md` after completing a task or file — this is the single source of truth for "what's done."

## 2. Code Conventions

### Backend (Node.js + Express)
- ✅ Use `routes → controllers → models` separation. Never put DB queries directly in route files.
- ✅ All routes protected by role go through `authMiddleware` then `roleMiddleware(['admin'])` etc.
- ✅ Use async/await with try/catch, never unhandled promise rejections.
- ✅ All input validated (e.g. via `zod`/`joi`) before hitting the DB layer.
- ❌ Never trust `student_id`/`teacher_id` from the request body for identity — always derive from the JWT.
- ❌ Never store plaintext passwords — bcrypt only.
- ❌ Never log full JWTs, passwords, or OTP codes to console/files in production.

### Mobile (React Native + TypeScript)
- ✅ Strict TypeScript — no implicit `any`.
- ✅ Screens stay thin; business/API logic lives in `services/` and `hooks/`.
- ✅ Use one shared `api.ts` axios instance with interceptors for token refresh/401 handling.
- ✅ All user-facing text should support easy localization later (avoid hardcoding deep in components where possible).
- ❌ No inline styles scattered ad hoc — use the shared theme (see `design.md`).
- ❌ Don't call GPS/Camera permissions without a clear pre-permission explanation screen/toast.

## 3. Security Rules (Non-Negotiable)
- QR session tokens and OTP codes must always be **time-bound** and **single-use**.
- GPS attendance must validate distance server-side, never trust client-reported "inside campus" boolean.
- Rate-limit OTP generation and QR scan endpoints to prevent brute force.
- Every attendance write stores `marked_by` + `method` + `marked_at` for auditability — never skip this.
- Admin-only actions (delete teacher/student, export all data) require explicit role check, not just "logged in."

## 4. Git & Workflow
- Branch per phase/feature: `phase-1-auth`, `feature-qr-attendance`, etc.
- Commit messages: `[backend] add attendance controller` / `[mobile] build QR scanner screen`.
- No direct commits to `main` once Phase 1 is done — use PRs even if solo, for a clean history.

## 5. What to Avoid
- ❌ Don't build the Web Admin Panel in v1 — out of scope (see PRD §8).
- ❌ Don't add biometric/face-recognition attendance in v1.
- ❌ Don't over-engineer multi-tenancy before single-institute flow is proven.
- ❌ Don't couple attendance % calculation logic in multiple places — compute it in one shared function/service, reused by both API and any client-side preview.
- ❌ Don't skip error states in UI (empty attendance, no timetable today, network failure) — always design the empty/error state, not just the happy path.

## 6. Testing Expectations
- Backend: at minimum, test attendance-marking edge cases (duplicate marking, expired OTP, out-of-geofence, unauthorized role).
- Mobile: manually verify each role's navigation stack doesn't leak into another role's screens.
