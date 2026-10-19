import React, { useState, useEffect } from 'react';
import { Trash2, Repeat } from 'lucide-react';
import Swal from 'sweetalert2';

const RecurringPanel = () => {
  const [recurring, setRecurring] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
    setRecurring(data);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const data = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
      setRecurring(data);
    };
    const interval = setInterval(handleStorageChange, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will stop auto-adding this expense.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      background: 'var(--surface)',
      color: 'var(--foreground)'
    }).then((result) => {
      if (result.isConfirmed) {
        const newData = recurring.filter(item => item.id !== id);
        localStorage.setItem('budget_recurring', JSON.stringify(newData));
        setRecurring(newData);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Recurring expense removed.', showConfirmButton: false, timer: 1500, background: 'var(--surface)', color: 'var(--foreground)' });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Repeat size={20} className="text-primary" />
        <h3 className="text-lg font-bold text-foreground">Recurring Expenses</h3>
      </div>
      
      {recurring.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 bg-surface-alt rounded-lg border border-dashed border-border text-center">No recurring expenses active.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
          {recurring.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-surface-alt hover:shadow-xs transition-all">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{item.category} • Adds on 1st</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-foreground whitespace-nowrap">₹{item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
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
