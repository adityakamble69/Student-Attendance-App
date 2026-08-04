// models/studentModel.js
// Phase 2 — Admin Core: Student CRUD.

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

// `fields` uses DB column names directly — controller translates camelCase.
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
  // students has three CASCADE children: class_enrollments, attendance,
  // leave_requests. Deleting a student with real attendance history would
  // silently erase that audit trail (rules.md §3: every write is meant to
  // be auditable). Block it — admin should remove enrollments going
  // forward instead of deleting a student who has attendance on record.
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

module.exports = { getAll, getById, findByEmail, create, update, remove, countAll };