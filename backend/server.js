// server.js — Express entrypoint (Phase 0)

const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
});

// Route tree — matches architecture.md §5 (base path /api/v1/...)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// Central error handler — must be last
app.use(errorHandler);

app.listen(env.PORT, async () => {
  console.log(`[server] Listening on port ${env.PORT} (${env.NODE_ENV})`);
  await testConnection();
});

module.exports = app;
