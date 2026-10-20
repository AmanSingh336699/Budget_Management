import React from 'react';
import { IndianRupee, Wallet, TrendingDown, PiggyBank, AlertTriangle, AlertCircle } from 'lucide-react';
import Skeleton from './common/Skeleton';
import { formatCurrency, roundCurrency } from '../utils/formatters';

const BudgetSummary = ({ totalBudget, spent, savings, threshold, onConfirmAlert, loading }) => {
  const safeBudget = Number(totalBudget) || 0;
  const safeSpent = roundCurrency(spent);
  const safeSavings = roundCurrency(savings);
  const safeThreshold = Number(threshold) || 0;

  const remaining = roundCurrency(safeBudget - safeSpent);
  const isOverBudget = safeBudget > 0 && safeSpent > safeBudget;
  const isLowBalance = !isOverBudget && safeThreshold > 0 && remaining <= safeThreshold && remaining > 0;
  const isExhausted = !isOverBudget && safeBudget > 0 && remaining <= 0;

  const percentUsed = safeBudget > 0 
    ? Math.min(Math.round((safeSpent / safeBudget) * 100), 100) 
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Status / Alert Banner */}
      {(isOverBudget || isLowBalance || isExhausted) && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl p-4 border transition-all animate-in fade-in slide-in-from-top-2 ${
          isOverBudget 
            ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400' 
            : isExhausted
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
        }`}>
          <div className="flex items-center gap-3">
            {isOverBudget ? (
              <AlertCircle size={22} className="shrink-0 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle size={22} className="shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <div className="text-sm">
              <span className="font-bold">
                {isOverBudget 
                  ? 'Budget Exceeded: ' 
                  : isExhausted 
                  ? 'Budget Fully Spent: ' 
                  : 'Low Balance Warning: '}
              </span>
              <span className="font-medium">
                {isOverBudget 
                  ? `You have spent ${formatCurrency(safeSpent - safeBudget)} more than your monthly limit.`
                  : isExhausted
                  ? 'You have completely exhausted this month’s allocated budget.'
                  : `Remaining balance is below your ${formatCurrency(safeThreshold, { decimals: 0 })} alert threshold.`}
              </span>
            </div>
          </div>
          
          {onConfirmAlert && (
            <button 
              onClick={onConfirmAlert}
              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors focus:ring-2 focus:ring-primary/50 focus:outline-hidden"
            >
              + Quick ₹1,000 Top-up
            </button>
          )}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        
        {/* Total Budget Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs transition-all hover:shadow-md dark:hover:border-primary/40 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Budget
            </span>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
              <Wallet size={22} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 min-w-0">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
              {formatCurrency(safeBudget)}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {safeBudget > 0 ? `Alert threshold: ${formatCurrency(safeThreshold, { decimals: 0 })}` : 'No budget set for this period'}
            </p>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs transition-all hover:shadow-md dark:hover:border-red-500/40 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Spent
            </span>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 min-w-0">
            <h2 className={`text-xl sm:text-3xl font-extrabold tracking-tight truncate ${isOverBudget ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`}>
              {formatCurrency(safeSpent)}
            </h2>
            {safeBudget > 0 ? (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden border border-border/40">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentUsed >= 100 ? 'bg-red-500' : percentUsed >= 75 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>{percentUsed}% of budget</span>
                  <span>{isOverBudget ? 'Exceeded' : `${100 - percentUsed}% remaining`}</span>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Total outflow this month</p>
            )}
          </div>
        </div>

        {/* Remaining / Monthly Savings Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs transition-all hover:shadow-md dark:hover:border-green-500/40 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {safeSavings >= 0 ? 'Remaining Balance' : 'Deficit Amount'}
            </span>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              safeSavings >= 0 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              <PiggyBank size={22} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 min-w-0">
            <h2 className={`text-xl sm:text-3xl font-extrabold tracking-tight truncate ${
              safeSavings >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
            }`}>
              {safeSavings < 0 ? '-' : ''}{formatCurrency(Math.abs(safeSavings))}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {safeSavings >= 0 
                ? 'Safe available balance' 
                : 'Exceeded allocation limit'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BudgetSummary;
