const errorHandler = (err, req, res, _next) => {
  void _next;
  const statusCode = res.statusCode >= 400 ? res.statusCode : err.status || 500;
  const message = err.message || "Server Error";

  return res.status(statusCode).json({ message });
};

export default errorHandler;
