// validators/teacherValidators.js

const { z } = require('zod');

const createTeacherSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  department: z.string().max(100).optional(),
});

const updateTeacherSchema = z
  .object({
    name: z.string().min(2).max(150).optional(),
    email: z.string().email().optional(),
    department: z.string().max(100).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required.',
  });

module.exports = { createTeacherSchema, updateTeacherSchema };