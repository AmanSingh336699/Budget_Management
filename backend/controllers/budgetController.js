import Budget from '../models/Budget.js';
import { getRequestParams } from '../utils/helpers.js';

export const getBudget = async (req, res, next) => {
  try {
    const { month, year, userId } = getRequestParams(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const targetMonth = month === 'all' ? new Date().getMonth() + 1 : month;
    const targetYear = year === 'all' ? new Date().getFullYear() : year;

    // Strict tenant isolation: always filter by authenticated userId
    let budget = await Budget.findOne({
      month: targetMonth,
      year: targetYear,
      userId,
    });

    if (!budget) {
      budget = await Budget.create({
        amount: 0,
        month: targetMonth,
        year: targetYear,
        threshold: 0,
        userId,
      });
    }

    return res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const { amount, threshold, month: bodyMonth, year: bodyYear } = req.body;
    const { month: qMonth, year: qYear, userId } = getRequestParams(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const month = bodyMonth ? parseInt(bodyMonth, 10) : (qMonth === 'all' ? new Date().getMonth() + 1 : qMonth);
    const year = bodyYear ? parseInt(bodyYear, 10) : (qYear === 'all' ? new Date().getFullYear() : qYear);

    // Strict tenant isolation
    let budget = await Budget.findOne({ month, year, userId });

    if (budget) {
      if (amount !== undefined) {
        budget.amount = Math.max(0, parseFloat(amount) || 0);
      }
      if (threshold !== undefined) {
        budget.threshold = Math.min(100, Math.max(0, parseFloat(threshold) || 0));
      }
      const updatedBudget = await budget.save();
      return res.status(200).json(updatedBudget);
    } else {
      const newBudget = await Budget.create({
        amount: amount !== undefined ? Math.max(0, parseFloat(amount) || 0) : 0,
        threshold: threshold !== undefined ? Math.min(100, Math.max(0, parseFloat(threshold) || 0)) : 0,
        month,
        year,
        userId,
      });
      return res.status(201).json(newBudget);
    }
  } catch (error) {
    next(error);
  }
};
