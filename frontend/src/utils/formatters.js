// Unified financial calculation and formatting helpers

export const roundCurrency = (amount) => {
  return Math.round((Number(amount) || 0) * 100) / 100;
};

export const formatCurrency = (amount, { decimals = 2 } = {}) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatCompactCurrency = (amount) => {
  const num = Number(amount) || 0;
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const getOrdinalSuffix = (day) => {
  const d = parseInt(day, 10) || 1;
  if (d > 3 && d < 21) return `${d}th`;
  switch (d % 10) {
    case 1:  return `${d}st`;
    case 2:  return `${d}nd`;
    case 3:  return `${d}rd`;
    default: return `${d}th`;
  }
};

export const STANDARD_CATEGORIES = [
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Housing',
  'Other',
];

export const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Utilities: '#f59e0b',
  Entertainment: '#8b5cf6',
  Housing: '#10b981',
  Other: '#64748b',
};
