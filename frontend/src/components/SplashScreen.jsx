import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const SplashScreen = ({ isVisible }) => {
  return (
    <div 
      className={`fixed inset-0 z-10000 flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ease-in-out ${
        !isVisible ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex animate-in zoom-in duration-700 flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl">
          <LayoutDashboard size={48} />
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary slide-in-from-bottom-4 animate-in duration-700 delay-150 fill-mode-both">
          Budget Management
        </div>
        <div className="mt-4 text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground slide-in-from-bottom-4 animate-in duration-700 delay-300 fill-mode-both">
          Welcome to financial freedom
        </div>
      </div>
      
      <div className="absolute bottom-20 w-48 h-1.5 bg-surface-alt rounded-full overflow-hidden slide-in-from-bottom-4 animate-in duration-700 delay-500 fill-mode-both">
        <div className="h-full bg-primary w-1/3 rounded-full animate-[shimmer_1.5s_infinite_ease-in-out] relative"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
