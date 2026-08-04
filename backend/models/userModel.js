// models/userModel.js
// One users table per role in the DB (students / teachers / admins — see
// database/attendance.sql). This model wraps that split behind a single
// role-aware API so authController.js doesn't need to know table names.

const { pool } = require('../config/db');

const TABLE_BY_ROLE = {
  admin: { table: 'admins', idColumn: 'admin_id' },
  teacher: { table: 'teachers', idColumn: 'teacher_id' },
  student: { table: 'students', idColumn: 'student_id' },
};

function assertValidRole(role) {
  if (!TABLE_BY_ROLE[role]) {
    const err = new Error('Invalid role. Must be admin, teacher, or student.');
    err.status = 400;
    err.expose = true;
    throw err;
  }
}

// Find a user by email within a specific role's table.
// Login requires the role up front (the client picks Admin/Teacher/Student
// on the login screen) rather than searching all 3 tables — cheaper query
// and avoids leaking whether an email exists under a different role.
async function findByEmailAndRole(email, role) {
  assertValidRole(role);
  const { table } = TABLE_BY_ROLE[role];

  const [rows] = await pool.query(
    `SELECT * FROM ${table} WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findByIdAndRole(id, role) {
  assertValidRole(role);
  const { table, idColumn } = TABLE_BY_ROLE[role];

  const [rows] = await pool.query(
    `SELECT * FROM ${table} WHERE ${idColumn} = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

// Create a new user row in the correct role table.
// `extra` holds role-specific columns (e.g. department, roll_no) that
// authController passes through after zod validation.
async function createUser({ role, name, email, passwordHash, extra = {} }) {
  assertValidRole(role);
  const { table } = TABLE_BY_ROLE[role];

  if (role === 'student') {
    const [result] = await pool.query(
      `INSERT INTO students (roll_no, name, email, phone, department, semester, section, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        extra.rollNo,
        name,
        email,
        extra.phone || null,
        extra.department || null,
        extra.semester || null,
        extra.section || null,
        passwordHash,
      ]
    );
    return { id: result.insertId, role };
  }

  if (role === 'teacher') {
    const [result] = await pool.query(
      `INSERT INTO teachers (name, email, department, password_hash)
       VALUES (?, ?, ?, ?)`,
      [name, email, extra.department || null, passwordHash]
    );
    return { id: result.insertId, role };
  }

  // admin
  const [result] = await pool.query(
    `INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)`,
    [name, email, passwordHash]
  );
  return { id: result.insertId, role };
}

function idFor(role, row) {
  return row[TABLE_BY_ROLE[role].idColumn];
}

module.exports = {
  findByEmailAndRole,
  findByIdAndRole,
  createUser,
  idFor,
};