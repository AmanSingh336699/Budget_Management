import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import Swal from 'sweetalert2';

const CATEGORIES = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Transport', 'Housing', 'Other'];

const CategoryBudgets = ({ categoryStats }) => {
  const [budgets, setBudgets] = useState({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('budget_categories') || '{}');
    setBudgets(stored);
  }, []);

  const handleSetBudget = (cat, value) => {
    const val = parseFloat(value);
    if (isNaN(val) && value !== '') {
      Swal.fire({ icon: 'error', title: 'Invalid input', text: 'Please enter a valid number.', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: 'var(--surface)', color: 'var(--foreground)' });
      return;
    }
    if (val < 0) {
      Swal.fire({ icon: 'error', title: 'Invalid input', text: 'Budget must be a positive amount.', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: 'var(--surface)', color: 'var(--foreground)' });
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
          title: `⚠️ ${cat} budget fully used!`,
          showConfirmButton: false,
          timer: 3000,
          background: 'var(--surface)',
          color: 'var(--foreground)'
        });
      }
    }
    
    setBudgets(newBudgets);
    localStorage.setItem('budget_categories', JSON.stringify(newBudgets));
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col mt-8">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <Target size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-foreground">🎯 Category Budgets</h3>
        </div>
        <span className="text-sm font-medium text-primary hover:underline">{expanded ? 'Collapse' : 'Expand'}</span>
      </div>
      
      {expanded && (
        <div className="mt-6 space-y-4">
          {CATEGORIES.map(cat => {
            const limit = budgets[cat];
            const spent = categoryStats.find(s => s.name === cat)?.value || 0;
            
            let progress = 0;
            let barColor = 'bg-primary';
            if (limit) {
              progress = Math.min((spent / limit) * 100, 100);
              if (progress >= 100) barColor = 'bg-red-500';
              else if (progress >= 75) barColor = 'bg-orange-500';
              else barColor = 'bg-green-500';
            }

            return (
              <div key={cat} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">{cat}</label>
                  <input 
                    type="number" 
                    placeholder="No Limit"
                    value={limit || ''}
                    onChange={(e) => handleSetBudget(cat, e.target.value)}
                    className="w-28 text-right px-2 py-1.5 text-sm bg-surface-alt border border-border rounded-lg focus:outline-hidden focus:border-primary text-foreground"
                  />
                </div>
                {limit ? (
                  <div>
                    <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden border border-border/50">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground mt-1.5 flex justify-between uppercase">
                      <span>Spent: ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}</span>
                      {spent > limit && <span className="text-red-500">Over by ₹{(spent - limit).toLocaleString('en-IN')}</span>}
                      {spent === limit && <span className="text-red-500">Fully Used</span>}
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
