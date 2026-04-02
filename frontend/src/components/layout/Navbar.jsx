import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shadow-sm items-center justify-center rounded-xl bg-primary text-white">
              <LayoutDashboard size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[1.1rem] font-bold leading-none tracking-tight">Budget Management</h1>
              <p className="text-[0.75rem] text-gray-500 dark:text-gray-400 mt-1">Financial Overview</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt text-foreground hover:bg-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <div className="flex items-center gap-4 border-l border-border pl-4">
                <div className="hidden text-right md:block">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold uppercase ring-1 ring-primary/20">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-danger/10 hover:text-danger hover:ring-1 hover:ring-danger/20 transition-all outline-none focus-visible:ring-2 focus-visible:ring-danger"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
