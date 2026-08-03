# PRD.md — Student Attendance App
## Project Requirement Document

## 1. Overview
The Student Attendance App is a mobile-first digital attendance system for colleges, schools, and coaching institutes. It replaces paper registers with a role-based app for **Admins**, **Teachers**, and **Students**, supporting manual as well as smart attendance methods (QR, GPS, Bluetooth/Wi-Fi, OTP).

## 2. Goals
- Eliminate manual/paper attendance registers.
- Give real-time attendance visibility to students and teachers.
- Give admins institute-wide analytics and reporting.
- Prevent proxy attendance using location/network/QR/OTP verification.
- Keep the system usable offline-first where possible (attendance sync when back online).

## 3. User Roles

### 3.1 Admin
- Dashboard (institute-wide stats)
- Add / Edit / Delete Teachers
- Add / Edit / Delete Students
- Create Classes & Divisions
- Manage Subjects
- Assign Teachers to Subjects
- View Attendance Reports
- Export Reports (Excel / PDF)
- Send Notifications
- Semester & Academic Year Management

### 3.2 Teacher
- Login
- View Today's Timetable
- Select Subject
- Mark Attendance (manual, QR, GPS, OTP)
- Edit Attendance (if permitted by admin policy)
- View Attendance History
- Generate Monthly Reports
- Leave Management (approve/reject student leave)
- Student Search

### 3.3 Student
- Login
- View Attendance Percentage (overall + subject-wise)
- Download Reports (PDF)
- View Timetable
- Receive Notifications
- Apply for Leave
- View Leave Status

## 4. Advanced Features (Anti-Proxy Attendance)

| Feature | Description |
|---|---|
| QR Code Attendance | Teacher starts a session; a rotating/time-bound QR appears; students scan to mark present. |
| GPS Attendance | Attendance accepted only if student's device is within a defined campus radius (geofence). |
| Bluetooth/Wi-Fi Verification | Student must be connected to a campus SSID or a teacher's BLE beacon to mark attendance. |
| OTP Attendance | Teacher generates a short-lived numeric code; students must enter it within a countdown window. |

> Rule: these methods can be combined (e.g. GPS + OTP) per class/institute policy — configurable by Admin.

## 5. Dashboards

**Admin:** Total Students, Total Teachers, Today's Attendance, Absent Students, Attendance %, Subject Statistics, Department Statistics

**Teacher:** Today's Classes, Pending Attendance, Attendance Summary, Student Count

**Student:** Overall Attendance %, Present Days, Absent Days, Monthly Graph, Subject-wise Percentage

## 6. Database Entities (summary — see architecture.md for full schema)
Students, Teachers, Subjects, Classes, Attendance, LeaveRequests

## 7. Non-Functional Requirements
- **Security:** JWT-based auth, role-based access control (RBAC), hashed passwords (bcrypt), rate-limited OTP/QR endpoints.
- **Performance:** Attendance marking API response < 500ms under normal load.
- **Scalability:** Should support multi-institute (multi-tenant) usage in future without schema rewrite.
- **Availability:** Core marking flow should tolerate brief network drops (client-side retry/queue).
- **Auditability:** Every attendance record stores `marked_by` and timestamp for accountability.

## 8. Out of Scope (v1)
- Payment/fees module
- Parent login portal
- Biometric (fingerprint/face) attendance
- Web admin panel (v1 is mobile-app + backend only; admin can use mobile too)

## 9. Success Metrics
- % reduction in proxy attendance incidents
- Time taken to mark attendance for a full class (target: < 60 seconds)
- Teacher/student adoption rate per institute
