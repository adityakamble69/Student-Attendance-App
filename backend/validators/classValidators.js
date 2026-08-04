// validators/classValidators.js
// A "class" = subject + teacher + timing slot. Creating/updating one is how
// an admin assigns a teacher to a subject (see models/classModel.js header).

const { z } = require('zod');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const dayEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const createClassSchema = z
  .object({
    subjectId: z.number().int().positive(),
    teacherId: z.number().int().positive(),
    room: z.string().max(50).optional(),
    day: dayEnum,
    startTime: z.string().regex(timeRegex, 'startTime must be HH:MM (24h).'),
    endTime: z.string().regex(timeRegex, 'endTime must be HH:MM (24h).'),
    section: z.string().max(20).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'endTime must be after startTime.',
    path: ['endTime'],
  });

const updateClassSchema = z
  .object({
    subjectId: z.number().int().positive().optional(),
    teacherId: z.number().int().positive().optional(),
    room: z.string().max(50).optional(),
    day: dayEnum.optional(),
    startTime: z.string().regex(timeRegex, 'startTime must be HH:MM (24h).').optional(),
    endTime: z.string().regex(timeRegex, 'endTime must be HH:MM (24h).').optional(),
    section: z.string().max(20).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required.',
  })
  .refine(
    (data) => !(data.startTime && data.endTime) || data.startTime < data.endTime,
    { message: 'endTime must be after startTime.', path: ['endTime'] }
  );

module.exports = { createClassSchema, updateClassSchema };