import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import Skeleton from './common/Skeleton';
import { BarChart3 } from 'lucide-react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MonthlyBarChart = ({ allExpenses, loading }) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    if (!allExpenses) return [];
    
    const now = new Date();
    
    // 1. Find earliest transaction date
    let earliestDate = now;
    if (allExpenses.length > 0) {
      earliestDate = new Date(Math.min(...allExpenses.map(e => new Date(e.date).getTime())));
    }
    
    // 2. Generate up to 6 months
    const targetMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      
      const earliestMonthStart = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
      
      if (d >= earliestMonthStart || i === 0) { 
        targetMonths.push({
          month: d.getMonth(),
          year: d.getFullYear(),
          label: MONTHS_SHORT[d.getMonth()],
          total: 0
        });
      }
    }
    
    // 3. Fill in totals
    allExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const match = targetMonths.find(m => m.month === expDate.getMonth() && m.year === expDate.getFullYear());
      if (match) {
        match.total += exp.amount;
      }
    });
    
    return targetMonths;

  }, [allExpenses]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-bold text-foreground">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isAllZero = chartData.every(d => d.total === 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col h-full min-h-[400px] relative">
      <h3 className="mb-6 text-lg font-bold text-foreground">6-Month Trend</h3>
      
      <div className="flex-1 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-end justify-between pb-8 px-4 gap-2">
             {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="w-1/6" style={{height: Math.random() * 80 + 20 + '%'}} />)}
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#3f3f46' : '#e4e4e7'} />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: isDark ? '#a1a1aa' : '#52525b', fontWeight: 600}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: isDark ? '#a1a1aa' : '#52525b', fontWeight: 600}} 
                tickFormatter={(value) => value >= 1000 ? `₹${(value/1000)}k` : `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#ffffff0a' : '#0000000a' }} />
              <Bar 
                dataKey="total" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center pb-8 text-center opacity-50">
            <BarChart3 size={48} className="mb-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Add transactions to see trends.</p>
          </div>
        )}
        
        {!loading && chartData.length > 0 && isAllZero && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <p className="text-sm font-medium text-muted-foreground bg-surface/80 px-4 py-2 rounded-lg backdrop-blur-xs">Add transactions to see trends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyBarChart;
