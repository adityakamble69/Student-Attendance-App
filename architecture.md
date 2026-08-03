# architecture.md — Student Attendance App

## 1. System Architecture (High Level)

```
[React Native App] <--REST/JWT--> [Node.js + Express API] <---> [PostgreSQL/MySQL]
                                          |
                                          |--> Cloudinary (profile photos)
                                          |--> Firebase Cloud Messaging (push notifications)
                                          |--> Report generation (PDF/Excel)
```

- **Client:** React Native (TypeScript), role-based navigation (Admin / Teacher / Student stacks).
- **Server:** Node.js + Express, layered as routes → controllers → services (implicit) → models.
- **Auth:** JWT access token (+ refresh token), role embedded in token payload, middleware guards per route.
- **DB:** MySQL — relational, since attendance data is highly relational (student ↔ class ↔ subject ↔ date).
- **Hosting:** Railway / Render for backend + DB.
- **Media:** Cloudinary for profile photos only (not attendance data).
- **Notifications:** FCM — attendance alerts, leave status updates, admin broadcasts.

## 2. App Flow (Core Journeys)

### 2.1 Teacher marks attendance (manual)
1. Teacher logs in → sees Today's Timetable.
2. Selects a class → app fetches enrolled student list for that class/subject.
3. Teacher marks Present/Absent/Late per student → Submit.
4. API writes rows to `attendance` table with `marked_by = teacher_id`.
5. Student dashboards recompute attendance % (on read, not stored redundantly).

### 2.2 QR Code Attendance
1. Teacher taps "Start QR Attendance" for a class session.
2. Backend generates a short-lived session token (e.g. valid 2–5 min, rotates every N seconds) tied to `class_id + date + time slot`.
3. Screen renders QR encoding that session token.
4. Student scans QR in-app → app sends `{ session_token, student_id, gps_coords? }` to backend.
5. Backend validates: token still valid, student enrolled in that class, not already marked, (optionally) GPS within geofence.
6. Attendance row inserted with `status = Present`, `marked_by = system(QR)`.

### 2.3 GPS Attendance
1. Student opens "Mark Attendance" for an active session.
2. App requests location permission, gets lat/long.
3. Backend compares distance to campus geofence center (haversine formula) against allowed radius.
4. Accept/reject based on distance; log distance value for audit even on rejection.

### 2.4 OTP Attendance
1. Teacher taps "Generate OTP" → backend creates a 4–6 digit code, expiry timestamp (e.g. 60–120s), tied to class session.
2. Teacher reads/displays code to class.
3. Students enter code in-app before expiry → backend validates code + expiry + enrollment → marks present.

### 2.5 Leave Request Flow
1. Student submits leave request (reason, date range) → status `Pending`.
2. Teacher (or Admin) reviews → Approve/Reject.
3. Student notified via FCM; leave status visible in Student app.
4. Approved leave optionally auto-excludes those dates from "Absent" penalty in attendance % calculation (configurable rule — confirm with stakeholder before building).

## 3. Folder & File Structure

```
StudentAttendanceApp/
├── mobile/
│   ├── screens/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── auth/
│   ├── components/          # shared UI: Button, Card, AttendanceRow, QRScanner, etc.
│   ├── navigation/          # RootNavigator, AdminStack, TeacherStack, StudentStack
│   ├── services/            # api.ts (axios instance), auth.ts, attendance.ts, storage.ts
│   ├── context/             # AuthContext, ThemeContext
│   ├── hooks/                # useAttendance, useAuth, useGeolocation
│   ├── utils/                 # formatDate, calculatePercentage, validators
│   └── assets/                # fonts, icons, images
│
├── backend/
│   ├── routes/               # authRoutes.js, studentRoutes.js, teacherRoutes.js, attendanceRoutes.js...
│   ├── controllers/          # business logic per route group
│   ├── middleware/           # authMiddleware.js, roleMiddleware.js, errorHandler.js, rateLimiter.js
│   ├── models/                # Student.js, Teacher.js, Subject.js, Class.js, Attendance.js, Leave.js
│   ├── config/                 # db.js, cloudinary.js, firebase.js, env.js
│   ├── services/                # qrService.js, otpService.js, geoService.js, reportService.js
│   ├── uploads/                  # temp local storage before Cloudinary push
│   └── server.js
│
└── database/
    └── attendance.sql
```

## 4. Database Schema (expanded from base spec)

```sql
-- students
student_id INT PK, roll_no VARCHAR, name VARCHAR, email VARCHAR UNIQUE,
phone VARCHAR, department VARCHAR, semester INT, section VARCHAR,
password_hash VARCHAR, created_at TIMESTAMP

-- teachers
teacher_id INT PK, name VARCHAR, email VARCHAR UNIQUE, department VARCHAR,
password_hash VARCHAR, created_at TIMESTAMP

-- subjects
subject_id INT PK, subject_name VARCHAR, semester INT, department VARCHAR

-- classes  (a scheduled slot: subject + teacher + timing)
class_id INT PK, subject_id INT FK, teacher_id INT FK, room VARCHAR,
day VARCHAR, start_time TIME, end_time TIME, section VARCHAR

-- attendance
attendance_id INT PK, student_id INT FK, class_id INT FK, date DATE,
status ENUM(Present, Absent, Late), marked_by VARCHAR, method ENUM(Manual, QR, GPS, OTP, WiFi),
marked_at TIMESTAMP

-- leave_requests
leave_id INT PK, student_id INT FK, reason TEXT, from_date DATE, to_date DATE,
status ENUM(Pending, Approved, Rejected), reviewed_by INT FK NULL, created_at TIMESTAMP
```

> Note: `method` and `marked_at` are additions to the base spec — needed for audit trail on which anti-proxy mechanism was used.

## 5. API Conventions
- Base path: `/api/v1/...`
- Auth: `Authorization: Bearer <jwt>`
- Response shape: `{ success: boolean, data?: any, error?: string }`
- All list endpoints support `?page=&limit=` pagination.

## 6. Tech Stack Summary
| Layer | Choice |
|---|---|
| Mobile | React Native (TypeScript) |
| Backend | Node.js + Express |
| Auth | JWT (access + refresh) |
| Database | PostgreSQL or MySQL |
| Hosting | Railway / Render |
| Storage | Cloudinary |
| Notifications | Firebase Cloud Messaging |
| Charts | Chart.js / React Native chart libs |
