import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Sliders, Tag, IndianRupee, Layers, Calendar, Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Swal from 'sweetalert2';
import Skeleton from './common/Skeleton';
import { formatCurrency, roundCurrency, STANDARD_CATEGORIES } from '../utils/formatters';

/** Derive the default date string from the selected month/year */
function getDefaultDate(month, year) {
  if (!month || !year) return new Date().toISOString().slice(0, 10);
  const now = new Date();
  if (now.getMonth() + 1 === month && now.getFullYear() === year) {
    return now.toISOString().slice(0, 10);
  }
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

const ExpenseForm = ({ onAdd, onBudgetUpdate, currentBudget, totalSpent, categoryStats = [], currentMonth, currentYear, loading }) => {
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'wallet'
  
  // Compute the default date during render — no effect needed
  const defaultDate = useMemo(() => getDefaultDate(currentMonth, currentYear), [currentMonth, currentYear]);

  // Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);

  // Reset date whenever the derived default changes (month/year navigation)
  useEffect(() => {
    setDate(defaultDate);
  }, [defaultDate]);

  // Wallet / Budget State — sync from prop
  const [budgetAmount, setBudgetAmount] = useState(currentBudget?.amount || 0);
  const [threshold, setThreshold] = useState(currentBudget?.threshold || 0);

  // Sync local budget state when the prop changes (intentional derived state sync)
  useEffect(() => {
    setBudgetAmount(currentBudget?.amount || 0);
    setThreshold(currentBudget?.threshold || 0);
  }, [currentBudget]);

  const handleClear = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setIsRecurring(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const expenseAmount = roundCurrency(parseFloat(amount));
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'Invalid Amount', 
        text: 'Please enter a valid amount greater than 0.', 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
      return;
    }

    const budgetLimit = currentBudget?.amount || 0;
    const currentBalance = roundCurrency(budgetLimit - totalSpent);
    const futureBalance = roundCurrency(currentBalance - expenseAmount);

    // Alert if user has an active budget and this exceeds it
    if (budgetLimit > 0) {
      if (futureBalance < 0) {
        const result = await Swal.fire({
          title: 'Deficit Alert',
          text: `This transaction of ${formatCurrency(expenseAmount)} will exceed your monthly budget by ${formatCurrency(Math.abs(futureBalance))}. Do you want to proceed?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, proceed',
          cancelButtonText: 'Cancel',
          background: 'var(--surface)',
          color: 'var(--foreground)'
        });

        if (!result.isConfirmed) return;
      } else if (threshold > 0 && futureBalance < threshold) {
        const result = await Swal.fire({
          title: 'Low Balance Warning',
          text: `This expense will leave your remaining balance at ${formatCurrency(futureBalance)}, falling below your ${formatCurrency(threshold, { decimals: 0 })} alert threshold. Proceed?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, proceed',
          cancelButtonText: 'Cancel',
          background: 'var(--surface)',
          color: 'var(--foreground)'
        });

        if (!result.isConfirmed) return;
      }
    }

    // Category target limit warning
    try {
      const catBudgets = JSON.parse(localStorage.getItem('budget_categories') || '{}');
      const catLimit = catBudgets[category];
      if (catLimit && catLimit > 0) {
        const currentSpent = categoryStats.find(s => s.name === category)?.value || 0;
        if (currentSpent + expenseAmount > catLimit) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: `⚠️ ${category} target exceeded!`,
            showConfirmButton: false,
            timer: 3000,
            background: 'var(--surface)',
            color: 'var(--foreground)'
          });
        }
      }
    } catch {
      // Ignore category budget read errors
    }

    // Handle Recurring
    if (isRecurring) {
      try {
        const recurring = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
        const parsedDate = new Date(date);
        const dayOfMonth = !isNaN(parsedDate.getTime()) ? parsedDate.getDate() : new Date().getDate();
        recurring.push({
          id: Date.now().toString(),
          title: title.trim(),
          amount: expenseAmount,
          category,
          dayOfMonth,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('budget_recurring', JSON.stringify(recurring));
      } catch {
        // Ignore recurring storage errors
      }
    }

    onAdd({ 
      title: title.trim(), 
      amount: expenseAmount, 
      category, 
      date: date ? new Date(date) : new Date() 
    });

    handleClear();
  };

  const handleSaveBudget = () => {
    const parsedAmount = Math.max(0, parseFloat(budgetAmount) || 0);
    const parsedThreshold = Math.max(0, parseFloat(threshold) || 0);

    onBudgetUpdate({ amount: parsedAmount, threshold: parsedThreshold });
  };

  const handleQuickAddFunds = (extra) => {
    const current = currentBudget?.amount || 0;
    const newAmt = roundCurrency(current + extra);
    setBudgetAmount(newAmt);
    onBudgetUpdate({ amount: newAmt, threshold: parseFloat(threshold || 0) });
  };

  if (loading) {
    return <Skeleton className="h-[360px] w-full rounded-2xl" />;
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs flex flex-col">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
        <div className="flex gap-2 p-1 bg-surface-alt rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'expense'
                ? 'bg-surface text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Record Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'wallet'
                ? 'bg-surface text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Wallet & Limits
          </button>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
          Bal: {formatCurrency((currentBudget?.amount || 0) - totalSpent, { decimals: 0 })}
        </span>
      </div>

      {activeTab === 'expense' ? (
        /* Record Expense Form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
            <div className="relative">
              <Tag size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text"
                className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="e.g. Grocery store, Uber, WiFi bill..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
              <div className="relative">
                <Layers size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select 
                  className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {STANDARD_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense Date</label>
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="date"
                  className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-5 pt-1">
              <input 
                type="checkbox" 
                id="recurring" 
                checked={isRecurring} 
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-primary bg-surface border-border rounded-sm focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <label htmlFor="recurring" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                🔁 Monthly Auto-Repeat
              </label>
            </div>
          </div>
          
          <div className="mt-3 flex gap-2.5">
            <button 
              type="submit" 
              className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-4 focus:ring-primary/20 transition-all"
            >
              <PlusCircle size={17} /> Record Transaction
            </button>
            <button 
              type="button" 
              onClick={handleClear} 
              className="flex-1 flex items-center justify-center rounded-xl border border-border bg-surface py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-surface-alt hover:text-foreground transition-all"
            >
              Clear
            </button>
          </div>
        </form>
      ) : (
        /* Wallet & Budget Settings */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Budget Limit</label>
              <span className="text-xs text-muted-foreground">Current: {formatCurrency(currentBudget?.amount || 0)}</span>
            </div>
            <div className="relative">
              <IndianRupee size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 25000"
                className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all" 
                value={budgetAmount} 
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Low Balance Alert (₹)</label>
              <span className="text-xs text-muted-foreground">Alerts when below this</span>
            </div>
            <div className="relative">
              <Bell size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 2000"
                className="w-full rounded-xl border border-border bg-surface-alt py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all" 
                value={threshold} 
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Top-Up Badges */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Quick Top-Up Allocation</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAddFunds(1000)}
                className="py-1.5 rounded-lg border border-border bg-surface-alt hover:bg-surface text-xs font-bold text-foreground transition-all"
              >
                +₹1,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFunds(5000)}
                className="py-1.5 rounded-lg border border-border bg-surface-alt hover:bg-surface text-xs font-bold text-foreground transition-all"
              >
                +₹5,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFunds(10000)}
                className="py-1.5 rounded-lg border border-border bg-surface-alt hover:bg-surface text-xs font-bold text-foreground transition-all"
              >
                +₹10,000
              </button>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleSaveBudget}
            className="mt-2 w-full rounded-xl bg-primary py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-4 focus:ring-primary/20 transition-all"
          >
            Save Budget & Alert Threshold
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
