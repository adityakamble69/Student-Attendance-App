// validators/leaveValidators.js
// Phase 7 — Leave Management Validation Schemas.

const { z } = require('zod');

const applyLeaveSchema = z.object({
  reason: z.string({ required_error: 'reason is required' }).min(3, 'Reason must be at least 3 characters'),
  fromDate: z
    .string({ required_error: 'fromDate is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'fromDate must be YYYY-MM-DD'),
  toDate: z
    .string({ required_error: 'toDate is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'toDate must be YYYY-MM-DD'),
});

const reviewLeaveSchema = z.object({
  status: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: 'status must be Approved or Rejected' }),
  }),
});

module.exports = {
  applyLeaveSchema,
  reviewLeaveSchema,
};
