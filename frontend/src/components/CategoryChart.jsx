import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import Skeleton from './common/Skeleton';
import { PieChart as PieChartIcon } from 'lucide-react';

const CategoryChart = ({ data, loading }) => {
  const { theme } = useTheme();
  // Premium muted versions of the standard colors
  const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#f97316', '#64748b'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{payload[0].name}</p>
          <p className="text-sm font-bold text-foreground">₹{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col h-full min-h-[400px]">
      <h3 className="mb-6 text-lg font-bold text-foreground">Spending Distribution</h3>
      
      <div className="flex-1 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center pb-8">
            <Skeleton className="h-[220px] w-[220px] rounded-full" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                wrapperStyle={{ 
                  fontSize: '12px', 
                  fontWeight: 600,
                  color: isDark ? '#a1a1aa' : '#52525b',
                  paddingTop: '20px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center pb-8 text-center opacity-50">
            <PieChartIcon size={48} className="mb-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Not enough data to visualize</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
