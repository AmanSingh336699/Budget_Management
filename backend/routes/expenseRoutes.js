import express from 'express';
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateAddExpense,
  validateExpenseQuery,
} from '../middleware/validationMiddleware.js';
import { validateObjectIdParam } from '../middleware/securityMiddleware.js';

const router = express.Router();

// All expense routes require authentication (Function-level authorization)
router.use(protect);

router
  .route('/')
  .get(validateExpenseQuery, getExpenses)
  .post(validateAddExpense, addExpense);

router.route('/stats').get(validateExpenseQuery, getExpenseStats);

router.route('/:id').delete(validateObjectIdParam('id'), deleteExpense);

export default router;
