import express from 'express';
import { getExpenses, addExpense, deleteExpense, getExpenseStats } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getExpenses).post(protect, addExpense);
router.route('/stats').get(protect, getExpenseStats);
router.route('/:id').delete(protect, deleteExpense);

export default router;
