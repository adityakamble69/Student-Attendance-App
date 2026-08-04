// models/classModel.js
// Phase 2 — Admin Core: Classes & Divisions CRUD.
//
// Per memory.md's "Up Next" note: "assign teachers to subjects (join table
// already exists as `classes` — confirm attendance.sql covers this)."
// Confirmed: a `classes` row (subject_id + teacher_id + day/time/room/section)
// *is* the assignment of a teacher to a subject for a given slot. No extra
// join table is needed — creating/editing a class here is how an admin
// assigns a teacher to a subject.

const { pool } = require('../config/db');

const LIST_QUERY = `
  SELECT c.class_id, c.subject_id, c.teacher_id, c.room, c.day,
         c.start_time, c.end_time, c.section,
         s.subject_name, t.name AS teacher_name
  FROM classes c
  JOIN subjects s ON s.subject_id = c.subject_id
  JOIN teachers t ON t.teacher_id = c.teacher_id
`;

async function getAll({ page = 1, limit = 20 } = {}) {
  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    `${LIST_QUERY} ORDER BY c.day, c.start_time LIMIT ? OFFSET ?`,
    [Number(limit), offset]
  );

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM classes`);

  return { rows, total: countRows[0].total };
}

async function getById(id) {
  const [rows] = await pool.query(`${LIST_QUERY} WHERE c.class_id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function ensureSubjectAndTeacherExist(subjectId, teacherId) {
  const [subjectRows] = await pool.query(
    `SELECT subject_id FROM subjects WHERE subject_id = ?`,
    [subjectId]
  );
  if (!subjectRows[0]) {
    const err = new Error('Subject not found.');
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const [teacherRows] = await pool.query(
    `SELECT teacher_id FROM teachers WHERE teacher_id = ?`,
    [teacherId]
  );
  if (!teacherRows[0]) {
    const err = new Error('Teacher not found.');
    err.status = 400;
    err.expose = true;
    throw err;
  }
}

async function create({ subjectId, teacherId, room, day, startTime, endTime, section }) {
  await ensureSubjectAndTeacherExist(subjectId, teacherId);

  const [result] = await pool.query(
    `INSERT INTO classes (subject_id, teacher_id, room, day, start_time, end_time, section)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [subjectId, teacherId, room || null, day, startTime, endTime, section || null]
  );
  return getById(result.insertId);
}

async function update(id, fields) {
  const map = {
    subjectId: 'subject_id',
    teacherId: 'teacher_id',
    room: 'room',
    day: 'day',
    startTime: 'start_time',
    endTime: 'end_time',
    section: 'section',
  };

  const sets = [];
  const values = [];
  for (const [key, col] of Object.entries(map)) {
    if (fields[key] !== undefined) {
      sets.push(`${col} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) return getById(id);

  if (fields.subjectId !== undefined || fields.teacherId !== undefined) {
    const current = await getById(id);
    if (!current) return null;
    await ensureSubjectAndTeacherExist(
      fields.subjectId !== undefined ? fields.subjectId : current.subject_id,
      fields.teacherId !== undefined ? fields.teacherId : current.teacher_id
    );
  }

  values.push(id);
  await pool.query(`UPDATE classes SET ${sets.join(', ')} WHERE class_id = ?`, values);
  return getById(id);
}

async function remove(id) {
  // attendance.class_id is ON DELETE CASCADE — block deletion once real
  // attendance history exists for this class (same reasoning as students).
  const [attRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM attendance WHERE class_id = ?`,
    [id]
  );
  if (attRows[0].count > 0) {
    const err = new Error('Cannot delete class: attendance history exists for it.');
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const [result] = await pool.query(`DELETE FROM classes WHERE class_id = ?`, [id]);
  return result.affectedRows > 0;
}

async function countAll() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM classes`);
  return rows[0].count;
}

module.exports = { getAll, getById, create, update, remove, countAll };