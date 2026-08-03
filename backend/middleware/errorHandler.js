// middleware/errorHandler.js
// Central error handler — keep response shape consistent with architecture.md §5:
// { success: boolean, data?: any, error?: string }

function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  const status = err.status || 500;
  const message = err.expose ? err.message : 'Internal server error.';

  res.status(status).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
