import React, { useState, useEffect } from 'react';
import { PlusCircle, Sliders, Tag, IndianRupee, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import Skeleton from './common/Skeleton';

const ExpenseForm = ({ onAdd, onBudgetUpdate, currentBudget, totalSpent, categoryStats = [], loading }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(currentBudget?.amount || 0);
  const [threshold, setThreshold] = useState(currentBudget?.threshold || 0);

  useEffect(() => {
    setBudgetAmount(currentBudget?.amount || 0);
    setThreshold(currentBudget?.threshold || 0);
  }, [currentBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    if (isRecurring && (!title.trim())) {
      Swal.fire({ icon: 'error', title: 'Invalid Input', text: 'Title is required.', background: 'var(--surface)', color: 'var(--foreground)' });
      return;
    }

    const expenseAmount = parseFloat(amount);
    
    if (isRecurring && expenseAmount <= 0) {
      Swal.fire({ icon: 'error', title: 'Invalid Amount', text: 'Amount must be greater than 0.', background: 'var(--surface)', color: 'var(--foreground)' });
      return;
    }

    const currentBalance = (currentBudget?.amount || 0) - totalSpent;
    const futureBalance = currentBalance - expenseAmount;

    if (futureBalance < 0) {
      const result = await Swal.fire({
        title: 'Negative Balance Warning',
        text: `This payment of ₹${expenseAmount} will leave your balance at ₹${futureBalance.toFixed(2)}. Proceed anyway?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel',
        background: 'var(--surface)',
        color: 'var(--foreground)'
      });

      if (!result.isConfirmed) return;
    } else if (futureBalance < threshold) {
      const result = await Swal.fire({
        title: 'Low Balance Warning',
        text: `This payment of ₹${expenseAmount} will bring your balance to ₹${futureBalance.toFixed(2)}, which is below your ₹${threshold} limit. Proceed anyway?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, pay it',
        cancelButtonText: 'Cancel',
        background: 'var(--surface)',
        color: 'var(--foreground)'
      });

      if (!result.isConfirmed) return;
    }

    // Category Budget check
    const catBudgets = JSON.parse(localStorage.getItem('budget_categories') || '{}');
    const limit = catBudgets[category];
    if (limit) {
      const currentSpent = categoryStats.find(s => s.name === category)?.value || 0;
      if (currentSpent + expenseAmount > limit) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: `⚠️ ${category} budget fully used or exceeded!`,
          showConfirmButton: false,
          timer: 3000,
          background: 'var(--surface)',
          color: 'var(--foreground)'
        });
      }
    }

    if (isRecurring) {
      const recurring = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
      recurring.push({
        id: Date.now().toString(),
        title,
        amount: expenseAmount,
        category,
        dayOfMonth: new Date().getDate(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('budget_recurring', JSON.stringify(recurring));
    }

    onAdd({ title, amount: expenseAmount, category });
    handleClear();
  };

  const handleClear = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setIsRecurring(false);
  };

  const handleWalletAction = (action) => {
    if (!budgetAmount && action !== 'set') {
      Swal.fire({ icon: 'warning', title: 'Empty Amount', text: 'Please enter an amount first.', background: 'var(--surface)', color: 'var(--foreground)' });
      return;
    }
    
    let newAmount = currentBudget?.amount || 0;
    const inputVal = parseFloat(budgetAmount || 0);
    
    if (action === 'add') {
      newAmount += inputVal;
    } else if (action === 'subtract') {
      newAmount = Math.max(0, newAmount - inputVal);
    } else if (action === 'set') {
      newAmount = inputVal;
    }
    
    onBudgetUpdate({ amount: newAmount, threshold: parseFloat(threshold || 0) });
    setBudgetAmount('');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        <Skeleton className="h-[380px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      {/* Record Expense Section */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-foreground">Record Expense</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Title</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Tag size={18} className="text-muted-foreground" />
              </div>
              <input 
                type="text"
                className="w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                placeholder="Rent, Groceries..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Amount</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IndianRupee size={18} className="text-muted-foreground" />
                </div>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Category</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Layers size={18} className="text-muted-foreground" />
                </div>
                <select 
                  className="w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Housing">Housing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="recurring" 
              checked={isRecurring} 
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-foreground cursor-pointer">
              🔁 Mark as Recurring
            </label>
          </div>
          
          <div className="mt-2 flex gap-3">
            <button type="submit" className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all">
              <PlusCircle size={18} /> Record
            </button>
            <button type="button" onClick={handleClear} className="flex flex-1 items-center justify-center rounded-xl border border-border bg-surface py-2.5 text-sm font-semibold text-muted-foreground hover:bg-surface-alt hover:text-foreground transition-all">
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Wallet Control Section */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-foreground">Wallet Control</h3>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Balance: ₹{((currentBudget?.amount || 0) - totalSpent).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Amount to Manage</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IndianRupee size={18} className="text-muted-foreground" />
              </div>
              <input 
                type="number"
                min="0"
                placeholder="e.g. 1000"
                className="w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                value={budgetAmount} 
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button 
              type="button" 
              onClick={() => handleWalletAction('add')}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20 py-2.5 text-sm font-semibold transition-all border border-green-500/20 outline-none"
            >
               ➕ Add Funds
            </button>
            <button 
              type="button" 
              onClick={() => handleWalletAction('subtract')}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-500/20 py-2.5 text-sm font-semibold transition-all border border-orange-500/20 outline-none"
            >
               ➖ Reduce
            </button>
          </div>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm font-semibold text-foreground">Set Exact Allocation & Threshold</label>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => handleWalletAction('set')}
                className="flex-1 rounded-xl border border-border bg-surface py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-surface-alt transition-all outline-none"
              >
                Set Allocation
              </button>
              <div className="relative flex-1">
                <input 
                  type="number"
                  min="0"
                  placeholder="Alert At"
                  className="w-full rounded-xl border border-border bg-surface-alt py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none" 
                  value={threshold} 
                  onChange={(e) => setThreshold(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
