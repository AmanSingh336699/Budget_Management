import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import { formatCurrency, STANDARD_CATEGORIES } from '../utils/formatters';

const CategoryBudgets = ({ categoryStats = [] }) => {
  const [budgets, setBudgets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('budget_categories') || '{}');
    } catch {
      return {};
    }
  });
  const [expanded, setExpanded] = useState(false);

  const handleSetBudget = (cat, value) => {
    const val = parseFloat(value);
    if (isNaN(val) && value !== '') {
      Swal.fire({ 
        icon: 'error', 
        title: 'Invalid Input', 
        text: 'Please enter a valid numeric amount.', 
        toast: true, 
        position: 'top-end', 
        timer: 2000, 
        showConfirmButton: false, 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
      return;
    }
    if (val < 0) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Invalid Amount', 
        text: 'Category limit must be greater than or equal to 0.', 
        toast: true, 
        position: 'top-end', 
        timer: 2000, 
        showConfirmButton: false, 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
      return;
    }

    const newBudgets = { ...budgets };
    if (value === '' || val === 0) {
      delete newBudgets[cat];
    } else {
      newBudgets[cat] = val;
      
      const spent = categoryStats.find(s => s.name === cat)?.value || 0;
      if (spent >= val) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: `⚠️ ${cat} budget limit reached!`,
          showConfirmButton: false,
          timer: 3000,
          background: 'var(--surface)',
          color: 'var(--foreground)'
        });
      }
    }
    
    setBudgets(newBudgets);
    try {
      localStorage.setItem('budget_categories', JSON.stringify(newBudgets));
    } catch (err) {
      console.error('Failed to save category budgets to localStorage:', err);
    }
  };

  const activeLimitsCount = Object.keys(budgets).length;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs flex flex-col">
      <div 
        className="flex items-center justify-between cursor-pointer select-none" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">Category Targets</h3>
            <p className="text-xs text-muted-foreground">
              {activeLimitsCount > 0 ? `${activeLimitsCount} active limit${activeLimitsCount > 1 ? 's' : ''}` : 'Set custom limits per category'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <span>{expanded ? 'Hide' : 'Configure'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-5 space-y-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
          {STANDARD_CATEGORIES.map(cat => {
            const limit = budgets[cat];
            const spent = categoryStats.find(s => s.name === cat)?.value || 0;
            
            let progress = 0;
            let barColor = 'bg-primary';
            if (limit && limit > 0) {
              progress = Math.min((spent / limit) * 100, 100);
              if (progress >= 100) barColor = 'bg-red-500';
              else if (progress >= 75) barColor = 'bg-amber-500';
              else barColor = 'bg-emerald-500';
            }

            return (
              <div key={cat} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-alt/60 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">{cat}</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-semibold">₹</span>
                    <input 
                      type="number" 
                      placeholder="No limit"
                      value={limit || ''}
                      onChange={(e) => handleSetBudget(cat, e.target.value)}
                      className="w-24 text-right px-2.5 py-1 text-xs font-semibold bg-surface border border-border rounded-lg focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                    />
                  </div>
                </div>

                {limit && limit > 0 ? (
                  <div className="mt-1 space-y-1">
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-[10px] font-bold tracking-wider text-muted-foreground flex justify-between uppercase">
                      <span>Spent: {formatCurrency(spent, { decimals: 0 })} / {formatCurrency(limit, { decimals: 0 })}</span>
                      {spent > limit ? (
                        <span className="text-red-500">Exceeded by {formatCurrency(spent - limit, { decimals: 0 })}</span>
                      ) : (
                        <span className="text-emerald-500">{formatCurrency(limit - spent, { decimals: 0 })} left</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryBudgets;
