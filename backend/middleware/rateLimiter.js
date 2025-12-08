const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for form submissions
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 form submissions per hour
  message: {
    success: false,
    message: 'Too many submissions, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Webhook limiter (more generous for automated systems)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 webhooks per minute
  message: {
    success: false,
    message: 'Webhook rate limit exceeded',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for trusted IPs
  skip: (req) => {
    const trustedIPs = (process.env.TRUSTED_WEBHOOK_IPS || '').split(',');
    return trustedIPs.includes(req.ip);
  }
});

// Very strict limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  formLimiter,
  webhookLimiter,
  strictLimiter
};
