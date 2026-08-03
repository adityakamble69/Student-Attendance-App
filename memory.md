# memory.md — Project Memory / Progress Tracker

> Update this file every time a task, file, or phase is completed. This is the single source of truth for "what's done" and "what's in progress" across sessions.

## Current Status
- **Current Phase:** Phase 0 — Project Setup (backend done + verified, mobile skeleton done)
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
- [x] Phase 0 — `mobile/` JS/TS skeleton: App.tsx, role-based RootNavigator + Auth/Admin/
      Teacher/Student stacks, AuthContext, ThemeContext, shared `utils/theme.ts` (ported
      1:1 from design.md tokens), `services/api.ts` (shared axios instance w/ interceptor
      hooks), auth.ts/attendance.ts/storage.ts service stubs, hooks (useAuth, useAttendance,
      useGeolocation), utils (formatDate, calculatePercentage, validators), placeholder
      screens per role. **Native android/ios folders NOT generated** (no RN CLI/Android
      Studio/Xcode in this sandbox) — see mobile/README.md for the one-time step to add them.

## In Progress
- _(none — Phase 0 closed out)_

## Up Next (Phase 1 — Authentication & Roles)
- [ ] Backend: register/login/refresh controllers + bcrypt hashing + JWT issuing
- [ ] Backend: wire authMiddleware + roleMiddleware into protected routes
- [ ] Mobile: real LoginScreen UI (per design.md components), wire to services/auth.ts
- [ ] Mobile: secure token storage via services/storage.ts (EncryptedStorage)
- [ ] Mobile: generate android/ios native folders locally (see mobile/README.md), confirm
      `npm run android` boots the Phase 0 navigation shell

## Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-08-03 | Added `method` and `marked_at` fields to `attendance` table | Audit trail for anti-proxy method used |
| 2026-08-03 | Web Admin Panel excluded from v1 | Out of scope per PRD — admin uses mobile app too |
| 2026-08-03 | Design direction locked: ink/white/muted-gray palette, serif+Inter pairing, status as dots/chips only, row-hover pattern | Ported from user's fintech reference — see design.md rationale note |
| 2026-08-03 | Added `admins` table to schema | PRD/architecture assume a distinct admin login role but original entity summary omitted it |
| 2026-08-03 | Added `class_enrollments` table to schema | Needed as the source of truth for "which students are in this class" (architecture.md §2.1 step 2 assumes this exists) |
| 2026-08-03 | Native android/ios RN folders deferred to local machine | Sandbox has no Android Studio/Xcode/RN CLI native toolchain; JS/TS skeleton is complete and ready to drop into a native shell |

## Known Issues / Open Questions
- [ ] Does approved leave exclude those days from attendance % calculation, or just get logged separately? (needs stakeholder decision before Phase 7)
- [ ] Which DB — PostgreSQL or MySQL — final call not yet made (schema written for MySQL; note in architecture.md still lists both)
- [ ] GPS geofence radius per campus — needs a configurable default value

## File Map (for quick orientation)
```
PRD.md            → what to build
architecture.md   → how it's structured, flows, schema, folder layout
rules.md          → what to do / avoid while coding
phases.md         → build order, phase by phase
design.md         → colors, typography, UI system
memory.md         → this file — current progress state
backend/          → Express API (Phase 0 scaffold, verified running)
mobile/           → React Native + TypeScript app (Phase 0 JS/TS skeleton)
database/         → attendance.sql (base schema)
```
