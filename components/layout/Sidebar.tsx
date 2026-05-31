'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, business } = useErpStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier'] },
    { name: 'POS Billing', path: '/billing', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Inventory Stock', path: '/inventory', icon: Package, roles: ['admin', 'manager'] },
    { name: 'Customer Ledger', path: '/customers', icon: Users, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Sales Analytics', path: '/analytics', icon: TrendingUp, roles: ['admin', 'manager'] },
    { name: 'Report Center', path: '/reports', icon: FileSpreadsheet, roles: ['admin', 'manager'] },
    { name: 'ERP Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  // If admin is active, show the SaaS Control Panel
  if (currentUser?.role === 'admin') {
    navItems.push({ name: 'Admin Control', path: '/admin', icon: Shield, roles: ['admin'] });
  }

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 z-30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
              B
            </div>
            <span className="font-poppins font-bold text-lg text-slate-800 dark:text-white tracking-tight">
              BillFlow<span className="text-primary">.</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md">
            B
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-medium'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'} />
              {!collapsed && <span className="text-sm font-poppins">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Session Bottom Card */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {currentUser?.email?.substring(0, 2).toUpperCase() || 'OP'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentUser?.email || 'Operator'}
              </p>
              <p className="text-[10px] font-medium text-slate-400 capitalize">
                {currentUser?.role || 'cashier'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 rounded-md text-slate-400 hover:text-error hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full mt-2 flex justify-center p-2 rounded-xl text-slate-400 hover:text-error hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
