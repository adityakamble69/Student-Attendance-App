// validators/authValidators.js
// Per rules.md: "All input validated (via zod) before hitting the DB layer."

const { z } = require('zod');

const roleEnum = z.enum(['admin', 'teacher', 'student']);

const registerSchema = z.object({
  role: roleEnum,
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  // role-specific optional fields — validated loosely here, tightened
  // in Phase 2 once Admin's "create student/teacher" screens exist
  rollNo: z.string().min(1).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  semester: z.number().int().optional(),
  section: z.string().optional(),
}).refine(
  (data) => data.role !== 'student' || !!data.rollNo,
  { message: 'rollNo is required for student registration.', path: ['rollNo'] }
);

const loginSchema = z.object({
  role: roleEnum,
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required.'),
});

// Generic middleware factory — validates req.body against the given schema.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues.map((i) => i.message).join(' '),
      });
    }
    req.body = result.data; // parsed + defaulted
    next();
  };
}

module.exports = { registerSchema, loginSchema, refreshSchema, validate };