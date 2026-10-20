import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Skeleton from './common/Skeleton';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency, CATEGORY_COLORS } from '../utils/formatters';

const CustomTooltip = ({ active, payload, totalValue }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const percent = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0;
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="inline-block w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: entry.payload?.fill || CATEGORY_COLORS[entry.name] || '#64748b' }} 
          />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{entry.name}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{formatCurrency(entry.value)}</span>
          <span className="text-xs font-semibold text-primary">({percent}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ data = [], loading }) => {
  const totalValue = React.useMemo(() => {
    return data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [data]);

  const hasData = data && data.length > 0 && totalValue > 0;

  const fallbackColors = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#64748b'];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs flex flex-col h-full min-h-[320px] sm:min-h-[380px] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">Spending Breakdown</h3>
          <p className="text-xs text-muted-foreground">Distribution across expense categories</p>
        </div>
        {hasData && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-surface-alt rounded-lg text-foreground border border-border/50">
            {data.length} Categories
          </span>
        )}
      </div>
      
      <div className="flex-1 w-full relative min-h-[220px] sm:min-h-[260px] flex items-center justify-center">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        ) : hasData ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="46%"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={data.length > 1 ? 3 : 0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => {
                  const fillColor = CATEGORY_COLORS[entry.name] || fallbackColors[index % fallbackColors.length];
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Pie>
              <Tooltip content={<CustomTooltip totalValue={totalValue} />} />
              <Legend 
                verticalAlign="bottom" 
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs font-medium text-foreground px-1">{value}</span>
                )}
                wrapperStyle={{ 
                  fontSize: '12px', 
                  paddingTop: '12px',
                }}
              />
              {/* Donut Center Readout */}
              <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" className="text-[11px] font-bold uppercase tracking-wider fill-muted-foreground">
                Total
              </text>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-base sm:text-lg font-extrabold fill-foreground">
                {formatCurrency(totalValue, { decimals: 0 })}
              </text>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center py-10 text-center opacity-60">
            <div className="p-4 rounded-2xl bg-surface-alt mb-3">
              <PieChartIcon size={40} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No Spending Recorded</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Add your expenses to view visual category breakdown.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
