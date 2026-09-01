// services/reportService.js
// Phase 6 — Dashboards, Reports & Analytics: CSV & Report Exporters.

/**
 * Converts array of objects into CSV string.
 */
function toCsv(rows, columns) {
  if (!rows || rows.length === 0) return '';

  const headers = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  return [headers, ...lines].join('\n');
}

/**
 * Builds class attendance CSV export content.
 */
function generateClassAttendanceCsv(classInfo, attendanceRecords) {
  const columns = [
    { label: 'Date', key: 'date' },
    { label: 'Roll No', key: 'roll_no' },
    { label: 'Student Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Status', key: 'status' },
    { label: 'Method', key: 'method' },
    { label: 'Marked At', key: 'marked_at' },
  ];

  return toCsv(attendanceRecords, columns);
}

/**
 * Builds institute-wide summary CSV export content.
 */
function generateInstituteSummaryCsv(summaryRows) {
  const columns = [
    { label: 'Subject Name', key: 'subject_name' },
    { label: 'Teacher Name', key: 'teacher_name' },
    { label: 'Section', key: 'section' },
    { label: 'Total Sessions', key: 'total_sessions' },
    { label: 'Total Present', key: 'total_present' },
    { label: 'Total Absent', key: 'total_absent' },
    { label: 'Total Late', key: 'total_late' },
    { label: 'Attendance %', key: 'attendance_percentage' },
  ];

  return toCsv(summaryRows, columns);
}

module.exports = {
  toCsv,
  generateClassAttendanceCsv,
  generateInstituteSummaryCsv,
};
