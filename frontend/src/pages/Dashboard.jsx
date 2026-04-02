import React, { useState, useEffect } from 'react';
import { budgetService, expenseService } from '../services/api';
import BudgetSummary from '../components/BudgetSummary';
import ExpenseForm from '../components/ExpenseForm';
import CategoryChart from '../components/CategoryChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import CategoryBudgets from '../components/CategoryBudgets';
import RecurringPanel from '../components/RecurringPanel';
import RecentExpenses from '../components/RecentExpenses';
import Navbar from '../components/layout/Navbar';
import Skeleton from '../components/common/Skeleton';
import { Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [budget, setBudget] = useState({ amount: 0, threshold: 0 });
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const processRecurringExpenses = async () => {
    const today = new Date();
    if (today.getDate() !== 1) return false;
    
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      const log = JSON.parse(localStorage.getItem('budget_recurring_log') || '{}');
      const recurring = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
      let addedCount = 0;
      
      for (const item of recurring) {
        if (log[item.id] !== currentMonthYear) {
          if (!item.title || item.amount <= 0) continue;
          
          await expenseService.addExpense({
            title: item.title,
            amount: parseFloat(item.amount),
            category: item.category,
            date: today
          });
          
          log[item.id] = currentMonthYear;
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        localStorage.setItem('budget_recurring_log', JSON.stringify(log));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `✅ ${addedCount} recurring expenses added for ${MONTHS[today.getMonth()]}!`, showConfirmButton: false, timer: 3000, background: 'var(--surface)', color: 'var(--foreground)' });
        return true;
      }
    } catch (error) {
      console.error('Recurring error:', error);
      localStorage.setItem('budget_recurring_log', '{}');
    }
    return false;
  };

  const fetchData = async (silent = false) => {
    const startTime = Date.now();
    try {
      if (!silent) setLoading(true);
      else setIsUpdating(true);
      
      setError(null);
      const [budgetRes, expensesRes, allExpensesRes, statsRes] = await Promise.all([
        budgetService.getBudget(currentMonth, currentYear),
        expenseService.getExpenses(currentMonth, currentYear),
        expenseService.getAllExpenses(),
        expenseService.getStats(currentMonth, currentYear)
      ]);
      
      const elapsedTime = Date.now() - startTime;
      if (!silent && elapsedTime > 150 && elapsedTime < 450) {
        await new Promise(resolve => setTimeout(resolve, 450 - elapsedTime));
      }

      setBudget(budgetRes.data);
      setExpenses(expensesRes.data);
      setAllExpenses(allExpensesRes.data);
      setStats(statsRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await processRecurringExpenses();
      fetchData(); 
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchData(true);  
    }
  }, [currentMonth, currentYear]);

  const handleAddExpense = async (expenseData) => {
    try {
      await expenseService.addExpense({
        ...expenseData,
        date: new Date(Date.UTC(currentYear, currentMonth - 1, new Date().getDate()))
      });
      fetchData(true);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Expense added!', showConfirmButton: false, timer: 1500, background: 'var(--surface)', color: 'var(--foreground)' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add expense', background: 'var(--surface)' });
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      fetchData(true);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Expense removed', showConfirmButton: false, timer: 1500, background: 'var(--surface)', color: 'var(--foreground)' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete expense', background: 'var(--surface)' });
    }
  };

  const handleUpdateBudget = async (updateData) => {
    try {
      await budgetService.updateBudget({ ...updateData, month: currentMonth, year: currentYear });
      fetchData(true);
      Swal.fire({ icon: 'success', title: 'Settings Updated', text: 'Your budget limits have been saved.', timer: 1500, showConfirmButton: false, background: 'var(--surface)' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update budget', background: 'var(--surface)' });
    }
  };

  const handleConfirmAlert = async () => {
    try {
      await budgetService.updateBudget({ amount: budget.amount + 1000, month: currentMonth, year: currentYear });
      fetchData(true);
      Swal.fire({ icon: 'success', title: 'Top-up Successful', text: '₹1,000 added.', timer: 1500, showConfirmButton: false, background: 'var(--surface)' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add balance', background: 'var(--surface)' });
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const savings = budget.amount - totalSpent;

  return (
    <div className="min-h-screen bg-background pb-12 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8 space-y-8">
        
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
          
          <div className="flex items-center gap-3 bg-surface-alt p-1.5 rounded-xl border border-border shadow-sm">
            <div className="flex items-center pl-3 text-primary">
              {isUpdating ? <RefreshCw className="animate-spin" size={18} /> : <Calendar size={18} />}
            </div>
            
            <div className="flex h-6 items-center border-l border-border mx-1"></div>
            
            <select 
              className="bg-transparent font-medium text-foreground text-sm py-1.5 px-2 outline-none cursor-pointer appearance-none min-w-[100px]"
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              disabled={loading}
            >
              {MONTHS.map((m, i) => <option key={m} value={i + 1} className="bg-surface">{m}</option>)}
            </select>
            
            <select 
              className="bg-transparent font-medium text-foreground text-sm py-1.5 pr-4 outline-none cursor-pointer appearance-none"
              value={currentYear} 
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              disabled={loading}
            >
              {YEARS.map(y => <option key={y} value={y} className="bg-surface">{y}</option>)}
            </select>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Connection Error</h3>
            <p className="text-red-600 dark:text-red-300 mt-2 mb-6 max-w-md">We couldn't reach the server. Please check your internet connection or try again.</p>
            <button onClick={() => fetchData()} className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left/Main Content Column */}
            <div className="lg:col-span-2 space-y-8 flex flex-col items-stretch h-full">
              {/* Budget Summary Cards */}
              <BudgetSummary 
                totalBudget={budget.amount} 
                spent={totalSpent} 
                savings={savings} 
                threshold={budget.threshold}
                onConfirmAlert={handleConfirmAlert}
                loading={loading}
              />
              
              {/* Transaction History & Grid */}
              <div className="grid grid-cols-1 gap-8 h-full">
                <RecentExpenses 
                  expenses={allExpenses} 
                  onDelete={handleDeleteExpense} 
                  loading={loading}
                />
              </div>
            </div>

            {/* Right/Sidebar Column */}
            <div className="space-y-8 h-full flex flex-col">
              <ExpenseForm 
                onAdd={handleAddExpense} 
                onBudgetUpdate={handleUpdateBudget} 
                currentBudget={budget} 
                totalSpent={totalSpent}
                categoryStats={stats}
                loading={loading}
              />
              <div className="flex-1">
                <CategoryChart data={stats} loading={loading} />
              </div>
              <div className="flex-1">
                <MonthlyBarChart allExpenses={allExpenses} loading={loading} />
              </div>
              {!loading && <CategoryBudgets categoryStats={stats} />}
              {!loading && <RecurringPanel />}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
