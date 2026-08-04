// middleware/validate.js
// Generic zod-validation middleware factory — same behavior as the inline
// `validate()` in validators/authValidators.js, pulled out here so every
// Phase 2 validator file can share it instead of redefining it.
// (authRoutes.js / authValidators.js untouched — still works as before.)

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

module.exports = validate;