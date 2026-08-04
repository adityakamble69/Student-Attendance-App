# memory.md — Project Memory / Progress Tracker

> Update this file every time a task, file, or phase is completed. This is the single source of truth for "what's done" and "what's in progress" across sessions.

## Current Status
- **Current Phase:** Phase 2 — Admin Core / Master Data — **backend + web CRUD screens built, NOT YET verified end-to-end** (needs to be run against a real DB on the user's machine, same as Phase 1)
- **Currently Working On:** nothing — next session should verify Phase 2 locally, then move to Phase 3 (Teacher Core)
- **Last Updated:** 2026-08-04

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
- [x] Phase 1 — Authentication & Roles (backend + web), verified end-to-end on the
      user's local machine: register/login/refresh/logout API (`models/userModel.js`,
      `validators/authValidators.js`, `utils/tokenUtils.js`, `controllers/authController.js`,
      `routes/authRoutes.js` — login takes `role` up front rather than searching all 3
      role tables), real Login screen (`routes/login/+page.svelte` — role pills +
      email/password form per design.md), `lib/services/auth.ts` + `lib/stores/auth.ts`
      (session persisted to `localStorage`, rehydrated via `init()` on app load, axios
      wired via `configureApiAuth` so every request carries the token and a 401 logs
      the user out), `+layout.svelte` awaits session rehydration before redirecting.
      Token storage: kept `localStorage` for the MVP (flagged XSS-risk tradeoff in
      Known Issues, revisit later). Confirmed working: register + login via
      Invoke-RestMethod, Login screen renders, login redirects to role dashboard.

## In Progress
- _(none — Phase 2 code written this session; needs local verification before being marked done)_

## Completed — Phase 2 (Admin Core / Master Data) — code written, **unverified**
- [x] Backend: Teacher CRUD — `models/teacherModel.js`, `controllers/teacherController.js`,
      `validators/teacherValidators.js`, `routes/teacherRoutes.js`. Admin-only
      (`authMiddleware` + `roleMiddleware(['admin'])`). Delete is blocked if the teacher
      still has classes assigned (classes.teacher_id is ON DELETE CASCADE — a raw delete
      would silently wipe those classes + their attendance history).
- [x] Backend: Student CRUD — same pattern (`studentModel.js` / `studentController.js` /
      `studentValidators.js` / `studentRoutes.js`). Delete is blocked once the student has
      any attendance history (for the same CASCADE-safety reason, plus rules.md's
      auditability requirement).
- [x] Backend: Subject CRUD — `subjectModel.js` / `subjectController.js` /
      `subjectValidators.js` / `subjectRoutes.js`. Delete blocked while any class still
      references the subject.
- [x] Backend: Class CRUD — `classModel.js` / `classController.js` / `classValidators.js` /
      `classRoutes.js`. List/get queries join in `subject_name` + `teacher_name` for display.
      Delete blocked once attendance history exists for the class.
- [x] Backend: **assign teachers to subjects** — resolved as an open question, not a new
      table: a `classes` row (subject_id + teacher_id + day/time/room/section) *is* the
      assignment. Confirmed `class_id`, `subject_id` FK, `teacher_id` FK already cover it in
      `attendance.sql` — no schema change needed.
- [x] Backend: extracted `middleware/validate.js` (same zod-validation logic that was
      inline in `authValidators.js`) so all Phase 2 validators can share it without touching
      Phase 1's working auth code.
- [x] Web: `lib/components/ListRow.svelte` — the design.md §5 "Interactive Row" component,
      pulled out as a shared component so every list screen reuses one implementation.
- [x] Web: `lib/services/{teacher,student,subject,classes,admin}.ts` — typed axios wrappers
      for all Phase 2 endpoints.
- [x] Web: `routes/admin/+page.svelte` — replaces the Phase 0 placeholder. Serif hero stat
      (total students) + summary row (teachers/subjects/classes) + hairline divider +
      ListRow links into each management screen, per design.md's Home screen pattern.
- [x] Web: `routes/admin/teachers/+page.svelte`, `.../students/+page.svelte`,
      `.../subjects/+page.svelte`, `.../classes/+page.svelte` — list + inline add form +
      remove, using the Surface-Muted row pattern from design.md. The Classes screen doubles
      as the "assign teacher to subject" UI (subject + teacher dropdowns feed a class row).

## Up Next (before Phase 2 can be marked COMPLETE)
- [ ] Run Phase 2 against a real DB on the user's local machine (same verification step
      Phase 1 went through) — nothing above has been executed yet, only written.
- [ ] Manually test each CRUD edge case: duplicate email on create, delete-blocked responses
      (teacher-with-classes, student-with-attendance, subject-with-classes,
      class-with-attendance), and the 403 a non-admin role gets on every Phase 2 route.
- [ ] Decide if Teacher/Student edit forms are needed now or can wait — current screens
      only do Add + Remove, not Edit (PATCH endpoints exist backend-side and are ready to
      wire up whenever the edit UI is built).
- [ ] Once verified, move to **Phase 3 — Teacher Core** (today's timetable, student list per
      class, manual attendance marking).

## Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-08-04 | No separate "teacher_subject_assignments" table — a `classes` row IS the assignment | `classes` already has subject_id FK + teacher_id FK + timing; a second table would just duplicate that relationship |
| 2026-08-04 | Delete endpoints (teacher/student/subject/class) block with 409 instead of allowing CASCADE deletes | `attendance`, `classes`, `class_enrollments`, `leave_requests` all cascade off these tables — an unguarded delete would silently erase audit history that rules.md §3 requires |
| 2026-08-04 | Extracted shared `middleware/validate.js` instead of reusing the one inline in `authValidators.js` | Keeps Phase 1's working auth code untouched while giving Phase 2 validators the same pattern |
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