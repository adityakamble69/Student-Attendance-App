// models/leaveModel.js
// Phase 7 — Leave Management: Student leave application & approval workflows.

const { pool } = require('../config/db');

async function apply({ studentId, reason, fromDate, toDate }) {
  const [result] = await pool.query(
    `INSERT INTO leave_requests (student_id, reason, from_date, to_date, status)
     VALUES (?, ?, ?, ?, 'Pending')`,
    [studentId, reason, fromDate, toDate]
  );
  return getById(result.insertId);
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT lr.leave_id, lr.student_id, lr.reason, lr.from_date, lr.to_date,
            lr.status, lr.reviewed_by, lr.created_at,
            s.name AS student_name, s.roll_no, s.department, s.section, s.semester
     FROM leave_requests lr
     JOIN students s ON s.student_id = lr.student_id
     WHERE lr.leave_id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function getByStudent(studentId) {
  const [rows] = await pool.query(
    `SELECT leave_id, student_id, reason, from_date, to_date, status, reviewed_by, created_at
     FROM leave_requests
     WHERE student_id = ?
     ORDER BY created_at DESC`,
    [studentId]
  );
  return rows;
}

async function getAll({ status, page = 1, limit = 20 } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  let where = `WHERE 1=1`;
  const params = [];

  if (status) {
    where += ` AND lr.status = ?`;
    params.push(status);
  }

  const query = `
    SELECT lr.leave_id, lr.student_id, lr.reason, lr.from_date, lr.to_date,
           lr.status, lr.reviewed_by, lr.created_at,
           s.name AS student_name, s.roll_no, s.department, s.section, s.semester
    FROM leave_requests lr
    JOIN students s ON s.student_id = lr.student_id
    ${where}
    ORDER BY lr.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(Number(limit), offset);

  const [rows] = await pool.query(query, params);

  const countParams = [];
  let countWhere = `WHERE 1=1`;
  if (status) {
    countWhere += ` AND status = ?`;
    countParams.push(status);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM leave_requests ${countWhere}`,
    countParams
  );

  return {
    leaves: rows,
    total: countRows[0]?.total || 0,
    page: Number(page),
    limit: Number(limit),
  };
}

async function review({ leaveId, status, reviewedBy }) {
  await pool.query(
    `UPDATE leave_requests SET status = ?, reviewed_by = ? WHERE leave_id = ?`,
    [status, reviewedBy, leaveId]
  );
  return getById(leaveId);
}

async function countPending() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'Pending'`);
  return rows[0]?.count || 0;
}

module.exports = {
  apply,
  getById,
  getByStudent,
  getAll,
  review,
  countPending,
};
