import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import SplashScreen from './components/SplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    if (!isAuthenticated) return false;
    try {
      return !sessionStorage.getItem('budget_splash_shown');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      try {
        sessionStorage.setItem('budget_splash_shown', 'true');
      } catch {
        // Ignore storage errors (e.g. private mode or disabled storage)
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [showSplash]);

  return (
    <div className="app">
      {isAuthenticated && <SplashScreen isVisible={showSplash} />}
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
