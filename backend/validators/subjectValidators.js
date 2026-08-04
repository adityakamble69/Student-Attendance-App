// validators/subjectValidators.js

const { z } = require('zod');

const createSubjectSchema = z.object({
  subjectName: z.string().min(2).max(150),
  semester: z.number().int().positive().optional(),
  department: z.string().max(100).optional(),
});

const updateSubjectSchema = z
  .object({
    subjectName: z.string().min(2).max(150).optional(),
    semester: z.number().int().positive().optional(),
    department: z.string().max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required.',
  });

module.exports = { createSubjectSchema, updateSubjectSchema };