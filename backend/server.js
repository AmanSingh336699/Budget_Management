import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { validateEnv } from './config/validateEnv.js';
import {
  configureCors,
  configureHelmet,
  mongoSanitizeMiddleware,
  globalLimiter,
} from './middleware/securityMiddleware.js';
import budgetRoutes from './routes/budgetRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Validate critical security configs at startup
validateEnv();

const app = express();

// Disable X-Powered-By header (prevents tech stack disclosure)
app.disable('x-powered-by');

// 1. Security Headers (Clickjacking defense, CSP, HSTS, MIME sniffing)
app.use(configureHelmet());

// 2. Strict CORS policy
app.use(configureCors());

// 3. Request body size limit (prevents DoS / memory exhaustion)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 4. NoSQL injection sanitization
app.use(mongoSanitizeMiddleware);

// 5. Global API Rate Limiter
app.use('/api', globalLimiter);

// 6. Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Resource not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Safe Error Handler (prevents stack-trace / sensitive data leaks)
app.use((err, req, res, next) => {
  // CORS Origin error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }

  // Request entity too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload exceeded limit (max 10kb)' });
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Malformed JSON payload' });
  }

  // Log error internally for monitoring without leaking to client
  console.error('[Server Error]', {
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: isProduction && statusCode === 500
      ? 'An unexpected server error occurred'
      : err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[DATABASE] Server started without active DB connection. Reconnection will be attempted.');
  }

  app.listen(PORT, () => {
    console.log(`[SECURE SERVER] Running on port ${PORT}`);
  });
};

startServer();
