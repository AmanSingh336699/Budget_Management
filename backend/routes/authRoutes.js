import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authLimiter } from '../middleware/securityMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Apply brute-force rate limiter & express-validator schemas
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

export default router;
