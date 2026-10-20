import Expense from '../models/Expense.js';
import mongoose from 'mongoose';
import { getRequestParams } from '../utils/helpers.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { month, year, userId } = getRequestParams(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Tenant Isolation: strictly query by authenticated user's ID
    const query = { userId };

    if (month !== 'all' && year !== 'all') {
      const numMonth = parseInt(month, 10);
      const numYear = parseInt(year, 10);
      const startDate = new Date(Date.UTC(numYear, numMonth - 1, 1));
      const endDate = new Date(Date.UTC(numYear, numMonth, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month === 'all' && year !== 'all') {
      const numYear = parseInt(year, 10);
      const startDate = new Date(Date.UTC(numYear, 0, 1));
      const endDate = new Date(Date.UTC(numYear, 11, 31, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();
    return res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
};

export const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate date input if provided
    let expenseDate = new Date();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        expenseDate = parsedDate;
      }
    }

    // Precision rounding to 2 decimal places to avoid floating point bugs
    const parsedAmount = Math.round((parseFloat(amount) || 0) * 100) / 100;

    // Object-level authorization: always assign to verified authenticated user
    const expense = await Expense.create({
      title: String(title).trim(),
      amount: parsedAmount,
      category: String(category).trim(),
      date: expenseDate,
      userId,
    });

    return res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate ObjectId format before querying (prevents CastError crash)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense ID format' });
    }

    // BOLA/IDOR Defense: query strictly includes userId
    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    await expense.deleteOne();
    return res.status(200).json({ id, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getExpenseStats = async (req, res, next) => {
  try {
    const { month, year, userId } = getRequestParams(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (month !== 'all' && year !== 'all') {
      const numMonth = parseInt(month, 10);
      const numYear = parseInt(year, 10);
      const startDate = new Date(Date.UTC(numYear, numMonth - 1, 1));
      const endDate = new Date(Date.UTC(numYear, numMonth, 0, 23, 59, 59, 999));
      matchQuery.date = { $gte: startDate, $lte: endDate };
    } else if (month === 'all' && year !== 'all') {
      const numYear = parseInt(year, 10);
      const startDate = new Date(Date.UTC(numYear, 0, 1));
      const endDate = new Date(Date.UTC(numYear, 11, 31, 23, 59, 59, 999));
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    // Tenant Isolation: strictly match authenticated userId in aggregation
    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          name: '$_id',
          value: { $round: ['$totalAmount', 2] },
          _id: 0,
        },
      },
      { $sort: { value: -1 } }
    ]);

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
