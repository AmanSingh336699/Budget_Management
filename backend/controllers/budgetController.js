import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import { getRequestParams } from '../utils/helpers.js';

export const getBudget = async (req, res) => {
  try {
    const { month, year, userId } = getRequestParams(req);

    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }
    
    let budget = await Budget.findOne({ month, year, userId: new mongoose.Types.ObjectId(userId) });
    
    if (!budget) {
      budget = await Budget.create({ amount: 0, month, year, threshold: 0, userId: new mongoose.Types.ObjectId(userId) });
    }
    
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { amount, threshold, month: bodyMonth, year: bodyYear } = req.body;
    const { month: qMonth, year: qYear, userId } = getRequestParams(req);
    
    const month = bodyMonth || qMonth;
    const year = bodyYear || qYear;

    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }
    
    let budget = await Budget.findOne({ month, year, userId: new mongoose.Types.ObjectId(userId) });
    
    if (budget) {
      if (amount !== undefined) budget.amount = amount;
      if (threshold !== undefined) budget.threshold = threshold;
      const updatedBudget = await budget.save();
      res.status(200).json(updatedBudget);
    } else {
      const newBudget = await Budget.create({ 
        amount: amount || 0, 
        threshold: threshold || 0, 
        month, 
        year,
        userId: new mongoose.Types.ObjectId(userId)
      });
      res.status(201).json(newBudget);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
