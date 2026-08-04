// models/subjectModel.js
// Phase 2 — Admin Core: Subject CRUD.

const { pool } = require('../config/db');

async function getAll({ page = 1, limit = 20, search = '' } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const like = `%${search}%`;

  const [rows] = await pool.query(
    `SELECT subject_id, subject_name, semester, department FROM subjects
     WHERE subject_name LIKE ?
     ORDER BY subject_name ASC
     LIMIT ? OFFSET ?`,
    [like, Number(limit), offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM subjects WHERE subject_name LIKE ?`,
    [like]
  );

  return { rows, total: countRows[0].total };
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT subject_id, subject_name, semester, department FROM subjects WHERE subject_id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ subjectName, semester, department }) {
  const [result] = await pool.query(
    `INSERT INTO subjects (subject_name, semester, department) VALUES (?, ?, ?)`,
    [subjectName, semester ?? null, department || null]
  );
  return getById(result.insertId);
}

async function update(id, fields) {
  const map = { subjectName: 'subject_name', semester: 'semester', department: 'department' };
  const sets = [];
  const values = [];

  for (const [key, col] of Object.entries(map)) {
    if (fields[key] !== undefined) {
      sets.push(`${col} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) return getById(id);

  values.push(id);
  await pool.query(`UPDATE subjects SET ${sets.join(', ')} WHERE subject_id = ?`, values);
  return getById(id);
}

async function remove(id) {
  // classes.subject_id is ON DELETE CASCADE — same reasoning as teacherModel:
  // block deletion while classes still reference this subject.
  const [classRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM classes WHERE subject_id = ?`,
    [id]
  );
  if (classRows[0].count > 0) {
    const err = new Error(
      'Cannot delete subject: still referenced by one or more classes. Delete or reassign those classes first.'
    );
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const [result] = await pool.query(`DELETE FROM subjects WHERE subject_id = ?`, [id]);
  return result.affectedRows > 0;
}

async function countAll() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM subjects`);
  return rows[0].count;
}

module.exports = { getAll, getById, create, update, remove, countAll };