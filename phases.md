# phases.md — Build Phases for Student Attendance App

> Rule: complete and verify each phase before moving to the next. Update `memory.md` at the end of every phase/task.

## Phase 0 — Project Setup
- Initialize `backend/` (Express, DB connection, env config, folder structure).
- Initialize `web/` (SvelteKit + TypeScript, routing skeleton).
- Set up database (`attendance.sql`) with all base tables.
- Set up Railway/Render project + connect DB.
- Set up Cloudinary + FCM project credentials (config only, not wired to features yet).

## Phase 1 — Authentication & Roles
- JWT auth (login/register/refresh) for Admin, Teacher, Student.
- Role middleware on backend.
- Auth screens + role-based route guards on web.
- Secure token storage on device (e.g. encrypted storage, not plain AsyncStorage for tokens).

## Phase 2 — Admin Core (Master Data)
- Add/Edit/Delete Teachers.
- Add/Edit/Delete Students.
- Create Classes & Divisions, Manage Subjects.
- Assign Teachers to Subjects.
- Admin Dashboard (basic counts only, no charts yet).

## Phase 3 — Teacher Core
- Today's Timetable view.
- Select Subject → Student list for that class.
- Manual attendance marking (Present/Absent/Late) + edit permission logic.
- Attendance history view.

## Phase 4 — Student Core
- View Timetable.
- View Overall + Subject-wise Attendance %.
- Attendance history view (read-only).

## Phase 5 — Advanced Attendance Methods
- QR Code Attendance (session token generation, QR render, scan-to-mark).
- OTP Attendance (generate, countdown, validate).
- GPS Attendance (geofence config per campus, distance validation).
- Bluetooth/Wi-Fi Verification (SSID/BLE check).
- Admin config screen: choose which method(s) are required per institute/class.

## Phase 6 — Dashboards, Reports & Analytics
- Admin Dashboard: full stats (department/subject-wise, absentee lists).
- Teacher Dashboard: pending attendance, summary.
- Student Dashboard: monthly graph, subject-wise breakdown (Chart.js/RN charts).
- Export Reports: Excel + PDF (backend report service).

## Phase 7 — Leave Management
- Student: apply for leave, view status.
- Teacher/Admin: approve/reject leave.
- (Decide + implement) whether approved leave affects attendance % calculation.

## Phase 8 — Notifications
- FCM integration: attendance marked, leave status changed, admin broadcast messages.
- Notification preferences/history screen for students.

## Phase 9 — Semester & Academic Year Management
- Admin: create/manage semesters and academic years.
- Historical data views scoped by semester/year.

## Phase 10 — Polish, Testing & Deployment
- Apply full design system (`design.md`) across all screens.
- Edge case & security testing (see `rules.md` §6).
- Performance pass (list rendering, pagination, image loading).
- Deploy backend to Railway/Render; deploy web app (Vercel/Netlify/Render static or Node adapter).

---

### Suggested Order Rationale
Auth → Admin master data → Teacher manual flow → Student read views → Advanced (QR/GPS/OTP) → Dashboards/Reports → Leave → Notifications → Semester mgmt → Polish/Deploy.
This order ensures a working manual-attendance MVP exists before the more complex anti-proxy features are layered on.
