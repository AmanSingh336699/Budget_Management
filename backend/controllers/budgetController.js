import Budget from '../models/Budget.js';
import { getRequestParams } from '../utils/helpers.js';

export const getBudget = async (req, res, next) => {
  try {
    const { month, year, userId } = getRequestParams(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const targetMonth = month === 'all' ? new Date().getMonth() + 1 : parseInt(month, 10);
    const targetYear = year === 'all' ? new Date().getFullYear() : parseInt(year, 10);

    // Atomic findOrCreate to eliminate race conditions & duplicate key errors
    const budget = await Budget.findOneAndUpdate(
      { month: targetMonth, year: targetYear, userId },
      { $setOnInsert: { amount: 0, threshold: 0 } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

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

    const month = bodyMonth ? parseInt(bodyMonth, 10) : (qMonth === 'all' ? new Date().getMonth() + 1 : parseInt(qMonth, 10));
    const year = bodyYear ? parseInt(bodyYear, 10) : (qYear === 'all' ? new Date().getFullYear() : parseInt(qYear, 10));

    const updateFields = {};
    if (amount !== undefined) {
      updateFields.amount = Math.max(0, parseFloat(amount) || 0);
    }
    if (threshold !== undefined) {
      updateFields.threshold = Math.max(0, parseFloat(threshold) || 0);
    }

    // Atomic findOneAndUpdate with upsert
    const budget = await Budget.findOneAndUpdate(
      { month, year, userId },
      { $set: updateFields },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};
