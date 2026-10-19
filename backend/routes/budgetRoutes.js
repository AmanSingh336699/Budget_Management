import express from 'express';
import { getBudget, updateBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateUpdateBudget,
  validateExpenseQuery,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// All budget routes require authentication (Function-level authorization)
router.use(protect);

router
  .route('/')
  .get(validateExpenseQuery, getBudget)
  .post(validateUpdateBudget, updateBudget)
  .put(validateUpdateBudget, updateBudget);

export default router;
