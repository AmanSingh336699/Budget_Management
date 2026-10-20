import React, { useState, useMemo } from 'react';
import { 
  Trash2, ShoppingBag, Car, Zap, Play, Home, 
  Package, Receipt, Search, Filter, Download, Calendar 
} from 'lucide-react';
import Skeleton from './common/Skeleton';
import Swal from 'sweetalert2';
import { formatCurrency, STANDARD_CATEGORIES } from '../utils/formatters';

const CategoryIcon = ({ category }) => {
  const iconProps = { size: 18, strokeWidth: 2.2 };
  switch (category) {
    case 'Food': return <ShoppingBag {...iconProps} className="text-red-600 dark:text-red-400" />;
    case 'Transport': return <Car {...iconProps} className="text-blue-600 dark:text-blue-400" />;
    case 'Utilities': return <Zap {...iconProps} className="text-amber-600 dark:text-amber-400" />;
    case 'Entertainment': return <Play {...iconProps} className="text-purple-600 dark:text-purple-400" />;
    case 'Housing': return <Home {...iconProps} className="text-emerald-600 dark:text-emerald-400" />;
    default: return <Package {...iconProps} className="text-slate-600 dark:text-slate-400" />;
  }
};

const CategoryBg = ({ category }) => {
  switch (category) {
    case 'Food': return 'bg-red-500/10';
    case 'Transport': return 'bg-blue-500/10';
    case 'Utilities': return 'bg-amber-500/10';
    case 'Entertainment': return 'bg-purple-500/10';
    case 'Housing': return 'bg-emerald-500/10';
    default: return 'bg-slate-500/10';
  }
};

const RecentExpenses = ({ expenses = [], currentMonth, currentYear, onDelete, loading }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateRange, setDateRange] = useState('Selected Period');

  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return [];

    return expenses.filter(exp => {
      // 1. Search Query
      const searchMatch = !search.trim() || 
        (exp.title && exp.title.toLowerCase().includes(search.trim().toLowerCase()));
      
      // 2. Category Match
      const categoryMatch = category === 'All' || exp.category === category;
      
      // 3. Date Match
      let dateMatch = true;
      const expDate = new Date(exp.date);
      const now = new Date();

      if (!isNaN(expDate.getTime())) {
        if (dateRange === 'Selected Period') {
          if (currentMonth && currentYear) {
            dateMatch = (expDate.getMonth() + 1 === currentMonth) && 
                        (expDate.getFullYear() === currentYear);
          }
        } else if (dateRange === 'This Month') {
          dateMatch = (expDate.getMonth() === now.getMonth()) && 
                      (expDate.getFullYear() === now.getFullYear());
        } else if (dateRange === 'Last 3 Months') {
          const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          dateMatch = expDate >= d;
        } else if (dateRange === 'Last 6 Months') {
          const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          dateMatch = expDate >= d;
        }
      }

      return searchMatch && categoryMatch && dateMatch;
    });
  }, [expenses, search, category, dateRange, currentMonth, currentYear]);

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      Swal.fire({
        title: 'No Data', 
        text: 'No transactions found with the active filters to export.', 
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
    
    const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Type'];
    const rows = filteredExpenses.map(exp => {
      const expDate = new Date(exp.date);
      const dateStr = !isNaN(expDate.getTime()) ? expDate.toLocaleDateString('en-GB') : 'N/A';
      const cleanTitle = `"${(exp.title || '').replace(/"/g, '""').substring(0, 100)}"`;
      const cat = exp.category || 'Other';
      const amt = Number(exp.amount || 0).toFixed(2);
      return [dateStr, cleanTitle, cat, amt, 'Expense'].join(',');
    });
    
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `expenses_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs flex flex-col h-full min-h-[400px] sm:min-h-[500px] overflow-hidden">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">Transaction History</h3>
          <p className="text-xs text-muted-foreground">Manage and review all your logged expenses</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all border border-primary/20 shrink-0"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 mb-6 bg-surface-alt p-3.5 rounded-2xl border border-border">
        
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by title..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Category Filter */}
          <div className="relative">
            <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-surface border border-border rounded-xl text-sm appearance-none focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
            >
              <option value="All">All Categories</option>
              {STANDARD_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select 
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-surface border border-border rounded-xl text-sm appearance-none focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
            >
              <option value="Selected Period">Selected Period</option>
              <option value="This Month">Current Calendar Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

        </div>
      </div>
      
      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-18 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredExpenses.map((expense) => {
              const expDate = new Date(expense.date);
              const formattedDate = !isNaN(expDate.getTime()) 
                ? expDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Unknown date';

              return (
                <div 
                  key={expense._id} 
                  className="group flex items-center justify-between rounded-xl border border-border bg-surface-alt/70 p-3.5 transition-all hover:bg-surface hover:shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${CategoryBg({ category: expense.category })}`}>
                      <CategoryIcon category={expense.category} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{expense.title}</p>
                      <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                        {formattedDate} • <span className="font-medium">{expense.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-sm font-extrabold text-red-600 dark:text-red-400 whitespace-nowrap">
                      -{formatCurrency(expense.amount)}
                    </span>
                    <button 
                      onClick={() => onDelete(expense._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-600 focus:opacity-100 dark:hover:text-red-400 outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
                      aria-label={`Delete ${expense.title}`}
                      title="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-alt/30 p-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-xs ring-1 ring-border">
              <Receipt size={26} className="text-muted-foreground" />
            </div>
            {expenses.length === 0 ? (
              <>
                <h4 className="text-sm sm:text-base font-bold text-foreground">No Transactions Logged</h4>
                <p className="max-w-xs text-xs text-muted-foreground mt-1">Record your first expense using the quick entry form.</p>
              </>
            ) : (
              <>
                <h4 className="text-sm sm:text-base font-bold text-foreground">No Matching Transactions</h4>
                <p className="max-w-xs text-xs text-muted-foreground mt-1">
                  {category !== 'All' 
                    ? `No transactions in "${category}" for this filter.` 
                    : "No transactions match your search criteria."}
                </p>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default RecentExpenses;
