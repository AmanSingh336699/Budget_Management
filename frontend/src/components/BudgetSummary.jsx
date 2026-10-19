import React from 'react';
import { DollarSign, Wallet, TrendingDown, AlertCircle } from 'lucide-react';
import Skeleton from './common/Skeleton';

const BudgetSummary = ({ totalBudget, spent, savings, threshold, onConfirmAlert, loading }) => {
  const remaining = totalBudget - spent;
  const isLowBalance = remaining <= threshold && remaining > 0;
  const isOverBudget = spent > totalBudget && totalBudget > 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(isLowBalance || isOverBudget) && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-4 border animate-in slide-in-from-top-4 fade-in ${
          isOverBudget 
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-900/50 dark:text-red-400' 
            : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-900/50 dark:text-amber-400'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <span className="text-sm font-semibold">
              {isOverBudget 
                ? "CRITICAL: You have exceeded your monthly budget allocation." 
                : `LOW FUNDS: Your remaining balance has fallen below your ₹${threshold.toLocaleString()} threshold.`}
            </span>
          </div>
          {!isOverBudget && (
            <button 
              onClick={onConfirmAlert}
              className="shrink-0 rounded-lg bg-amber-600 dark:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              Add ₹1,000
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
        {/* Total Budget Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow hover:shadow-md dark:hover:shadow-none dark:hover:bg-surface-alt">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">₹{totalBudget.toLocaleString()}</h2>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow hover:shadow-md dark:hover:shadow-none dark:hover:bg-surface-alt">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            <h2 className={`text-2xl font-bold tracking-tight ${isOverBudget ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`}>
              ₹{spent.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Monthly Savings Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow hover:shadow-md dark:hover:shadow-none dark:hover:bg-surface-alt">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monthly Savings</p>
            <h2 className={`text-2xl font-bold tracking-tight ${savings >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {savings < 0 ? '-' : ''}₹{Math.abs(savings).toLocaleString()}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
