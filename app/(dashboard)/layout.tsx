'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, loadData, theme } = useErpStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Sync state store caches on mount
  useEffect(() => {
    loadData();
    setHydrated(true);
  }, [loadData]);

  // Auth checking redirect
  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push('/login');
    }
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slatebg dark:bg-darkbg text-txt dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold font-poppins">Loading BillFlow Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex text-slate-800 dark:text-slate-100 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar - Desktop */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Workspace Frame */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto bg-slatebg dark:bg-darkbg">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Slide-out Nav overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-72 h-full bg-white dark:bg-slate-900 p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Logo and close */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-850">
              <span className="font-poppins font-bold text-lg text-slate-800 dark:text-white">
                BillFlow<span className="text-primary">.</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 py-6 space-y-2 overflow-y-auto">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'POS Billing', path: '/billing', icon: ShoppingCart },
                { name: 'Inventory Stock', path: '/inventory', icon: Package },
                { name: 'Customer Ledger', path: '/customers', icon: Users },
                { name: 'ERP Settings', path: '/settings', icon: Settings },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
                >
                  <item.icon size={18} className="text-slate-400" />
                  <span className="text-sm font-poppins font-semibold">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Cashier profile info */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-semibold">{currentUser.email}</p>
              <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Nav Bar - Mobile (Visible only on mobile viewports) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 py-2.5 px-4 flex justify-around items-center">
        {[
          { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Billing', path: '/billing', icon: ShoppingCart },
          { name: 'Inventory', path: '/inventory', icon: Package },
          { name: 'Customers', path: '/customers', icon: Users },
          { name: 'Settings', path: '/settings', icon: Settings },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 active:text-primary hover:text-slate-900"
          >
            <item.icon size={20} />
            <span className="text-[10px] font-semibold font-poppins">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
