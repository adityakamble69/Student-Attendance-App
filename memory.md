# memory.md — Project Memory / Progress Tracker

> Update this file every time a task, file, or phase is completed. This is the single source of truth for "what's done" and "what's in progress" across sessions.

## Current Status
- **Current Phase:** Phase 0 — Project Setup (backend done + verified, web skeleton done)
- **Currently Working On:** nothing — Phase 0 complete, ready for Phase 1 (Auth & Roles)
- **Last Updated:** 2026-08-03

## Completed
- [x] PRD.md, architecture.md, rules.md, phases.md, design.md, memory.md (planning docs)
- [x] Phase 0 — `backend/` initialized: Express server, config (env/db/cloudinary/firebase),
      middleware (auth/role/error/rateLimiter), full route tree stubbed for every domain
      (`/api/v1/...`), `package.json` deps installed, **server boots and `/api/v1/health`
      + `/api/v1/auth/ping` verified working** (MySQL not connected in this sandbox — expected,
      no local DB server here; will connect once Railway/Render DB exists)
- [x] Phase 0 — `database/attendance.sql` written: students, teachers, admins (added — needed
      for a distinct admin login role, wasn't in original entity list), subjects, classes,
      class_enrollments (added — source of truth for "students in this class", needed by
      Phase 3), attendance, leave_requests, plus indexes
- [x] ~~Phase 0 — `mobile/` JS/TS skeleton (React Native)~~ — **replaced by `web/`, see
      2026-08-03 decision below.**
- [x] Phase 0 — `web/` SvelteKit skeleton: 1:1 port of the old mobile skeleton —
      `src/routes/+layout.svelte` (role-based route guard, was RootNavigator), `login/`
      `admin/` `teacher/` `student/` routes (were the four navigation stacks + screens),
      `lib/stores/auth.ts` + `lib/stores/theme.ts` (were AuthContext/ThemeContext),
      `lib/utils/theme.ts` (ported 1:1 from design.md tokens, unchanged), `lib/services/api.ts`
      (shared axios instance w/ interceptor hooks, unchanged), auth.ts/attendance.ts/storage.ts
      service stubs (`storage.ts` now uses `localStorage` instead of EncryptedStorage — flagged
      as an open question below), hooks (useAttendance, useGeolocation — now plain async
      functions instead of React hooks), utils (formatDate, calculatePercentage, validators).
      See web/README.md for the old-file → new-file map.

## In Progress
- _(none — Phase 0 closed out)_

## Up Next (Phase 1 — Authentication & Roles)
- [x] Backend: register/login/refresh controllers + bcrypt hashing + JWT issuing —
      `models/userModel.js`, `validators/authValidators.js`, `utils/tokenUtils.js`,
      `controllers/authController.js`, `routes/authRoutes.js`. Login takes `role` up
      front (client picks Admin/Teacher/Student) rather than searching all 3 role
      tables — cheaper query, and avoids leaking whether an email exists under a
      different role.
- [x] Backend: wire authMiddleware + roleMiddleware into protected routes —
      `/auth/logout` now requires a valid access token via `authMiddleware`
      (middleware already existed from Phase 0, just needed a route to protect).
- [x] Web: real LoginScreen UI (per design.md components), wire to lib/services/auth.ts —
      `routes/login/+page.svelte` (role pills + email/password form, design.md tokens
      inlined as scoped CSS), `lib/services/auth.ts` (role-aware login/register/refresh/
      logout calls matching the backend), `lib/stores/auth.ts` (persists session to
      storage on login, rehydrates via `init()` on app load, wires `configureApiAuth`
      so every request carries the access token and a 401 logs the user out).
      `+layout.svelte` now awaits `authUser.init()` before deciding redirects, so a page
      refresh doesn't bounce a logged-in user back to `/login`.
- [x] Web: decide on token storage strategy — kept `localStorage` for the Phase 1 MVP
      (see `lib/services/storage.ts` — flagged as an XSS-risk tradeoff, revisit if the
      app ever needs stronger session security; httpOnly cookies would need backend
      changes too, so deferred rather than blocking Phase 1).
- [ ] Web: `npm install && npm run dev` to confirm the Phase 0 routing shell boots

## Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-08-03 | Added `method` and `marked_at` fields to `attendance` table | Audit trail for anti-proxy method used |
| 2026-08-03 | Web Admin Panel excluded from v1 | Out of scope per PRD — admin uses mobile app too |
| 2026-08-03 | Design direction locked: ink/white/muted-gray palette, serif+Inter pairing, status as dots/chips only, row-hover pattern | Ported from user's fintech reference — see design.md rationale note |
| 2026-08-03 | Added `admins` table to schema | PRD/architecture assume a distinct admin login role but original entity summary omitted it |
| 2026-08-03 | Added `class_enrollments` table to schema | Needed as the source of truth for "which students are in this class" (architecture.md §2.1 step 2 assumes this exists) |
| 2026-08-03 | Native android/ios RN folders deferred to local machine | Sandbox has no Android Studio/Xcode/RN CLI native toolchain; JS/TS skeleton is complete and ready to drop into a native shell — **superseded same day, see next row** |
| 2026-08-03 | Replaced `mobile/` (React Native) with `web/` (SvelteKit) | Project direction changed from native mobile to web app; no native shell needed anymore, removes the android/ios toolchain dependency entirely |

## Known Issues / Open Questions
- [ ] Does approved leave exclude those days from attendance % calculation, or just get logged separately? (needs stakeholder decision before Phase 7)
- [ ] Which DB — PostgreSQL or MySQL — final call not yet made (schema written for MySQL; note in architecture.md still lists both)
- [ ] GPS geofence radius per campus — needs a configurable default value
- [ ] Token storage on web: `localStorage` (current stub) vs backend-issued httpOnly cookie —
      localStorage is XSS-readable, needs a security-conscious decision before Phase 1 auth
      is wired for real (see web/README.md notes)

## File Map (for quick orientation)
```
PRD.md            → what to build
architecture.md   → how it's structured, flows, schema, folder layout
rules.md          → what to do / avoid while coding
phases.md         → build order, phase by phase
design.md         → colors, typography, UI system
memory.md         → this file — current progress state
backend/          → Express API (Phase 0 scaffold verified; Phase 1 auth: register/
                    login/refresh/logout live under models/controllers/validators/utils)
web/              → SvelteKit + TypeScript app (Phase 0 skeleton, replaces old mobile/)
database/         → attendance.sql (base schema)
```