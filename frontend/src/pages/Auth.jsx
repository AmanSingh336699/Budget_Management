import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Mail, Lock, Eye, EyeOff, LayoutDashboard, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsLogin(location.pathname === '/login' || location.pathname === '/');
    setError('');
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
    }
  }, [location.pathname, location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const response = await authService.login({ email: formData.email, password: formData.password });
        authLogin(response.data);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters.');
        await authService.register(formData);
        const registeredEmail = formData.email;
        setFormData({ name: '', email: registeredEmail, password: '' });
        setSuccess('Registration successful! Please log in with your credentials.');
        navigate('/login', {
          replace: true,
          state: {
            successMessage: 'Registration successful! Please log in with your credentials.'
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode) => {
    if ((mode === 'login' && isLogin) || (mode === 'signup' && !isLogin)) return;
    setError('');
    setSuccess('');
    setIsLogin(mode === 'login');
    navigate(mode === 'login' ? '/login' : '/signup', { state: {} });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-[1040px] flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-border md:flex-row md:h-[640px]">
        
        {/* Illustration Panel - Hidden on Small Screens */}
        <div className="relative hidden w-full flex-col items-center justify-center overflow-hidden bg-primary p-12 text-white md:flex md:w-1/2">
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="z-10 flex flex-col items-center text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
              <LayoutDashboard size={40} className="text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Master Your Money
            </h2>
            <p className="max-w-xs text-base text-blue-100">
              Track your expenses effortlessly. Stay on top of your budget and achieve true financial freedom.
            </p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex w-full flex-col justify-center bg-surface p-8 sm:p-12 md:w-1/2 lg:px-16 relative">
          <div className="mb-8 hidden items-center justify-center md:hidden">
            <LayoutDashboard size={32} className="text-primary" />
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start managing your budget today.'}
            </p>
          </div>

          <div className="mb-8 flex w-full rounded-xl bg-surface-alt p-1 ring-1 ring-border">
            <button
              onClick={() => toggleMode('login')}
              className={`w-1/2 rounded-lg py-2 text-sm font-semibold transition-all ${
                isLogin ? 'bg-surface text-foreground shadow-xs ring-1 ring-border' : 'text-gray-500 hover:text-foreground'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => toggleMode('signup')}
              className={`w-1/2 rounded-lg py-2 text-sm font-semibold transition-all ${
                !isLogin ? 'bg-surface text-foreground shadow-xs ring-1 ring-border' : 'text-gray-500 hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="text-sm font-medium text-foreground" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="block w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="block w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:bg-surface focus:outline-hidden focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;
