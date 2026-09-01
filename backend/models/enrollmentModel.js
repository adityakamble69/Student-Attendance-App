// models/enrollmentModel.js
// Phase 3 — Teacher Core: Manage student enrollments for classes.

const { pool } = require('../config/db');

/**
 * Get all students enrolled in a class.
 * Falls back to matching students by section & semester if explicit
 * class_enrollments rows have not been populated yet.
 */
async function getEnrolledStudents(classId) {
  // 1. Check explicit enrollments first
  const [explicitRows] = await pool.query(
    `SELECT s.student_id, s.roll_no, s.name, s.email, s.phone,
            s.department, s.semester, s.section
     FROM class_enrollments ce
     JOIN students s ON s.student_id = ce.student_id
     WHERE ce.class_id = ?
     ORDER BY s.roll_no, s.name`,
    [classId]
  );

  if (explicitRows.length > 0) {
    return explicitRows;
  }

  // 2. Fallback: match by class section and subject semester if class exists
  const [classRows] = await pool.query(
    `SELECT c.section, c.subject_id, s.semester, s.department
     FROM classes c
     JOIN subjects s ON s.subject_id = c.subject_id
     WHERE c.class_id = ?
     LIMIT 1`,
    [classId]
  );

  if (classRows.length === 0) return [];

  const { section, semester, department } = classRows[0];

  let query = `SELECT student_id, roll_no, name, email, phone, department, semester, section FROM students WHERE 1=1`;
  const params = [];

  if (section) {
    query += ` AND section = ?`;
    params.push(section);
  }
  if (semester) {
    query += ` AND semester = ?`;
    params.push(semester);
  }
  if (department && !section && !semester) {
    query += ` AND department = ?`;
    params.push(department);
  }

  query += ` ORDER BY roll_no, name`;

  const [fallbackRows] = await pool.query(query, params);
  return fallbackRows;
}

/**
 * Explicitly enroll one or more student IDs into a class.
 */
async function enrollStudents(classId, studentIds) {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return { enrolled: 0 };
  }

  const values = studentIds.map((id) => [classId, id]);
  const [result] = await pool.query(
    `INSERT IGNORE INTO class_enrollments (class_id, student_id) VALUES ?`,
    [values]
  );

  return { enrolled: result.affectedRows };
}

/**
 * Bulk enroll students into a class based on semester/section/department.
 */
async function enrollBySection(classId, { semester, section, department }) {
  let where = `WHERE 1=1`;
  const params = [classId];

  if (semester) {
    where += ` AND semester = ?`;
    params.push(semester);
  }
  if (section) {
    where += ` AND section = ?`;
    params.push(section);
  }
  if (department) {
    where += ` AND department = ?`;
    params.push(department);
  }

  const [result] = await pool.query(
    `INSERT IGNORE INTO class_enrollments (class_id, student_id)
     SELECT ?, student_id FROM students ${where}`,
    params
  );

  return { enrolled: result.affectedRows };
}

/**
 * Remove a student from a class enrollment.
 */
async function unenrollStudent(classId, studentId) {
  const [result] = await pool.query(
    `DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?`,
    [classId, studentId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getEnrolledStudents,
  enrollStudents,
  enrollBySection,
  unenrollStudent,
};
