// models/attendanceModel.js
// Phase 3 — Teacher Core: Attendance marking, querying, and history.

const { pool } = require('../config/db');
const enrollmentModel = require('./enrollmentModel');

/**
 * Bulk mark attendance for a class on a given date.
 * Upserts existing records to allow re-marking / editing.
 */
async function markBatch({ classId, date, markedBy, method = 'Manual', records }) {
  if (!Array.isArray(records) || records.length === 0) {
    return { count: 0 };
  }

  const values = records.map((r) => [
    r.studentId,
    classId,
    date,
    r.status,
    String(markedBy),
    method,
  ]);

  const query = `
    INSERT INTO attendance (student_id, class_id, date, status, marked_by, method)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      marked_by = VALUES(marked_by),
      method = VALUES(method),
      marked_at = CURRENT_TIMESTAMP
  `;

  const [result] = await pool.query(query, [values]);
  return { affectedRows: result.affectedRows, count: records.length };
}

/**
 * Get attendance state for all enrolled students in a class on a specific date.
 */
async function getByClassAndDate(classId, date) {
  // 1. Fetch all enrolled students
  const students = await enrollmentModel.getEnrolledStudents(classId);

  if (students.length === 0) {
    return { students: [], isMarked: false };
  }

  // 2. Fetch any marked attendance rows for this class & date
  const [attRows] = await pool.query(
    `SELECT attendance_id, student_id, status, marked_by, method, marked_at
     FROM attendance
     WHERE class_id = ? AND date = ?`,
    [classId, date]
  );

  const attMap = new Map();
  attRows.forEach((row) => {
    attMap.set(row.student_id, row);
  });

  const studentsWithStatus = students.map((s) => {
    const record = attMap.get(s.student_id);
    return {
      student_id: s.student_id,
      roll_no: s.roll_no,
      name: s.name,
      email: s.email,
      department: s.department,
      semester: s.semester,
      section: s.section,
      attendance_id: record ? record.attendance_id : null,
      status: record ? record.status : null,
      marked_by: record ? record.marked_by : null,
      method: record ? record.method : null,
      marked_at: record ? record.marked_at : null,
    };
  });

  return {
    students: studentsWithStatus,
    isMarked: attRows.length > 0,
    totalStudents: students.length,
    presentCount: attRows.filter((r) => r.status === 'Present').length,
    absentCount: attRows.filter((r) => r.status === 'Absent').length,
    lateCount: attRows.filter((r) => r.status === 'Late').length,
  };
}

/**
 * Get attendance history sessions for a class (grouped by date).
 */
async function getHistoryByClass(classId, { fromDate, toDate, page = 1, limit = 20 } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  let where = `WHERE class_id = ?`;
  const params = [classId];

  if (fromDate) {
    where += ` AND date >= ?`;
    params.push(fromDate);
  }
  if (toDate) {
    where += ` AND date <= ?`;
    params.push(toDate);
  }

  const query = `
    SELECT
      date,
      COUNT(*) AS total_records,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
      SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count,
      MAX(marked_at) AS last_marked_at,
      MAX(marked_by) AS marked_by,
      MAX(method) AS method
    FROM attendance
    ${where}
    GROUP BY date
    ORDER BY date DESC
    LIMIT ? OFFSET ?
  `;

  params.push(Number(limit), offset);

  const [rows] = await pool.query(query, params);

  // Total session dates count
  const countParams = [classId];
  let countWhere = `WHERE class_id = ?`;
  if (fromDate) {
    countWhere += ` AND date >= ?`;
    countParams.push(fromDate);
  }
  if (toDate) {
    countWhere += ` AND date <= ?`;
    countParams.push(toDate);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT date) AS total FROM attendance ${countWhere}`,
    countParams
  );

  return {
    sessions: rows.map((r) => ({
      date: r.date,
      total_records: Number(r.total_records),
      present_count: Number(r.present_count || 0),
      absent_count: Number(r.absent_count || 0),
      late_count: Number(r.late_count || 0),
      attendance_percentage:
        Number(r.total_records) > 0
          ? Math.round((Number(r.present_count || 0) / Number(r.total_records)) * 100)
          : 0,
      last_marked_at: r.last_marked_at,
      marked_by: r.marked_by,
      method: r.method,
    })),
    total: countRows[0] ? countRows[0].total : 0,
    page: Number(page),
    limit: Number(limit),
  };
}

/**
 * Get summary stats for a teacher dashboard.
 */
async function getTeacherSummary(teacherId, { day, date } = {}) {
  // 1. Classes assigned to teacher today
  let classQuery = `
    SELECT c.class_id, c.day, c.start_time, c.end_time, c.room, c.section,
           s.subject_name, s.semester
    FROM classes c
    JOIN subjects s ON s.subject_id = c.subject_id
    WHERE c.teacher_id = ?
  `;
  const classParams = [teacherId];

  if (day) {
    classQuery += ` AND c.day = ?`;
    classParams.push(day);
  }

  classQuery += ` ORDER BY c.start_time ASC`;

  const [classes] = await pool.query(classQuery, classParams);

  // 2. Check marked status for each class on date
  let markedClassIds = new Set();
  if (date && classes.length > 0) {
    const classIds = classes.map((c) => c.class_id);
    const [attRows] = await pool.query(
      `SELECT DISTINCT class_id FROM attendance WHERE class_id IN (?) AND date = ?`,
      [classIds, date]
    );
    attRows.forEach((r) => markedClassIds.add(r.class_id));
  }

  // 3. Count total distinct students taught across all classes
  const [studentCountRows] = await pool.query(
    `SELECT COUNT(DISTINCT ce.student_id) AS total_students
     FROM classes c
     JOIN class_enrollments ce ON ce.class_id = c.class_id
     WHERE c.teacher_id = ?`,
    [teacherId]
  );

  let totalStudents = studentCountRows[0] ? studentCountRows[0].total_students : 0;

  // If explicit enrollments are 0, estimate from students in matching sections
  if (totalStudents === 0 && classes.length > 0) {
    const [allClasses] = await pool.query(
      `SELECT DISTINCT c.section, s.semester, s.department
       FROM classes c
       JOIN subjects s ON s.subject_id = c.subject_id
       WHERE c.teacher_id = ?`,
      [teacherId]
    );

    if (allClasses.length > 0) {
      const sections = allClasses.map((c) => c.section).filter(Boolean);
      if (sections.length > 0) {
        const [estRows] = await pool.query(
          `SELECT COUNT(DISTINCT student_id) AS est_total FROM students WHERE section IN (?)`,
          [sections]
        );
        totalStudents = estRows[0] ? estRows[0].est_total : 0;
      }
    }
  }

  const scheduledToday = classes.length;
  const completedToday = classes.filter((c) => markedClassIds.has(c.class_id)).length;
  const pendingToday = scheduledToday - completedToday;

  return {
    scheduledToday,
    completedToday,
    pendingToday,
    totalStudents,
    classes: classes.map((c) => ({
      ...c,
      is_marked_today: markedClassIds.has(c.class_id),
    })),
  };
}

/**
 * Check if a class is assigned to a teacher.
 */
async function isClassTaughtByTeacher(classId, teacherId) {
  const [rows] = await pool.query(
    `SELECT class_id FROM classes WHERE class_id = ? AND teacher_id = ? LIMIT 1`,
    [classId, teacherId]
  );
  return rows.length > 0;
}

module.exports = {
  markBatch,
  getByClassAndDate,
  getHistoryByClass,
  getTeacherSummary,
  isClassTaughtByTeacher,
};
