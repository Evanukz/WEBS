class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err?.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
}

export { AppError, notFoundHandler, errorHandler };

