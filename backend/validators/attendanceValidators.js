// validators/attendanceValidators.js
// Phase 3 — Teacher Core: Validation schemas for attendance and enrollments.

const { z } = require('zod');

const markAttendanceSchema = z.object({
  classId: z.number({ required_error: 'classId is required' }).int().positive(),
  date: z
    .string({ required_error: 'date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  records: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        status: z.enum(['Present', 'Absent', 'Late'], {
          errorMap: () => ({ message: 'status must be Present, Absent, or Late' }),
        }),
      })
    )
    .min(1, 'At least one student attendance record is required'),
});

const enrollStudentsSchema = z.object({
  studentIds: z
    .array(z.number().int().positive())
    .min(1, 'studentIds array cannot be empty'),
});

const enrollBySectionSchema = z
  .object({
    semester: z.number().int().positive().optional(),
    section: z.string().min(1).max(20).optional(),
    department: z.string().min(1).max(100).optional(),
  })
  .refine((data) => data.semester || data.section || data.department, {
    message: 'At least one filter (semester, section, or department) must be provided.',
  });

module.exports = {
  markAttendanceSchema,
  enrollStudentsSchema,
  enrollBySectionSchema,
};
