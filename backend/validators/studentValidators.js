// validators/studentValidators.js

const { z } = require('zod');

const createStudentSchema = z.object({
  rollNo: z.string().min(1, 'rollNo is required.').max(50),
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  phone: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  semester: z.number().int().positive().optional(),
  section: z.string().max(20).optional(),
});

const updateStudentSchema = z
  .object({
    rollNo: z.string().min(1).max(50).optional(),
    name: z.string().min(2).max(150).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
    phone: z.string().max(20).optional(),
    department: z.string().max(100).optional(),
    semester: z.number().int().positive().optional(),
    section: z.string().max(20).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required.',
  });

module.exports = { createStudentSchema, updateStudentSchema };