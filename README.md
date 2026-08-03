# Student Attendance App

A mobile-first digital attendance system for colleges, schools, and coaching institutes. It replaces paper registers with a role-based app for **Admins**, **Teachers**, and **Students**, supporting manual as well as smart attendance methods (QR, GPS, OTP).

## Features

- **Role-based access** — separate flows for Admin, Teacher, and Student
- **Attendance marking** — manual, QR code, GPS geofencing, and OTP-based
- **Leave management** — students apply for leave, teachers/admins approve or reject
- **Reports** — attendance percentage (overall + subject-wise), exportable reports
- **Notifications** — push alerts for attendance and leave status via Firebase Cloud Messaging
- **Class & subject management** — admin can manage classes, divisions, subjects, and teacher assignments

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (TypeScript) |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT (access + refresh tokens) |
| Media Storage | Cloudinary |
| Push Notifications | Firebase Cloud Messaging |

## Project Structure

```
StudentAttendanceApp/
├── backend/            # Node.js + Express REST API
│   ├── config/         # DB, Cloudinary, Firebase, env config
│   ├── controllers/    # Route business logic
│   ├── middleware/     # Auth, role guard, error handler, rate limiter
│   ├── models/         # DB models
│   ├── routes/         # API route definitions
│   ├── services/       # QR, OTP, geolocation, report generation
│   └── server.js        # App entry point
├── mobile/              # React Native app
│   ├── screens/         # Role-based screens (admin/teacher/student/auth)
│   ├── components/      # Shared UI components
│   ├── navigation/       # Role-based stacks
│   ├── services/         # API instance, auth, attendance, storage
│   ├── context/           # Auth & Theme context
│   ├── hooks/              # Custom hooks
│   └── utils/               # Helpers & validators
├── database/
│   └── attendance.sql     # MySQL schema
├── PRD.md                  # Product requirements
├── architecture.md         # System architecture & app flows
└── design.md                # UI/design reference
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/) 8+
- [Java JDK 17](https://adoptium.net/) (for Android builds)
- [Android Studio](https://developer.android.com/studio) with an emulator, or a physical Android device (for mobile app)

### 1. Database Setup

```bash
mysql -u root -p < database/attendance.sql
```

This creates the `student_attendance_app` database with all required tables.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Fill in `.env` with your local values:

```
DB_PASSWORD=your_mysql_password
JWT_ACCESS_SECRET=some_random_string
JWT_REFRESH_SECRET=another_random_string
```

Cloudinary and Firebase values are optional unless you're testing photo uploads or push notifications.

Install dependencies and run:

```bash
npm install
npm run dev      # with auto-reload (nodemon)
# or
npm start
```

The API runs on `http://localhost:4000`. Verify with:

```
GET http://localhost:4000/api/v1/health
```

### 3. Mobile App Setup

The `mobile/` folder contains the full JS/TS app (screens, navigation, context, services), but the native `android/` and `ios/` folders need to be generated locally since they require the React Native CLI toolchain.

```bash
# One-time: generate native folders
npx @react-native-community/cli init StudentAttendanceAppNative --skip-install

# Copy native folders into this project
cp -r StudentAttendanceAppNative/android ./mobile/android
cp -r StudentAttendanceAppNative/ios ./mobile/ios

# Install dependencies
cd mobile
npm install

# Run
npm run android   # requires Android Studio / emulator or connected device
npm run ios       # macOS only, requires Xcode
```

> **Note:** If testing on an Android emulator, update the API base URL in `mobile/services/api.ts` from `http://localhost:4000` to `http://10.0.2.2:4000`, since `localhost` inside the emulator refers to the emulator itself, not your machine.

## Environment Variables (Backend)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Backend server port (default `4000`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection details |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Secrets for signing JWTs |
| `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` | Token expiry durations |
| `CLOUDINARY_*` | Cloudinary credentials (profile photo uploads) |
| `FIREBASE_*` | Firebase Admin credentials (push notifications) |

## Documentation

- [`PRD.md`](./PRD.md) — Product requirements & user roles
- [`architecture.md`](./architecture.md) — System architecture, app flows, folder structure
- [`design.md`](./design.md) — UI/theme reference
- [`phases.md`](./phases.md) — Development phases
- [`rules.md`](./rules.md) — Project rules/conventions

## License

This project is currently unlicensed. Add a license file if you plan to open-source it.
