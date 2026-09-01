# memory.md — Project Memory / Progress Tracker

> Update this file every time a task, file, or phase is completed. This is the single source of truth for "what's done" and "what's in progress" across sessions.

## Current Status
- **Current Phase:** Phase 3 — Teacher Core — **backend models, validators, controllers, routes + web screens (Dashboard/Timetable, Manual Attendance Marking, History, Class Rosters) built & compiled clean with 0 errors!**
- **Currently Working On:** Ready for end-to-end local testing or proceeding to Phase 4 (Student Core).
- **Last Updated:** 2026-09-01

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
- [x] Phase 2 — Admin Core (Master Data): Teacher CRUD, Student CRUD, Subject CRUD,
      Class CRUD + teacher assignment, Admin overview counts & web management screens.

## Completed — Phase 3 (Teacher Core)
- [x] Backend: `models/enrollmentModel.js` — retrieves enrolled student roster with section/semester fallback; handles manual & bulk section enrollments and unenrollments.
- [x] Backend: `models/attendanceModel.js` — `markBatch` (upserting attendance with `marked_by`, `method = 'Manual'`, and timestamp), `getByClassAndDate` (merging class student roster with day's marked attendance), `getHistoryByClass` (grouped by date with aggregated metrics), `getTeacherSummary` (dashboard stats for scheduled, completed, pending classes and student counts).
- [x] Backend: `models/classModel.js` — added `getByTeacher(teacherId, { day, date })` joining assigned classes with enrollment counts and marked status.
- [x] Backend: `validators/attendanceValidators.js` — Zod schemas for `markAttendanceSchema`, `enrollStudentsSchema`, `enrollBySectionSchema`.
- [x] Backend: `controllers/attendanceController.js` — `markManual`, `getClassAttendance`, `getHistory`, `getTeacherSummary` with role verification and class ownership checks.
- [x] Backend: `controllers/classController.js` + `routes/classRoutes.js` — exposed `/my-classes`, `/:id/students`, and enrollment routes for teachers and admins.
- [x] Backend: `routes/attendanceRoutes.js` — wired `/mark-manual`, `/class/:classId`, `/history`, `/teacher-summary`.
- [x] Web: `lib/components/StatusChip.svelte` — design.md status indicator chip (dot + label with status color accents).
- [x] Web: `lib/services/attendance.ts` — typed axios service for manual marking, class attendance, history, and dashboard summary.
- [x] Web: `lib/services/classes.ts` — typed methods for `getMyClasses`, `getClassStudents`, and enrollment APIs.
- [x] Web: `routes/teacher/+page.svelte` — Teacher Dashboard: serif hero stat, summary grid (scheduled, marked, pending, student count), day selector tabs (Mon–Sat), and interactive class cards with `Marked`/`Pending` badges.
- [x] Web: `routes/teacher/attendance/[classId]/+page.svelte` — Manual Attendance Marking: class header, dynamic date picker, live summary counters (Total, Present, Absent, Late, Unmarked), batch actions ("Mark All Present", "Mark All Absent"), search filter, 3-way toggle button group (`P`/`A`/`L`) per student, and sticky save button.
- [x] Web: `routes/teacher/history/+page.svelte` — Attendance History: class selector, date range filter, session cards with percentage badges, count breakdown, and edit links.
- [x] Web: `routes/teacher/classes/+page.svelte` — My Classes & Rosters: assigned class chips, detail card, and searchable student roster.
- [x] All backend files passed Node syntax checks; Web frontend passed `svelte-check` (0 errors, 0 warnings) and `vite build` (production build succeeded).

## Up Next
- [ ] Move to **Phase 4 — Student Core** (Student Timetable, Overall + Subject-wise Attendance %, Attendance history view).
- [ ] Or run local DB integration testing on Phase 2 & 3.

## Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-09-01 | Automatic fallback in `enrollmentModel.js` to class section/semester | Allows classes and students created in Phase 2 to immediately work in attendance marking without requiring an extra manual enrollment step |
| 2026-09-01 | Attendance batch marking uses `INSERT ... ON DUPLICATE KEY UPDATE` | Supports easy editing and re-marking of attendance for any date without duplicate record conflicts |
| 2026-08-04 | No separate "teacher_subject_assignments" table — a `classes` row IS the assignment | `classes` already has subject_id FK + teacher_id FK + timing; a second table would just duplicate that relationship |
| 2026-08-04 | Delete endpoints (teacher/student/subject/class) block with 409 instead of allowing CASCADE deletes | `attendance`, `classes`, `class_enrollments`, `leave_requests` all cascade off these tables — an unguarded delete would silently erase audit history that rules.md §3 requires |
| 2026-08-04 | Extracted shared `middleware/validate.js` instead of reusing the one inline in `authValidators.js` | Keeps Phase 1's working auth code untouched while giving Phase 2 validators the same pattern |
| 2026-08-03 | Added `method` and `marked_at` fields to `attendance` table | Audit trail for anti-proxy method used |
| 2026-08-03 | Web Admin Panel excluded from v1 | Out of scope per PRD — admin uses mobile app too |
| 2026-08-03 | Design direction locked: ink/white/muted-gray palette, serif+Inter pairing, status as dots/chips only, row-hover pattern | Ported from user's fintech reference — see design.md rationale note |
| 2026-08-03 | Added `admins` table to schema | PRD/architecture assume a distinct admin login role but original entity summary omitted it |
| 2026-08-03 | Added `class_enrollments` table to schema | Needed as the source of truth for "which students are in this class" (architecture.md §2.1 step 2 assumes this exists) |
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
backend/          → Express API (Phase 0 setup, Phase 1 Auth, Phase 2 Admin Core, Phase 3 Teacher Core)
web/              → SvelteKit + TypeScript app (Phase 1 Auth UI, Phase 2 Admin UI, Phase 3 Teacher UI)
database/         → attendance.sql (base schema)
```