import React, { createContext, useState, useEffect, useContext } from 'react';
import { budgetService, expenseService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('budget_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveUserData = (userData) => {
    setUser(userData);
    localStorage.setItem('budget_user', JSON.stringify(userData));
  };

  const login = (userData) => saveUserData(userData);
  const register = (userData) => saveUserData(userData);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('budget_user');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
