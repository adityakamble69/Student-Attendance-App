// config/db.js
// MySQL connection pool (mysql2/promise). Import `pool` anywhere queries are needed.

const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('[db] Connected to MySQL successfully.');
    conn.release();
  } catch (err) {
    console.error('[db] Failed to connect to MySQL:', err.message);
  }
}

module.exports = { pool, testConnection };
