const errorHandler = (err, req, res, _next) => {
  void _next;

  const isUniqueConflict = err.code === "23505";
  const isForeignKeyConflict = err.code === "23503";
  const statusCode = isUniqueConflict || isForeignKeyConflict
    ? 409
    : res.statusCode >= 400
      ? res.statusCode
      : err.status || 500;
  console.error(JSON.stringify({ level: "error", event: "request_failed", requestId: req.requestId, statusCode, message: err.message, stack: err.stack }));
  const message = statusCode >= 500
    ? "Internal server error"
    : isUniqueConflict
      ? "A record with that value already exists"
      : isForeignKeyConflict
        ? "The request references a record that no longer exists"
        : err.message || "Request failed";
  const code = /^[A-Z][A-Z_]{2,39}$/.test(err.code ?? "")
    ? err.code
    : statusCode === 400
      ? "VALIDATION_ERROR"
      : statusCode === 401
        ? "UNAUTHORIZED"
        : statusCode === 403
          ? "FORBIDDEN"
          : statusCode === 404
            ? "NOT_FOUND"
            : statusCode === 409
              ? "CONFLICT"
              : "INTERNAL_ERROR";

  return res.status(statusCode).json({ message, code, requestId: req.requestId });
};

export default errorHandler;
