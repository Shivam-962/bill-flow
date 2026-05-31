'use client';

import { useState, useEffect } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { Invoice } from '@/lib/db';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Search,
  BookOpen,
  DollarSign,
  TrendingUp,
  Percent,
  TrendingDown
} from 'lucide-react';

export default function ReportsPage() {
  const { invoices, loadData } = useErpStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filters state
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    // Date match
    const date = new Date(inv.invoice_date);
    const today = new Date();
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = date.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      matchesDate = date.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = date >= weekAgo;
    }

    // Search query match
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inv.customer_name && inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (inv.customer_phone && inv.customer_phone.includes(searchQuery));

    return matchesDate && matchesSearch;
  });

  // Calculate totals
  const totalSubtotal = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalDiscount = filteredInvoices.reduce((sum, inv) => sum + inv.discount_amount, 0);
  const totalGst = filteredInvoices.reduce((sum, inv) => sum + inv.gst_amount, 0);
  const totalNet = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  // Profit estimation: Purchase price vs Selling price
  const totalProfit = filteredInvoices.reduce((sum, inv) => {
    const cost = inv.items.reduce((cSum, item) => cSum + (item.purchase_price * item.qty), 0);
    return sum + (inv.total_amount - cost - inv.gst_amount);
  }, 0);

  // CSV compiler
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoice records to export.');
      return;
    }

    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Customer Phone', 'Subtotal', 'Discount', 'GST Tax', 'Net Amount', 'Status'];
    
    const rows = filteredInvoices.map(inv => [
      inv.invoice_number,
      new Date(inv.invoice_date).toLocaleDateString(),
      inv.customer_name || 'Walk-in',
      inv.customer_phone || 'N/A',
      inv.subtotal.toFixed(2),
      inv.discount_amount.toFixed(2),
      inv.gst_amount.toFixed(2),
      inv.total_amount.toFixed(2),
      inv.status
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `GST_Invoices_Report_${dateFilter.toUpperCase()}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Reports Summary metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-mutedtxt uppercase">Subtotal (Before Taxes)</p>
          <p className="text-xl font-bold font-poppins text-slate-800 dark:text-white">₹{totalSubtotal.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-mutedtxt uppercase">GST Tax Collected</p>
          <p className="text-xl font-bold font-poppins text-warning">₹{totalGst.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-mutedtxt uppercase">Net Billings Total</p>
          <p className="text-xl font-bold font-poppins text-primary">₹{totalNet.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-mutedtxt uppercase">Estimated Gross Profit</p>
          <p className="text-xl font-bold font-poppins text-success">₹{totalProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Toolbar Filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
        
        {/* Date Filters and Search */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice # or customer..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>

        {/* Export trigger */}
        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 shadow-md shadow-primary/25 flex items-center justify-center gap-1.5"
        >
          <Download size={14} />
          Export GST Excel / CSV
        </button>

      </div>

      {/* Reports Table grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-bold font-poppins">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
                <th className="px-6 py-4 text-right">Discount</th>
                <th className="px-6 py-4 text-right">GST tax</th>
                <th className="px-6 py-4 text-right">Net Payable</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-medium text-slate-700 dark:text-slate-200">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="px-6 py-4 font-bold font-poppins text-primary">#{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {inv.customer_name ? (
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{inv.customer_name}</p>
                        <p className="text-[10px] text-slate-450 font-mono">+91 {inv.customer_phone}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">Walk-in Customer</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-500">₹{inv.subtotal.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono text-error">-₹{inv.discount_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono text-warning">₹{inv.gst_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-800 dark:text-white">₹{inv.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'paid' 
                        ? 'bg-success/15 text-success' 
                        : inv.status === 'partially_paid' 
                          ? 'bg-warning/15 text-warning' 
                          : 'bg-error/15 text-error'
                    }`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
