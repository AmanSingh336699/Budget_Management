import axios from 'axios';

const getApiUrl = () => {
  let base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  if (!base.endsWith('/api') && !base.endsWith('/api/')) {
    base = base.endsWith('/') ? `${base}api` : `${base}/api`;
  }
  
  return base.endsWith('/') ? base : `${base}/`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('budget_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('budget_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('auth/login', credentials),
  register: (userData) => api.post('auth/register', userData),
};

export const budgetService = {
  getBudget: (month, year) => api.get(`budget?month=${month}&year=${year}`),
  updateBudget: (budgetData) => api.post('budget', budgetData),
};

export const expenseService = {
  getExpenses: (month, year) => api.get(`expenses?month=${month}&year=${year}`),
  getAllExpenses: () => api.get(`expenses?month=all&year=all`),
  addExpense: (expenseData) => api.post('expenses', expenseData),
  deleteExpense: (id) => api.delete(`expenses/${id}`),
  getStats: (month, year) => api.get(`expenses/stats?month=${month}&year=${year}`),
};

export default api;
