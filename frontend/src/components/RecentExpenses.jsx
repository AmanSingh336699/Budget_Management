import React, { useState, useMemo } from 'react';
import { Trash2, ShoppingBag, Car, Zap, Play, Home, Package, Receipt, Search, Filter, Download } from 'lucide-react';
import Skeleton from './common/Skeleton';
import Swal from 'sweetalert2';

const CategoryIcon = ({ category }) => {
  const iconProps = { size: 18, strokeWidth: 2.5 };
  switch (category) {
    case 'Food': return <ShoppingBag {...iconProps} className="text-red-600 dark:text-red-400" />;
    case 'Transport': return <Car {...iconProps} className="text-blue-600 dark:text-blue-400" />;
    case 'Utilities': return <Zap {...iconProps} className="text-amber-600 dark:text-amber-400" />;
    case 'Entertainment': return <Play {...iconProps} className="text-purple-600 dark:text-purple-400" />;
    case 'Housing': return <Home {...iconProps} className="text-orange-600 dark:text-orange-400" />;
    default: return <Package {...iconProps} className="text-slate-600 dark:text-slate-400" />;
  }
};

const CategoryBg = ({ category }) => {
  switch (category) {
    case 'Food': return 'bg-red-50 dark:bg-red-500/10';
    case 'Transport': return 'bg-blue-50 dark:bg-blue-500/10';
    case 'Utilities': return 'bg-amber-50 dark:bg-amber-500/10';
    case 'Entertainment': return 'bg-purple-50 dark:bg-purple-500/10';
    case 'Housing': return 'bg-orange-50 dark:bg-orange-500/10';
    default: return 'bg-slate-50 dark:bg-slate-500/10';
  }
};

const RecentExpenses = ({ expenses, onDelete, loading }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateRange, setDateRange] = useState('This Month');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const searchMatch = !search.trim() || exp.title.toLowerCase().includes(search.trim().toLowerCase());
      
      const categoryMatch = category === 'All' || exp.category === category;
      
      let dateMatch = true;
      const expDate = new Date(exp.date);
      const now = new Date();
      if (dateRange === 'This Month') {
        dateMatch = expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'Last 3 Months') {
        const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        dateMatch = expDate >= d;
      } else if (dateRange === 'Last 6 Months') {
        const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        dateMatch = expDate >= d;
      }
      return searchMatch && categoryMatch && dateMatch;
    });
  }, [expenses, search, category, dateRange]);

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      Swal.fire({
        title: 'No Data', 
        text: 'No data to export. Try changing filters.', 
        icon: 'warning', 
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 2000, 
        background: 'var(--surface)', 
        color: 'var(--foreground)'
      });
      return;
    }
    
    const headers = ['Date', 'Title', 'Category', 'Amount (₹)', 'Type'];
    const rows = filteredExpenses.map(exp => {
      const date = new Date(exp.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
      const title = `"${(exp.title || '').replace(/"/g, '""').substring(0, 100)}"`;
      const cat = exp.category;
      const amount = exp.amount; 
      const type = 'Expense';
      return [date, title, cat, amount, type].join(',');
    });
    
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 7);
    link.setAttribute('download', `expense_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col h-full min-h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
        >
          <Download size={16} /> Download Report
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-6 bg-surface-alt p-3 rounded-xl border border-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Transport">Transport</option>
              <option value="Housing">Housing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="relative flex-1">
            <select 
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              <option value="This Month">This Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredExpenses.map((expense) => (
              <div 
                key={expense._id} 
                className="group flex items-center justify-between rounded-xl border border-border bg-surface-alt p-4 transition-all hover:bg-surface hover:shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${CategoryBg({ category: expense.category })}`}>
                    <CategoryIcon category={expense.category} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{expense.title}</p>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">
                      {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {expense.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-sm font-bold text-red-600 dark:text-red-500 whitespace-nowrap">
                    -₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={() => onDelete(expense._id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-red-500/10 dark:hover:text-red-400 outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-alt/50 p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-xs ring-1 ring-border">
              <Receipt size={28} className="text-muted-foreground" />
            </div>
            {expenses.length === 0 ? (
              <React.Fragment>
                <h4 className="mb-1 text-base font-bold text-foreground">No Transactions Yet</h4>
                <p className="max-w-xs text-sm text-muted-foreground">Add your first expense using the form to start tracking your spending.</p>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h4 className="mb-1 text-base font-bold text-foreground">No Results Found</h4>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {category !== 'All' ? `No transactions found in ${category}.` : "No transactions match your search."}
                </p>
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentExpenses;
