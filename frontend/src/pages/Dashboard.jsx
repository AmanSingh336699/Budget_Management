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
import { Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { roundCurrency } from '../utils/formatters';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 3 + i);

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

  // Reliable recurring expense runner: processes when today >= scheduled day of current month
  const processRecurringExpenses = async () => {
    const today = new Date();
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      const log = JSON.parse(localStorage.getItem('budget_recurring_log') || '{}');
      const recurring = JSON.parse(localStorage.getItem('budget_recurring') || '[]');
      let addedCount = 0;
      
      for (const item of recurring) {
        const scheduledDay = item.dayOfMonth || 1;
        // Process if not logged yet for this month and current date is on or after scheduled day
        if (log[item.id] !== currentMonthYear && today.getDate() >= scheduledDay) {
          if (!item.title || !item.amount || item.amount <= 0) continue;
          
          const expDate = new Date(today.getFullYear(), today.getMonth(), scheduledDay);
          await expenseService.addExpense({
            title: item.title,
            amount: parseFloat(item.amount),
            category: item.category || 'Other',
            date: expDate
          });
          
          log[item.id] = currentMonthYear;
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        localStorage.setItem('budget_recurring_log', JSON.stringify(log));
        Swal.fire({ 
          toast: true, 
          position: 'top-end', 
          icon: 'success', 
          title: `✅ ${addedCount} automated recurring expense${addedCount > 1 ? 's' : ''} recorded!`, 
          showConfirmButton: false, 
          timer: 3000, 
          background: 'var(--surface)', 
          color: 'var(--foreground)' 
        });
        return true;
      }
    } catch (error) {
      console.error('Recurring processor error:', error);
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
      if (!silent && elapsedTime > 100 && elapsedTime < 350) {
        await new Promise(resolve => setTimeout(resolve, 350 - elapsedTime));
      }

      setBudget(budgetRes.data || { amount: 0, threshold: 0 });
      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
      setAllExpenses(Array.isArray(allExpensesRes.data) ? allExpensesRes.data : []);
      setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch financial data');
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
      let finalDate = expenseData.date;
      if (!finalDate) {
        const maxDaysInSelectedMonth = new Date(currentYear, currentMonth, 0).getDate();
        const clampedDay = Math.min(new Date().getDate(), maxDaysInSelectedMonth);
        finalDate = new Date(currentYear, currentMonth - 1, clampedDay);
      }

      await expenseService.addExpense({
        ...expenseData,
        date: finalDate
      });

      fetchData(true);
      Swal.fire({ 
        toast: true, 
        position: 'top-end', 
        icon: 'success', 
        title: 'Expense recorded successfully!', 
        showConfirmButton: false, 
        timer: 1500, 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Transaction Failed', 
        text: error.response?.data?.message || 'Failed to add expense. Please try again.', 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    }
  };

  const handleDeleteExpense = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Expense?',
      text: 'This transaction will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      background: 'var(--surface)',
      color: 'var(--foreground)'
    });

    if (!result.isConfirmed) return;

    try {
      await expenseService.deleteExpense(id);
      fetchData(true);
      Swal.fire({ 
        toast: true, 
        position: 'top-end', 
        icon: 'success', 
        title: 'Transaction deleted', 
        showConfirmButton: false, 
        timer: 1500, 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: error.response?.data?.message || 'Failed to delete expense', 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    }
  };

  const handleUpdateBudget = async (updateData) => {
    try {
      await budgetService.updateBudget({ 
        amount: updateData.amount !== undefined ? updateData.amount : budget.amount,
        threshold: updateData.threshold !== undefined ? updateData.threshold : budget.threshold,
        month: currentMonth, 
        year: currentYear 
      });
      fetchData(true);
      Swal.fire({ 
        icon: 'success', 
        title: 'Budget Saved', 
        text: 'Your limits and alert settings have been successfully updated.', 
        timer: 1500, 
        showConfirmButton: false, 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Update Failed', 
        text: error.response?.data?.message || 'Failed to update budget settings', 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    }
  };

  const handleConfirmAlert = async () => {
    try {
      const newAmount = roundCurrency((budget.amount || 0) + 1000);
      await budgetService.updateBudget({ 
        amount: newAmount, 
        threshold: budget.threshold || 0,
        month: currentMonth, 
        year: currentYear 
      });
      fetchData(true);
      Swal.fire({ 
        icon: 'success', 
        title: 'Top-up Successful', 
        text: '₹1,000 added to this month’s budget allocation.', 
        timer: 1500, 
        showConfirmButton: false, 
        background: 'var(--surface)', 
        color: 'var(--foreground)' 
      });
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: error.response?.data?.message || 'Failed to add balance', 
        background: 'var(--surface)',
        color: 'var(--foreground)'
      });
    }
  };

  // High-precision financial calculations
  const totalSpent = roundCurrency(
    expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  );
  const savings = roundCurrency((budget.amount || 0) - totalSpent);

  return (
    <div className="min-h-screen bg-background pb-16 flex flex-col antialiased overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl pt-5 sm:pt-8 space-y-5 sm:space-y-8">
        
        {/* Navigation & Period Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
              Financial Overview
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
              Tracking analytics for <span className="font-semibold text-foreground">{MONTHS[currentMonth - 1]} {currentYear}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 bg-surface-alt p-1.5 rounded-2xl border border-border shadow-xs shrink-0 self-start sm:self-auto">
            <div className="flex items-center pl-3 text-primary">
              {isUpdating ? <RefreshCw className="animate-spin" size={17} /> : <Calendar size={17} />}
            </div>
            
            <div className="flex h-5 items-center border-l border-border mx-1"></div>
            
            <select 
              className="bg-transparent font-semibold text-foreground text-xs sm:text-sm py-1.5 px-2 outline-hidden cursor-pointer appearance-none min-w-[110px]"
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              disabled={loading}
              aria-label="Select month"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1} className="bg-surface text-foreground">{m}</option>
              ))}
            </select>
            
            <select 
              className="bg-transparent font-semibold text-foreground text-xs sm:text-sm py-1.5 pr-3 outline-hidden cursor-pointer appearance-none"
              value={currentYear} 
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              disabled={loading}
              aria-label="Select year"
            >
              {YEARS.map(y => (
                <option key={y} value={y} className="bg-surface text-foreground">{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-3xl border border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Connection Error</h3>
            <p className="text-sm text-red-600/80 dark:text-red-300 mt-1 mb-6 max-w-md">{error}</p>
            <button 
              onClick={() => fetchData()} 
              className="rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-8">
            
            {/* 1. KPI Summary Cards */}
            <BudgetSummary 
              totalBudget={budget.amount} 
              spent={totalSpent} 
              savings={savings} 
              threshold={budget.threshold}
              onConfirmAlert={handleConfirmAlert}
              loading={loading}
            />

            {/* 2. Visual Charts Row - Side-by-Side on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              <CategoryChart data={stats} loading={loading} />
              <MonthlyBarChart 
                allExpenses={allExpenses} 
                currentMonth={currentMonth}
                currentYear={currentYear}
                loading={loading} 
              />
            </div>

            {/* 3. Operational Section: Transactions & Entry Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
              
              {/* Transactions History Table - 2 columns on desktop */}
              <div className="lg:col-span-2">
                <RecentExpenses 
                  expenses={allExpenses} 
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  onDelete={handleDeleteExpense} 
                  loading={loading}
                />
              </div>

              {/* Action Sidebar: Quick Form + Targets + Recurring - 1 column on desktop */}
              <div className="space-y-6">
                <ExpenseForm 
                  onAdd={handleAddExpense} 
                  onBudgetUpdate={handleUpdateBudget} 
                  currentBudget={budget} 
                  totalSpent={totalSpent}
                  categoryStats={stats}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  loading={loading}
                />

                {!loading && (
                  <>
                    <CategoryBudgets categoryStats={stats} />
                    <RecurringPanel />
                  </>
                )}
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
