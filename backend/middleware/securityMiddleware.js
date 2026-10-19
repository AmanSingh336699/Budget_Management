import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import sanitize from 'mongo-sanitize';
import mongoose from 'mongoose';

// 1. Strict CORS Middleware
export const configureCors = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5174'];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours preflight cache
  });
};

// 2. Helmet Security Headers (Clickjacking, HSTS, CSP, MIME Sniffing, etc.)
export const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"], // Clickjacking defense (frame-ancestors 'none')
      },
    },
    frameguard: {
      action: 'deny', // Anti-clickjacking (X-Frame-Options: DENY)
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true, // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  });
};

// Recursive in-place sanitizer (Express 5 compatible: mutates without reassigning req.query getter)
const cleanInPlace = (target) => {
  if (!target || typeof target !== 'object') return;
  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else if (typeof target[key] === 'object' && target[key] !== null) {
      cleanInPlace(target[key]);
    }
  }
};

// 3. NoSQL Injection Prevention Middleware
export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    cleanInPlace(req.body);
    sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    cleanInPlace(req.params);
    sanitize(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    cleanInPlace(req.query);
    sanitize(req.query);
  }
  next();
};

// 4. Rate Limiting: General API Limiter (DoS protection)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per 15 min per IP
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// 5. Rate Limiting: Strict Auth Limiter (Brute-Force Protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login/registration attempts from this IP. Please try again after 15 minutes.',
  },
});

// 6. Object-Level ID Validator (IDOR / CastError defense)
export const validateObjectIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid resource ID format: ${id}` });
    }
    next();
  };
};
