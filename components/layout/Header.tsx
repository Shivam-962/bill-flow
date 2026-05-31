'use client';

import { useErpStore } from '@/store/useErpStore';
import { Sun, Moon, Bell, Cloud, CloudOff, Menu, X, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { theme, toggleTheme, business, currentUser, logout } = useErpStore();
  const [time, setTime] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();

  // Formatting clock time
  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Path Name into Page Title
  const getPageTitle = () => {
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    if (!last || last === 'dashboard') return 'ERP Dashboard';
    if (last === 'billing') return 'Point of Sale (POS)';
    if (last === 'inventory') return 'Stock Management';
    if (last === 'customers') return 'Customer Directory';
    if (last === 'analytics') return 'Performance Analytics';
    if (last === 'reports') return 'Taxes & Reports';
    if (last === 'settings') return 'Configuration Settings';
    if (last === 'admin') return 'System Administration';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <header className="sticky top-0 right-0 z-20 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between">
      {/* Mobile Drawer Trigger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-200 hover:bg-slate-100"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="font-poppins font-bold text-lg text-slate-800 dark:text-white tracking-tight md:text-xl">
            {getPageTitle()}
          </h1>
          <p className="hidden md:block text-[11px] text-slate-400 font-medium tracking-wide">
            {business.name} &bull; ACTIVE DRAWER
          </p>
        </div>
      </div>

      {/* Toolbar Items */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          {time || '14:14:00'}
        </div>

        {/* Sync Status */}
        <div 
          title="Cloud sync connected (Simulated)"
          className="flex items-center justify-center p-2 rounded-xl bg-success/10 text-success border border-success/20 cursor-pointer"
        >
          <Cloud size={16} />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>



        {/* Main Quick Action Button (Visible on tablet/desktop) */}
        {pathname !== '/billing' && (
          <Link
            href="/billing"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-poppins font-semibold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all"
          >
            <Receipt size={14} />
            Quick Invoice
          </Link>
        )}
      </div>
    </header>
  );
}
