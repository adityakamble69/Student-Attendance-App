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

const startQrSchema = z.object({
  classId: z.number({ required_error: 'classId is required' }).int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format').optional(),
});

const scanQrSchema = z.object({
  classId: z.number({ required_error: 'classId is required' }).int().positive(),
  token: z.string({ required_error: 'token is required' }).min(10),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const generateOtpSchema = z.object({
  classId: z.number({ required_error: 'classId is required' }).int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format').optional(),
});

const submitOtpSchema = z.object({
  classId: z.number({ required_error: 'classId is required' }).int().positive(),
  code: z.string({ required_error: 'code is required' }).min(4).max(8),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const gpsAttendanceSchema = z.object({
  classId: z.number({ required_error: 'classId is required' }).int().positive(),
  lat: z.number({ required_error: 'lat (latitude) is required' }),
  lng: z.number({ required_error: 'lng (longitude) is required' }),
});

module.exports = {
  markAttendanceSchema,
  enrollStudentsSchema,
  enrollBySectionSchema,
  startQrSchema,
  scanQrSchema,
  generateOtpSchema,
  submitOtpSchema,
  gpsAttendanceSchema,
};
