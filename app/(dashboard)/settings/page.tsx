'use client';

import { useState, useEffect } from 'react';
import { useErpStore } from '@/store/useErpStore';
import {
  Settings,
  Store,
  Printer,
  Smartphone,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const {
    business,
    printerSettings,
    updateBusiness,
    updatePrinter,
    loadData,
    themeColor,
    setThemeColor,
    theme,
    toggleTheme,
    resetDatabase
  } = useErpStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab controls
  const [activeTab, setActiveTab] = useState<'store' | 'hardware' | 'team' | 'theme' | 'danger'>('store');

  const handleWipeData = () => {
    const doubleCheck = window.confirm(
      "WARNING: Are you absolutely sure you want to wipe all local business data?\n\nThis will completely delete all products, stock levels, categories, invoices, customer credits, and expenses.\n\nYour administrator accounts and login credentials will not be deleted.\n\nThis action cannot be undone."
    );
    if (doubleCheck) {
      resetDatabase();
      alert("Database wiped successfully. The system has been reset.");
      setActiveTab('store');
    }
  };

  // Store profile form inputs
  const [bizName, setBizName] = useState(business.name);
  const [bizPhone, setBizPhone] = useState(business.phone);
  const [bizAddress, setBizAddress] = useState(business.address || '');
  const [bizGstin, setBizGstin] = useState(business.gstin || '');
  const [bizPrefix, setBizPrefix] = useState(business.invoice_prefix);

  // Printer settings form inputs
  const [printerType, setPrinterType] = useState(printerSettings.printer_type);
  const [connString, setConnString] = useState(printerSettings.connection_string || '');
  const [paperSize, setPaperSize] = useState<58 | 80>(printerSettings.paper_size_mm);

  // Auto-sync form when initial store state loads
  useEffect(() => {
    setBizName(business.name);
    setBizPhone(business.phone);
    setBizAddress(business.address || '');
    setBizGstin(business.gstin || '');
    setBizPrefix(business.invoice_prefix);

    setPrinterType(printerSettings.printer_type);
    setConnString(printerSettings.connection_string || '');
    setPaperSize(printerSettings.paper_size_mm);
  }, [business, printerSettings]);

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: bizName,
      phone: bizPhone,
      address: bizAddress || undefined,
      gstin: bizGstin || undefined,
      invoice_prefix: bizPrefix.toUpperCase()
    });
    alert('Business profiles updated successfully.');
  };

  const handlePrinterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrinter({
      printer_type: printerType,
      connection_string: connString || undefined,
      paper_size_mm: paperSize
    });
    alert('Hardware printer parameters saved.');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)]">
      
      {/* LEFT: Settings sub-tab navigation */}
      <div className="w-full md:w-64 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-poppins transition ${
            activeTab === 'store'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
          }`}
        >
          <Store size={16} />
          Business Profile
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-poppins transition ${
            activeTab === 'hardware'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
          }`}
        >
          <Printer size={16} />
          Printer Integration
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-poppins transition ${
            activeTab === 'team'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
          }`}
        >
          <Users size={16} />
          Cashier Permissions
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-poppins transition ${
            activeTab === 'theme'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
          }`}
        >
          <Settings size={16} />
          App Theme Styling
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-poppins transition ${
            activeTab === 'danger'
              ? 'bg-error text-white shadow-md shadow-error/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-error hover:bg-red-500/5'
          }`}
        >
          <Trash2 size={16} />
          Danger Zone
        </button>
      </div>

      {/* RIGHT: Active panel contents */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-6 overflow-y-auto">
        
        {activeTab === 'store' && (
          <form onSubmit={handleStoreSubmit} className="space-y-4 max-w-xl">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850">
              Business Configuration
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Business / Shop Name</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">GSTIN tax Number</label>
                <input
                  type="text"
                  maxLength={15}
                  value={bizGstin}
                  onChange={(e) => setBizGstin(e.target.value.toUpperCase())}
                  placeholder="29AAAAA1111A1Z1"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-semibold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Invoice Number Prefix</label>
                <input
                  type="text"
                  maxLength={5}
                  required
                  value={bizPrefix}
                  onChange={(e) => setBizPrefix(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-bold font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Help Number</label>
              <input
                type="tel"
                required
                value={bizPhone}
                onChange={(e) => setBizPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Shop Physical Address</label>
              <textarea
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 transition"
            >
              Save Store Changes
            </button>
          </form>
        )}

        {activeTab === 'hardware' && (
          <form onSubmit={handlePrinterSubmit} className="space-y-4 max-w-xl">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850">
              Hardware Printing Setup
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Printer Connection Interface</label>
                <select
                  value={printerType}
                  onChange={(e) => setPrinterType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-semibold cursor-pointer"
                >
                  <option value="browser">Browser Native Layout</option>
                  <option value="usb">USB Raw ESC/POS</option>
                  <option value="network">Network (IP Socket)</option>
                  <option value="bluetooth">Bluetooth (Wireless)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Receipt Paper size</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperSize(80)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      paperSize === 80
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    80 mm (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperSize(58)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      paperSize === 58
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    58 mm (Compact)
                  </button>
                </div>
              </div>
            </div>

            {printerType !== 'browser' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top duration-200">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {printerType === 'network' ? 'IP Address & Port (e.g. 192.168.1.100:9100)' : 'COM Port / Bluetooth Address'}
                </label>
                <input
                  type="text"
                  required
                  value={connString}
                  onChange={(e) => setConnString(e.target.value)}
                  placeholder={printerType === 'network' ? '192.168.1.201:9100' : 'COM3 or BT MAC'}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 transition"
            >
              Update Hardware settings
            </button>
          </form>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                Staff & Access Authorization
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full font-mono">
                ADMIN LEVEL
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-mutedtxt leading-relaxed">
                Add and manage employee permissions. Only operators with 'admin' roles can access pricing matrix and financial reports.
              </p>

              {/* Mock Cashier List */}
              <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 text-slate-600 dark:text-slate-400 text-xs font-bold font-poppins">
                      <th className="px-6 py-3">Cashier Email</th>
                      <th className="px-6 py-3">Active Role</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-medium">
                    <tr>
                      <td className="px-6 py-3 font-semibold text-slate-800 dark:text-white">demo@billflow.com</td>
                      <td className="px-6 py-3 text-slate-500 capitalize">admin</td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">Active</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-slate-800 dark:text-white">cashier1@billflow.com</td>
                      <td className="px-6 py-3 text-slate-500 capitalize">cashier</td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">Active</span>
                      </td>
                    </tr>
                    <tr className="opacity-60 bg-slate-50/50">
                      <td className="px-6 py-3 text-slate-400">manager@billflow.com</td>
                      <td className="px-6 py-3 text-slate-400 capitalize">manager</td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">Suspended</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Add New operator mock input */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 max-w-lg space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Lock size={12} />
                  Authorize New Staff Account
                </h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="operator@billflow.com"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  />
                  <select className="px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none">
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                  </select>
                  <button
                    onClick={() => alert('New operator created (Mocked).')}
                    className="px-4 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95"
                  >
                    Add Staff
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                App Theme Configuration
              </h3>
              <p className="text-xs text-slate-400">Customize the look and feel of your ERP terminal</p>
            </div>

            {/* Dark Mode toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center max-w-xl">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Dark Mode Interface</p>
                <p className="text-[10px] text-slate-400 font-medium">Reduce eye strain during night shifts</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  theme === 'dark' ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Branding Color Preset</h4>
              <p className="text-[10px] text-slate-400 font-medium pb-1">Choose a color palette that aligns with your shop brand or logo:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
                {[
                  { id: 'blue', name: 'Sapphire Blue', color: '#2563EB', desc: 'Enterprise default trust' },
                  { id: 'green', name: 'Emerald Green', color: '#10B981', desc: 'Fresh groceries & medical' },
                  { id: 'violet', name: 'Royal Amethyst', color: '#8B5CF6', desc: 'Fashion, luxury & apparel' },
                  { id: 'rose', name: 'Crimson Rose', color: '#F43F5E', desc: 'Cosmetics, bakery & gifts' },
                  { id: 'orange', name: 'Sunset Amber', color: '#F59E0B', desc: 'Hardware, toys & tech' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setThemeColor(preset.id as any)}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      themeColor === preset.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full mt-0.5 border border-white/20 flex-shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{preset.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold font-poppins text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Trash2 size={18} className="text-error" />
                Danger Zone
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Irreversible administrative operations</p>
            </div>
            
            <div className="p-5 border border-red-500/25 bg-red-500/5 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Wipe All Local Database Data</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    This will delete all products, stock levels, categories, customers, billing invoices, udhar ledger credits, and expense items. Your business settings and administrator account will not be affected. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleWipeData}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/10 transition"
                >
                  Wipe Database Data
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
