const errorHandler = (err, req, res, _next) => {
  void _next;
  const statusCode = err.status || 500;
  const message = err.message || "Server Error";

  return res.status(statusCode).json({ msg: message });
};

export default errorHandler;
