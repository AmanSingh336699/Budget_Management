import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a text value']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  }
}, {
  timestamps: true
});

expenseSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
