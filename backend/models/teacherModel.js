// models/teacherModel.js
// Phase 2 — Admin Core: Teacher CRUD.

const { pool } = require('../config/db');

const SAFE_COLUMNS = 'teacher_id, name, email, department, photo_url, created_at';

async function getAll({ page = 1, limit = 20, search = '' } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const like = `%${search}%`;

  const [rows] = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM teachers
     WHERE name LIKE ? OR email LIKE ?
     ORDER BY name ASC
     LIMIT ? OFFSET ?`,
    [like, like, Number(limit), offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM teachers WHERE name LIKE ? OR email LIKE ?`,
    [like, like]
  );

  return { rows, total: countRows[0].total };
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM teachers WHERE teacher_id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT teacher_id FROM teachers WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash, department }) {
  const [result] = await pool.query(
    `INSERT INTO teachers (name, email, department, password_hash) VALUES (?, ?, ?, ?)`,
    [name, email, department || null, passwordHash]
  );
  return getById(result.insertId);
}

// `fields` uses DB column names directly (name, email, department, password_hash)
// since the controller is the one translating request-body camelCase.
async function update(id, fields) {
  const allowedColumns = ['name', 'email', 'department', 'password_hash'];
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
  await pool.query(`UPDATE teachers SET ${sets.join(', ')} WHERE teacher_id = ?`, values);
  return getById(id);
}

async function remove(id) {
  // classes.teacher_id is ON DELETE CASCADE — a raw delete here would
  // silently wipe out any classes (and their attendance history, via
  // attendance.class_id's own CASCADE) still assigned to this teacher.
  // Block it instead and make the admin reassign/delete those classes first.
  const [classRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM classes WHERE teacher_id = ?`,
    [id]
  );
  if (classRows[0].count > 0) {
    const err = new Error(
      'Cannot delete teacher: still assigned to one or more classes. Reassign or delete those classes first.'
    );
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const [result] = await pool.query(`DELETE FROM teachers WHERE teacher_id = ?`, [id]);
  return result.affectedRows > 0;
}

async function countAll() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM teachers`);
  return rows[0].count;
}

module.exports = { getAll, getById, findByEmail, create, update, remove, countAll };