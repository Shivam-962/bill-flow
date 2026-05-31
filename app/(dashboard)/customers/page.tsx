'use client';

import { useState, useEffect } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { Customer, CreditTx, db } from '@/lib/db';
import {
  Users,
  Search,
  Plus,
  BookOpen,
  DollarSign,
  Award,
  History,
  TrendingUp,
  CreditCard,
  UserCheck,
  CheckCircle,
  X,
  MapPin,
  FileText
} from 'lucide-react';

export default function CustomersPage() {
  const {
    customers,
    addCustomer,
    payCustomerCredit,
    invoices,
    loadData
  } = useErpStore();

  // Load database structures
  useEffect(() => {
    loadData();
  }, [loadData]);

  // UI state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Add Customer modal states
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custGstin, setCustGstin] = useState('');

  // Collect Payment modal states
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Filter list
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  // Set default customer selection if list not empty and none selected
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Compile ledger activities for active customer
  const ledgerInvoices = invoices.filter(inv => inv.customer_phone === activeCustomer?.phone);
  const creditTxs = activeCustomer ? db.getCreditTransactions(activeCustomer.id) : [];

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;

    const newCust = addCustomer({
      name: custName,
      phone: custPhone,
      address: custAddress || undefined,
      gstin: custGstin || undefined
    });

    setSelectedCustomerId(newCust.id);
    setIsAddCustOpen(false);
    
    // Clear inputs
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustGstin('');
  };

  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || paymentAmount <= 0) return;

    payCustomerCredit(activeCustomer.id, paymentAmount, paymentNotes);
    setIsCollectPaymentOpen(false);
    setPaymentAmount(0);
    setPaymentNotes('');
    alert(`Successfully collected payment of ₹${paymentAmount.toFixed(2)} from ${activeCustomer.name}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-130px)] md:h-[calc(100vh-100px)]">
      
      {/* LEFT: CUSTOMER LIST (Directory Panel) */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Header Search and Add Customer Button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex justify-between items-center">
            <h4 className="font-poppins font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Users size={16} className="text-primary" />
              Customer Accounts
            </h4>
            <button
              onClick={() => setIsAddCustOpen(true)}
              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/95 transition flex items-center justify-center text-xs font-semibold gap-1"
            >
              <Plus size={12} />
              Add Customer
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Directory Listing (Scrollable) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
          {filteredCustomers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400">
              <Users className="text-slate-350 mb-1" size={24} />
              <p className="text-xs font-semibold">No customers found</p>
            </div>
          ) : (
            filteredCustomers.map(c => {
              const isSelected = c.id === selectedCustomerId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-4 cursor-pointer transition-all flex justify-between items-center select-none ${
                    isSelected
                      ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-950/20'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`font-semibold text-xs ${isSelected ? 'text-primary font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">+91 {c.phone}</p>
                  </div>
                  
                  {/* Credit tag indicator */}
                  <div className="text-right flex flex-col items-end">
                    {c.credit_balance > 0 ? (
                      <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                        Due: ₹{c.credit_balance.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">
                        Clear
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 font-semibold mt-1">Pts: {c.loyalty_points}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: CUSTOMER PROFILE & CREDIT LEDGER (Flexible Width) */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
        {activeCustomer ? (
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* Header profile info */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/20">
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <UserCheck className="text-primary" size={20} />
                  {activeCustomer.name}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mutedtxt">
                  <span className="font-mono">Phone: +91 {activeCustomer.phone}</span>
                  {activeCustomer.gstin && <span className="font-bold text-primary">GSTIN: {activeCustomer.gstin}</span>}
                  {activeCustomer.address && <span className="flex items-center gap-1"><MapPin size={12} /> {activeCustomer.address}</span>}
                </div>
              </div>

              {/* Action collect dues */}
              {activeCustomer.credit_balance > 0 && (
                <button
                  onClick={() => setIsCollectPaymentOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 shadow-md shadow-primary/25 flex items-center gap-1.5"
                >
                  <DollarSign size={14} />
                  Record Udhar Payment
                </button>
              )}
            </div>

            {/* Profile Metrics summary */}
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-850">
              <div className="p-6 border-r border-slate-100 dark:border-slate-850 text-center">
                <BookOpen className="text-error mx-auto mb-1.5" size={18} />
                <p className="text-[10px] font-bold text-mutedtxt uppercase tracking-wider">Pending Balance</p>
                <p className={`text-xl font-bold font-poppins mt-1 ${activeCustomer.credit_balance > 0 ? 'text-error' : 'text-success'}`}>
                  ₹{activeCustomer.credit_balance.toFixed(2)}
                </p>
              </div>

              <div className="p-6 border-r border-slate-100 dark:border-slate-850 text-center">
                <Award className="text-primary mx-auto mb-1.5" size={18} />
                <p className="text-[10px] font-bold text-mutedtxt uppercase tracking-wider">Loyalty Points</p>
                <p className="text-xl font-bold font-poppins text-primary mt-1">{activeCustomer.loyalty_points}</p>
              </div>

              <div className="p-6 text-center">
                <History className="text-accent mx-auto mb-1.5" size={18} />
                <p className="text-[10px] font-bold text-mutedtxt uppercase tracking-wider">Total Purchases</p>
                <p className="text-xl font-bold font-poppins text-slate-800 dark:text-white mt-1">{ledgerInvoices.length} Bills</p>
              </div>
            </div>

            {/* Ledgers Tabs panels */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
              
              {/* Left Column: Credit History Ledger */}
              <div className="border-r border-slate-100 dark:border-slate-850 flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-850 flex items-center gap-1.5">
                  <CreditCard className="text-slate-500" size={14} />
                  <span className="font-poppins font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Credit Ledger</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {creditTxs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No credit transactions logged.</p>
                  ) : (
                    creditTxs.map(tx => (
                      <div key={tx.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className={tx.type === 'due' ? 'text-error' : 'text-success'}>
                            {tx.type === 'due' ? 'Udhar Added' : 'Payment Received'}
                          </span>
                          <span className={tx.type === 'due' ? 'text-error font-bold' : 'text-success font-bold'}>
                            {tx.type === 'due' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{tx.notes}</p>
                        <p className="text-[9px] text-slate-400 font-mono pt-1">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Invoice Receipts History */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-850 flex items-center gap-1.5">
                  <FileText className="text-slate-500" size={14} />
                  <span className="font-poppins font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Invoice History</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {ledgerInvoices.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No invoices generated for this customer.</p>
                  ) : (
                    ledgerInvoices.map(inv => (
                      <div key={inv.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs font-poppins">#{inv.invoice_number}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{new Date(inv.invoice_date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs text-primary font-mono">₹{inv.total_amount.toFixed(2)}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            inv.status === 'paid' 
                              ? 'bg-success/15 text-success' 
                              : inv.status === 'partially_paid' 
                                ? 'bg-warning/15 text-warning' 
                                : 'bg-error/15 text-error'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Users size={32} className="text-slate-350 mb-2" />
            <p className="text-sm font-semibold font-poppins text-slate-700">No profile active</p>
            <p className="text-xs text-mutedtxt max-w-xs mt-1">Select a customer from the left column to inspect balance, purchase history, and credit records.</p>
          </div>
        )}
      </div>

      {/* ADD CUSTOMER MODAL */}
      {isAddCustOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1">
                <Plus size={16} />
                Register New Customer Profile
              </h3>
              <button onClick={() => setIsAddCustOpen(false)} className="p-1 rounded hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Amit Patel"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">10-Digit Mobile Phone</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">GSTIN / Tax Details (Optional)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={custGstin}
                  onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 29AAAAA1111A1Z1"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-semibold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Postal / Delivery Address</label>
                <textarea
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Flat, Layout, Street name, City..."
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {isCollectPaymentOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <DollarSign size={15} className="text-success" />
                Record Udhar Recovery
              </h3>
              <button onClick={() => setIsCollectPaymentOpen(false)} className="p-1 rounded hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 rounded-xl text-xs flex justify-between">
                <span className="text-slate-500 font-medium">Pending Dues:</span>
                <span className="font-bold text-error">₹{activeCustomer.credit_balance.toFixed(2)}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Amount Collected (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeCustomer.credit_balance}
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-bold text-primary font-poppins"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Transaction Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cash recovery, GPay received"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectPaymentOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-success text-white text-xs font-semibold rounded-xl hover:bg-success/95"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
