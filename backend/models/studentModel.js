// models/studentModel.js
// Phase 2 + Phase 4: Student CRUD, Timetable, Attendance Analytics & History.

const { pool } = require('../config/db');

const SAFE_COLUMNS =
  'student_id, roll_no, name, email, phone, department, semester, section, photo_url, created_at';

async function getAll({ page = 1, limit = 20, search = '' } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const like = `%${search}%`;

  const [rows] = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM students
     WHERE name LIKE ? OR email LIKE ? OR roll_no LIKE ?
     ORDER BY name ASC
     LIMIT ? OFFSET ?`,
    [like, like, like, Number(limit), offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM students WHERE name LIKE ? OR email LIKE ? OR roll_no LIKE ?`,
    [like, like, like]
  );

  return { rows, total: countRows[0].total };
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM students WHERE student_id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT student_id FROM students WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function create({ rollNo, name, email, passwordHash, phone, department, semester, section }) {
  const [result] = await pool.query(
    `INSERT INTO students (roll_no, name, email, phone, department, semester, section, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [rollNo, name, email, phone || null, department || null, semester || null, section || null, passwordHash]
  );
  return getById(result.insertId);
}

async function update(id, fields) {
  const allowedColumns = [
    'roll_no', 'name', 'email', 'phone', 'department', 'semester', 'section', 'password_hash',
  ];
  const sets = [];
  const values = [];

  for (const col of allowedColumns) {
    if (fields[col] !== undefined) {
      sets.push(`${col} = ?`);
      values.push(fields[col]);
    }
  }

  if (sets.length === 0) return getById(id);

  values.push(id);
  await pool.query(`UPDATE students SET ${sets.join(', ')} WHERE student_id = ?`, values);
  return getById(id);
}

async function remove(id) {
  const [attRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM attendance WHERE student_id = ?`,
    [id]
  );
  if (attRows[0].count > 0) {
    const err = new Error(
      'Cannot delete student: attendance history exists. Remove class enrollments instead of deleting the record.'
    );
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const [result] = await pool.query(`DELETE FROM students WHERE student_id = ?`, [id]);
  return result.affectedRows > 0;
}

async function countAll() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM students`);
  return rows[0].count;
}

// Phase 4: Student Timetable, Stats & History

async function getStudentTimetable(studentId, { day } = {}) {
  const student = await getById(studentId);
  if (!student) return [];

  let query = `
    SELECT DISTINCT c.class_id, c.subject_id, c.teacher_id, c.room, c.day,
           c.start_time, c.end_time, c.section,
           s.subject_name, s.semester, s.department,
           t.name AS teacher_name
    FROM classes c
    JOIN subjects s ON s.subject_id = c.subject_id
    JOIN teachers t ON t.teacher_id = c.teacher_id
    WHERE (
      c.class_id IN (SELECT class_id FROM class_enrollments WHERE student_id = ?)
      OR (
        (c.section = ? OR c.section IS NULL)
        AND (s.semester = ? OR s.semester IS NULL)
      )
    )
  `;
  const params = [studentId, student.section, student.semester];

  if (day) {
    query += ` AND c.day = ?`;
    params.push(day);
  }

  query += ` ORDER BY c.day, c.start_time ASC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getStudentStats(studentId) {
  const student = await getById(studentId);
  if (!student) return null;

  // 1. Overall stats
  const [overallRows] = await pool.query(
    `SELECT
       COUNT(*) AS total_marked,
       SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
       SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
       SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count
     FROM attendance
     WHERE student_id = ?`,
    [studentId]
  );

  const totalMarked = Number(overallRows[0]?.total_marked || 0);
  const presentCount = Number(overallRows[0]?.present_count || 0);
  const absentCount = Number(overallRows[0]?.absent_count || 0);
  const lateCount = Number(overallRows[0]?.late_count || 0);
  const overallPercentage =
    totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  // 2. Subject-wise breakdown
  const [subjectRows] = await pool.query(
    `SELECT
       s.subject_id,
       s.subject_name,
       t.name AS teacher_name,
       COUNT(a.attendance_id) AS total_sessions,
       SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
       SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
       SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count
     FROM classes c
     JOIN subjects s ON s.subject_id = c.subject_id
     LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
     LEFT JOIN attendance a ON a.class_id = c.class_id AND a.student_id = ?
     WHERE (
       c.class_id IN (SELECT class_id FROM class_enrollments WHERE student_id = ?)
       OR (c.section = ? AND (s.semester = ? OR s.semester IS NULL))
     )
     GROUP BY s.subject_id, s.subject_name, t.name`,
    [studentId, studentId, student.section, student.semester]
  );

  const subjectBreakdown = subjectRows.map((r) => {
    const total = Number(r.total_sessions || 0);
    const pres = Number(r.present_count || 0);
    return {
      subject_id: r.subject_id,
      subject_name: r.subject_name,
      teacher_name: r.teacher_name,
      total_sessions: total,
      present_count: pres,
      absent_count: Number(r.absent_count || 0),
      late_count: Number(r.late_count || 0),
      percentage: total > 0 ? Math.round((pres / total) * 100) : 0,
    };
  });

  return {
    student,
    overallPercentage,
    totalMarked,
    presentCount,
    absentCount,
    lateCount,
    subjectBreakdown,
  };
}

async function getStudentHistory(studentId, { subjectId, fromDate, toDate, page = 1, limit = 20 } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  let where = `WHERE a.student_id = ?`;
  const params = [studentId];

  if (subjectId) {
    where += ` AND c.subject_id = ?`;
    params.push(Number(subjectId));
  }
  if (fromDate) {
    where += ` AND a.date >= ?`;
    params.push(fromDate);
  }
  if (toDate) {
    where += ` AND a.date <= ?`;
    params.push(toDate);
  }

  const query = `
    SELECT a.attendance_id, a.class_id, a.date, a.status, a.method, a.marked_at,
           s.subject_name, t.name AS teacher_name, c.room, c.section, c.start_time, c.end_time
    FROM attendance a
    JOIN classes c ON c.class_id = a.class_id
    JOIN subjects s ON s.subject_id = c.subject_id
    JOIN teachers t ON t.teacher_id = c.teacher_id
    ${where}
    ORDER BY a.date DESC, a.marked_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(Number(limit), offset);

  const [rows] = await pool.query(query, params);

  const countParams = [studentId];
  let countWhere = `WHERE a.student_id = ?`;
  if (subjectId) {
    countWhere += ` AND c.subject_id = ?`;
    countParams.push(Number(subjectId));
  }
  if (fromDate) {
    countWhere += ` AND a.date >= ?`;
    countParams.push(fromDate);
  }
  if (toDate) {
    countWhere += ` AND a.date <= ?`;
    countParams.push(toDate);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM attendance a JOIN classes c ON c.class_id = a.class_id ${countWhere}`,
    countParams
  );

  return {
    records: rows,
    total: countRows[0]?.total || 0,
    page: Number(page),
    limit: Number(limit),
  };
}

module.exports = {
  getAll,
  getById,
  findByEmail,
  create,
  update,
  remove,
  countAll,
  getStudentTimetable,
  getStudentStats,
  getStudentHistory,
};