const clients = new Map();

const createRateLimit = ({ windowMs = 60_000, max = 100, keyPrefix = "api" } = {}) =>
  (req, res, next) => {
    const key = `${keyPrefix}:${req.ip}`;
    const now = Date.now();
    const current = clients.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    bucket.count += 1;
    clients.set(key, bucket);

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - bucket.count));
    res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({
        message: "Too many requests. Please try again shortly.",
        code: "RATE_LIMITED",
        requestId: req.requestId,
      });
    }

    return next();
  };

export { createRateLimit };
