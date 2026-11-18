const createRateLimit = ({
  windowMs = 60_000,
  max = 100,
  keyPrefix = "api",
  maxKeys = 10_000,
} = {}) => {
  const clients = new Map();
  let lastCleanupAt = 0;

  const removeExpiredBuckets = (now) => {
    for (const [clientKey, bucket] of clients) {
      if (bucket.resetAt <= now) clients.delete(clientKey);
    }
    lastCleanupAt = now;
  };

  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip}`;
    const now = Date.now();

    if (now - lastCleanupAt >= windowMs) removeExpiredBuckets(now);

    const current = clients.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    if (!current && clients.size >= maxKeys) {
      removeExpiredBuckets(now);

      if (clients.size >= maxKeys) {
        let earliestKey;
        let earliestResetAt = Infinity;
        for (const [clientKey, existingBucket] of clients) {
          if (existingBucket.resetAt < earliestResetAt) {
            earliestKey = clientKey;
            earliestResetAt = existingBucket.resetAt;
          }
        }
        if (earliestKey !== undefined) clients.delete(earliestKey);
      }
    }

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
};

export { createRateLimit };
