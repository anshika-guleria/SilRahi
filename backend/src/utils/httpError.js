export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    error: status === 500 ? "Internal server error" : err.message
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && status === 500) {
    payload.debug = err.message;
  }

  res.status(status).json(payload);
}
