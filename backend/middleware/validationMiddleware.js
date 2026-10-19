import { body, query, validationResult } from 'express-validator';

// Middleware to check validation results and return formatted 400 errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorDetails,
    });
  }
  next();
};

// Authentication Validation Rules
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),
  validateRequest,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password is too long'),
  validateRequest,
];

// Expense Validation Rules
export const validateAddExpense = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .escape(),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0, max: 1000000000 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Food', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Other'])
    .withMessage('Invalid expense category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date string'),
  validateRequest,
];

export const validateExpenseQuery = [
  query('month')
    .optional()
    .custom((val) => {
      if (val === 'all') return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1 && num <= 12;
    })
    .withMessage('Month must be an integer between 1 and 12, or "all"'),
  query('year')
    .optional()
    .custom((val) => {
      if (val === 'all') return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 2000 && num <= 2100;
    })
    .withMessage('Year must be an integer between 2000 and 2100, or "all"'),
  validateRequest,
];

// Budget Validation Rules
export const validateUpdateBudget = [
  body('amount')
    .optional()
    .isFloat({ min: 0, max: 1000000000 })
    .withMessage('Budget amount must be a number greater than or equal to 0'),
  body('threshold')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Threshold must be a percentage between 0 and 100'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
  validateRequest,
];
