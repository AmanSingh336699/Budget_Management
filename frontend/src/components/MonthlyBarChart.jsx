import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import Skeleton from './common/Skeleton';
import { BarChart3 } from 'lucide-react';
import { formatCurrency, formatCompactCurrency, roundCurrency } from '../utils/formatters';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-extrabold text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const MonthlyBarChart = ({ allExpenses = [], currentMonth, currentYear, loading }) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    // Reference date: use selected month/year or fallback to current system date
    const refYear = currentYear || new Date().getFullYear();
    const refMonth = currentMonth ? currentMonth - 1 : new Date().getMonth();

    // Generate fixed 6-month continuous window ending at selected period
    const targetMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(refYear, refMonth - i, 1);
      targetMonths.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: `${MONTHS_SHORT[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
        shortLabel: MONTHS_SHORT[d.getMonth()],
        total: 0
      });
    }

    // Populate spending accurately
    if (Array.isArray(allExpenses)) {
      allExpenses.forEach((exp) => {
        if (!exp.date || !exp.amount) return;
        const expDate = new Date(exp.date);
        if (isNaN(expDate.getTime())) return;

        const match = targetMonths.find(
          (m) => m.month === expDate.getMonth() && m.year === expDate.getFullYear()
        );
        if (match) {
          match.total = roundCurrency(match.total + exp.amount);
        }
      });
    }

    return targetMonths;
  }, [allExpenses, currentMonth, currentYear]);

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isAllZero = chartData.every((d) => d.total === 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs flex flex-col h-full min-h-[320px] sm:min-h-[380px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">6-Month Trend</h3>
          <p className="text-xs text-muted-foreground">Historical spending progression</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-surface-alt rounded-lg text-foreground border border-border/50">
          Monthly Flow
        </span>
      </div>
      
      <div className="flex-1 w-full relative min-h-[220px] sm:min-h-[260px] flex items-center justify-center">
        {loading ? (
          <div className="absolute inset-0 flex items-end justify-between pb-8 px-4 gap-3">
            {[45, 75, 30, 90, 60, 40].map((h, i) => (
              <Skeleton key={i} className="w-1/6 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f1f5f9'} />
              <XAxis 
                dataKey="shortLabel" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#64748b', fontWeight: 600 }} 
                dy={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                width={48}
                tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#64748b', fontWeight: 600 }} 
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
              <Bar 
                dataKey="total" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center py-10 text-center opacity-60">
            <div className="p-4 rounded-2xl bg-surface-alt mb-3">
              <BarChart3 size={40} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No Trend Data</p>
            <p className="text-xs text-muted-foreground mt-1">Add transactions across months to visualize trends.</p>
          </div>
        )}
        
        {!loading && chartData.length > 0 && isAllZero && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs font-semibold text-muted-foreground bg-surface/90 px-4 py-2 rounded-xl border border-border shadow-xs backdrop-blur-xs">
              No expenses recorded in the last 6 months
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyBarChart;
