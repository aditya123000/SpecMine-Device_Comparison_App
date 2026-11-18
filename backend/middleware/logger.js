const logger = (req, res, next) => {
  const startedAt = performance.now();
  res.on("finish", () => {
    console.info(JSON.stringify({
      level: "info",
      event: "http_request",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    }));
  });
  next();
};

export default logger;
