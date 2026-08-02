const errorHandler = (err, req, res, _next) => {
  void _next;

  console.error("========== ERROR ==========");
  console.error(err);
  console.error(err.stack);
  console.error("===========================");

  const statusCode = res.statusCode >= 400 ? res.statusCode : err.status || 500;
  const message = err.message || "Server Error";

  return res.status(statusCode).json({ message });
};

export default errorHandler;