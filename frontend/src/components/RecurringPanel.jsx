import React, { useState, useEffect } from 'react';
import { Trash2, Repeat, CalendarCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { formatCurrency, getOrdinalSuffix } from '../utils/formatters';

const RecurringPanel = () => {
  const [recurring, setRecurring] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('budget_recurring') || '[]');
    } catch {
      return [];
    }
  });

  const loadData = () => {
    try {
      const data = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
      setRecurring(data);
    } catch {
      setRecurring([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id, title) => {
    Swal.fire({
      title: 'Remove Recurring Expense?',
      text: `"${title}" will no longer auto-record every month.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      background: 'var(--surface)',
      color: 'var(--foreground)'
    }).then((result) => {
      if (result.isConfirmed) {
        const newData = recurring.filter(item => item.id !== id);
        try {
          localStorage.setItem('budget_recurring', JSON.stringify(newData));
        } catch {
          // Ignore localStorage errors
        }
        setRecurring(newData);
        Swal.fire({ 
          toast: true, 
          position: 'top-end', 
          icon: 'success', 
          title: 'Recurring expense removed', 
          showConfirmButton: false, 
          timer: 1500, 
          background: 'var(--surface)', 
          color: 'var(--foreground)' 
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Repeat size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">Subscriptions & Recurring</h3>
            <p className="text-xs text-muted-foreground">{recurring.length} automated monthly payment{recurring.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>
      
      {recurring.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border bg-surface-alt/40 text-center">
          <CalendarCheck size={24} className="mx-auto text-muted-foreground mb-1.5 opacity-60" />
          <p className="text-xs font-semibold text-muted-foreground">No recurring expenses active</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Check "Monthly Auto-Repeat" when recording to automate bills.</p>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          {recurring.map(item => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 border border-border/80 rounded-xl bg-surface-alt/70 hover:bg-surface hover:shadow-xs transition-all"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">{item.title}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                  {item.category} • Adds on {getOrdinalSuffix(item.dayOfMonth || 1)}
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs sm:text-sm font-extrabold text-foreground whitespace-nowrap">
                  {formatCurrency(item.amount)}
                </span>
                <button 
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                  aria-label={`Remove recurring ${item.title}`}
                  title="Remove recurring item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringPanel;
