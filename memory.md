# memory.md — Project Memory / Progress Tracker

> Update this file every time a task, file, or phase is completed. This is the single source of truth for "what's done" and "what's in progress" across sessions.

## Current Status
- **Current Phase:** ALL PHASES (Phase 0 to Phase 10) **FULLY COMPLETED & COMPILED**
- **State:** Backend Express API (Auth, Master Data, Timetable, Smart Anti-Proxy QR/OTP/GPS, Leave, Notifications, Reports & CSV Exporter) + Web SvelteKit App (Admin, Teacher, and Student full dashboards & workflows) built, strict TypeScript checked (0 errors), and Vite production build verified!
- **Last Updated:** 2026-09-01

---

## Complete Phase Breakdown

### Phase 0 — Project Setup & Architecture
- [x] PRD.md, architecture.md, rules.md, phases.md, design.md, memory.md
- [x] Express backend structure + DB configuration (`config/db.js`, `env.js`, `cloudinary.js`, `firebase.js`)
- [x] MySQL base schema (`database/attendance.sql`) with tables, constraints, foreign keys, and indexes.
- [x] SvelteKit web application setup with TypeScript and design tokens.

### Phase 1 — Authentication & Role-Based Access Control
- [x] Multi-role login/register/refresh/logout API with bcrypt hashing and JWT tokens (`models/userModel.js`, `controllers/authController.js`, `middleware/authMiddleware.js`, `middleware/roleMiddleware.js`).
- [x] Web Login UI (`routes/login/+page.svelte`) with role pills, session rehydration, axios token interceptors, and root layout route guards.

### Phase 2 — Admin Core (Master Data Management)
- [x] Teacher CRUD (`models/teacherModel.js`, `controllers/teacherController.js`, `routes/admin/teachers/+page.svelte`).
- [x] Student CRUD (`models/studentModel.js`, `controllers/studentController.js`, `routes/admin/students/+page.svelte`).
- [x] Subject CRUD (`models/subjectModel.js`, `controllers/subjectController.js`, `routes/admin/subjects/+page.svelte`).
- [x] Class Scheduling & Teacher Assignment (`models/classModel.js`, `controllers/classController.js`, `routes/admin/classes/+page.svelte`).
- [x] Cascade-safe delete protection (HTTP 409) preventing accidental loss of historical audit trails.

### Phase 3 — Teacher Core
- [x] Weekly Timetable schedule engine with day-wise filtering.
- [x] Class student roster resolution with section/semester fallback (`models/enrollmentModel.js`).
- [x] Manual attendance batch marking (`Present` / `Absent` / `Late`) with bulk upsert and audit logging.
- [x] Teacher Dashboard (`routes/teacher/+page.svelte`), Attendance Marking screen (`routes/teacher/attendance/[classId]/+page.svelte`), and My Classes roster view (`routes/teacher/classes/+page.svelte`).

### Phase 4 — Student Core
- [x] Student weekly lecture timetable (`routes/student/timetable/+page.svelte`).
- [x] Overall attendance % calculation (Serif hero metric) + Present/Absent/Late cards.
- [x] Subject-wise attendance progress bars with `< 75%` low attendance indicators.
- [x] Student Attendance History logs (`routes/student/history/+page.svelte`) with subject and date filters.

### Phase 5 — Anti-Proxy Smart Attendance Methods
- [x] **Rotating QR Code Attendance**:
  - `services/qrService.js`: Time-bound crypto tokens auto-rotating every 15 seconds.
  - Teacher Station (`routes/teacher/smart/[classId]/+page.svelte`): QR broadcast station.
  - Student Client (`routes/student/scan/+page.svelte`): QR scanner & token verification.
- [x] **Time-bound Numeric OTP**:
  - `services/otpService.js`: 6-digit numeric OTP with 90-second countdown.
  - Teacher Station: Large display + countdown timer.
  - Student Client: 6-digit input field with instant server verification.
- [x] **Server-side GPS Geofencing**:
  - `services/geoService.js`: Strict Haversine formula calculation against campus radius (300m default).
  - Student Client: Browser geolocation one-tap verification.

### Phase 6 — Dashboards, Analytics & Report Exports
- [x] **Admin Analytics Dashboard (`routes/admin/+page.svelte`)**: Total counts, today's institute-wide attendance %, department breakdown, low-attendance student alerts (< 75%).
- [x] **CSV Exporters (`services/reportService.js`, `controllers/reportController.js`)**:
  - Class-level CSV export (`/reports/class/:id/csv` & `routes/teacher/reports/+page.svelte`).
  - Institute-wide CSV export (`/reports/institute/csv` & `routes/admin/reports/+page.svelte`).

### Phase 7 — Leave Management
- [x] `models/leaveModel.js` + `controllers/leaveController.js` + `routes/leaveRoutes.js`.
- [x] Student: Apply for leave with date range & reason + status tracking (`routes/student/leave/+page.svelte`).
- [x] Teacher & Admin: Review, approve, and reject leave requests (`routes/teacher/leave/+page.svelte` & `routes/admin/leave/+page.svelte`).

### Phase 8 & 9 — Notifications & Academic Controls
- [x] In-app notification center (`models/notificationModel.js`, `controllers/notificationController.js`).
- [x] Universal top navbar notification drawer with unread counter badge (`lib/components/Navbar.svelte`).
- [x] Admin Broadcast Announcements Center (`routes/admin/notifications/+page.svelte`).

### Phase 10 — Design System Polish & Production Verification
- [x] Strict adherence to `design.md` tokens across all screens (Monochrome ink/white/surface-muted palette, serif stats, Inter UI, restrained color dots/chips).
- [x] Universal top navbar across all authenticated pages.
- [x] All backend JavaScript files checked with `node -c` (0 syntax errors).
- [x] Full web codebase verified with `npm run check` (0 TypeScript / Svelte diagnostics).
- [x] Production build (`vite build`) compiled successfully in 8.14s.

---

## File Structure Reference
```
PRD.md            → Product requirements
architecture.md   → Architecture specification & schema
rules.md          → Development & security rules
phases.md         → Phase checklist
design.md         → Design tokens & UI patterns
memory.md         → Current status & decisions log
backend/          → Node.js + Express API
├── config/       → db.js, env.js, cloudinary.js, firebase.js
├── models/       → userModel, studentModel, teacherModel, subjectModel, classModel, enrollmentModel, attendanceModel, leaveModel, notificationModel
├── services/     → qrService, otpService, geoService, reportService
├── middleware/   → authMiddleware, roleMiddleware, errorHandler, rateLimiter, validate
├── validators/   → authValidators, studentValidators, teacherValidators, subjectValidators, classValidators, attendanceValidators, leaveValidators, notificationValidators
├── controllers/  → authController, studentController, teacherController, subjectController, classController, attendanceController, leaveController, reportController, notificationController, adminController
├── routes/       → authRoutes, studentRoutes, teacherRoutes, subjectRoutes, classRoutes, attendanceRoutes, leaveRoutes, reportRoutes, notificationRoutes, adminRoutes
└── server.js     → Central Express entrypoint

web/              → SvelteKit + TypeScript Web App
├── src/
│   ├── lib/
│   │   ├── components/  → ListRow, StatusChip, Navbar
│   │   ├── services/    → api, auth, student, teacher, subject, classes, attendance, leave, report, notification, admin
│   │   ├── stores/      → auth, theme
│   │   └── utils/       → theme, calculatePercentage, formatDate, validators
│   └── routes/
│       ├── login/       → Multi-role login screen
│       ├── admin/       → Dashboard, teachers, students, subjects, classes, reports, leave, notifications
│       ├── teacher/     → Dashboard, classes, attendance/[classId], smart/[classId], history, leave, reports
│       └── student/     → Dashboard, timetable, scan, history, leave
└── static/
```