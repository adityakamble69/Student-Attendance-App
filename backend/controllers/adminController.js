// controllers/adminController.js
// Phase 2 + Phase 6: Admin Dashboard & Institute-Wide Analytics.

const { pool } = require('../config/db');
const teacherModel = require('../models/teacherModel');
const studentModel = require('../models/studentModel');
const subjectModel = require('../models/subjectModel');
const classModel = require('../models/classModel');
const leaveModel = require('../models/leaveModel');

async function dashboard(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalTeachers,
      totalStudents,
      totalSubjects,
      totalClasses,
      pendingLeaves,
    ] = await Promise.all([
      teacherModel.countAll(),
      studentModel.countAll(),
      subjectModel.countAll(),
      classModel.countAll(),
      leaveModel.countPending(),
    ]);

    // 1. Overall attendance today
    const [todayAttRows] = await pool.query(
      `SELECT
         COUNT(*) AS total_marked,
         SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
         SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count
       FROM attendance
       WHERE date = ?`,
      [today]
    );

    const todayTotal = Number(todayAttRows[0]?.total_marked || 0);
    const todayPresent = Number(todayAttRows[0]?.present_count || 0);
    const todayAbsent = Number(todayAttRows[0]?.absent_count || 0);
    const todayLate = Number(todayAttRows[0]?.late_count || 0);
    const todayPercentage = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    // 2. Department-wise student breakdown
    const [deptRows] = await pool.query(
      `SELECT department, COUNT(*) AS student_count
       FROM students
       WHERE department IS NOT NULL AND department != ''
       GROUP BY department
       ORDER BY student_count DESC`
    );

    // 3. Low attendance alert list (< 75% attendance among students with records)
    const [lowAttRows] = await pool.query(
      `SELECT s.student_id, s.roll_no, s.name, s.department, s.section,
              COUNT(a.attendance_id) AS total_records,
              SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
              ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.attendance_id)) * 100) AS percentage
       FROM students s
       JOIN attendance a ON a.student_id = s.student_id
       GROUP BY s.student_id, s.roll_no, s.name, s.department, s.section
       HAVING percentage < 75 AND total_records >= 3
       ORDER BY percentage ASC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        totalSubjects,
        totalClasses,
        pendingLeaves,
        todayStats: {
          date: today,
          totalMarked: todayTotal,
          presentCount: todayPresent,
          absentCount: todayAbsent,
          lateCount: todayLate,
          attendancePercentage: todayPercentage,
        },
        departments: deptRows,
        lowAttendanceAlerts: lowAttRows,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };