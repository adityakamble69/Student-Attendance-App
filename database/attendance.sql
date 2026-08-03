-- =========================================================
-- attendance.sql — Student Attendance App
-- Base schema (Phase 0). Target: MySQL 8+
-- (Swap AUTO_INCREMENT / ENUM syntax if targeting PostgreSQL.)
-- =========================================================

CREATE DATABASE IF NOT EXISTS student_attendance_app;
USE student_attendance_app;

-- ---------------------------------------------------------
-- students
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  student_id      INT AUTO_INCREMENT PRIMARY KEY,
  roll_no         VARCHAR(50)  NOT NULL,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  phone           VARCHAR(20),
  department      VARCHAR(100),
  semester        INT,
  section         VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  photo_url       VARCHAR(255),          -- Cloudinary URL
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- teachers
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
  teacher_id      INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  department      VARCHAR(100),
  password_hash   VARCHAR(255) NOT NULL,
  photo_url       VARCHAR(255),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- admins  (not in original summary table, but referenced throughout
-- PRD/architecture as a distinct login role — added for auth completeness)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  admin_id        INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- subjects
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  subject_id      INT AUTO_INCREMENT PRIMARY KEY,
  subject_name    VARCHAR(150) NOT NULL,
  semester        INT,
  department      VARCHAR(100)
);

-- ---------------------------------------------------------
-- classes  (a scheduled slot: subject + teacher + timing)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  class_id        INT AUTO_INCREMENT PRIMARY KEY,
  subject_id      INT NOT NULL,
  teacher_id      INT NOT NULL,
  room            VARCHAR(50),
  day             VARCHAR(10) NOT NULL,     -- Mon/Tue/... (or 0-6)
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  section         VARCHAR(20),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- class_enrollments  (which students belong to which class/section —
-- needed so Phase 3 "student list for a class" query has a source of truth)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_enrollments (
  enrollment_id   INT AUTO_INCREMENT PRIMARY KEY,
  class_id        INT NOT NULL,
  student_id      INT NOT NULL,
  UNIQUE KEY uniq_enrollment (class_id, student_id),
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- attendance
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  class_id        INT NOT NULL,
  date            DATE NOT NULL,
  status          ENUM('Present','Absent','Late') NOT NULL,
  marked_by       VARCHAR(50) NOT NULL,               -- teacher_id or 'system'
  method          ENUM('Manual','QR','GPS','OTP','WiFi') NOT NULL DEFAULT 'Manual',
  marked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_attendance (student_id, class_id, date),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- leave_requests
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
  leave_id        INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  reason          TEXT NOT NULL,
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  status          ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  reviewed_by     INT NULL,             -- teacher_id or admin_id
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_leave_student ON leave_requests(student_id);
