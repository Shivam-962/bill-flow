'use client';

import { useState, useEffect } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { Invoice, PaymentSplit } from '@/lib/db';
import { printer } from '@/lib/printer';
import { whatsapp } from '@/lib/whatsapp';
import { pdf } from '@/lib/pdf';
import {
  X,
  CreditCard,
  Wallet,
  Smartphone,
  BookOpen,
  Printer,
  Share2,
  FileDown,
  Sparkles,
  CheckCircle2,
  Send
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

export default function PaymentModal({ isOpen, onClose, totalAmount }: PaymentModalProps) {
  const { selectedCustomer, checkout, business, updatePaymentSplits } = useErpStore();
  
  // Checkout statuses
  const [step, setStep] = useState<'pay' | 'success'>('pay');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  
  // Payment methods values
  const [cashAmount, setCashAmount] = useState<number>(totalAmount);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState<string>('');

  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Recalculate default cash amount when total changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('pay');
      setCreatedInvoice(null);
      setCashAmount(totalAmount);
      setUpiAmount(0);
      setCardAmount(0);
      setCreditAmount(0);
      setTransactionRef('');
      setWhatsappSent(false);
    }
  }, [isOpen, totalAmount]);

  if (!isOpen) return null;

  const totalSplit = Number((cashAmount + upiAmount + cardAmount + creditAmount).toFixed(2));
  const balanceDue = Number((totalAmount - totalSplit).toFixed(2));
  const changeBack = balanceDue < 0 ? Math.abs(balanceDue) : 0;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (balanceDue > 0) {
      alert(`Please assign the full invoice balance. Remaining: ₹${balanceDue.toFixed(2)}`);
      return;
    }

    if (creditAmount > 0 && !selectedCustomer) {
      alert('Credit (Udhar) payments require selecting a registered customer first.');
      return;
    }

    // Build splits array
    const splits: PaymentSplit[] = [];
    if (cashAmount > 0) splits.push({ payment_method: 'cash', amount: changeBack > 0 ? cashAmount - changeBack : cashAmount });
    if (upiAmount > 0) splits.push({ payment_method: 'upi', amount: upiAmount, transaction_ref: transactionRef || undefined });
    if (cardAmount > 0) splits.push({ payment_method: 'card', amount: cardAmount, transaction_ref: transactionRef || undefined });
    if (creditAmount > 0) splits.push({ payment_method: 'credit', amount: creditAmount });

    try {
      // Sync payment splits to Zustand
      updatePaymentSplits(splits);
      // Run checkout compiler
      const invoiceObj = checkout();
      setCreatedInvoice(invoiceObj);
      setStep('success');

      // Auto-trigger browser print for faster cashier billing
      setTimeout(() => {
        printer.printViaBrowser(invoiceObj, business);
      }, 500);
    } catch (err: any) {
      alert(`POS Checkout Error: ${err.message}`);
    }
  };

  // WhatsApp Automation trigger
  const handleSendWhatsApp = async () => {
    if (!createdInvoice) return;
    setWhatsappLoading(true);
    
    // Simulating Cloud API delivery
    const result = await whatsapp.sendViaCloudAPI(createdInvoice, business.name);
    setWhatsappLoading(false);
    
    if (result.success) {
      setWhatsappSent(true);
    } else {
      // If failure, fall back to Manual link opening
      const shareUrl = whatsapp.getShareLink(createdInvoice, business.name);
      window.open(shareUrl, '_blank');
    }
  };

  const handleDownloadPDF = async () => {
    if (!createdInvoice) return;
    await pdf.downloadInvoicePdf(createdInvoice, business);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
            {step === 'pay' ? (
              <>
                <Sparkles className="text-primary" size={18} />
                Finalize POS Checkout
              </>
            ) : (
              <>
                <CheckCircle2 className="text-success" size={18} />
                Invoice Generated
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {step === 'pay' ? (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Total Balance Panel */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-mutedtxt uppercase tracking-wider">Net Amount Payable</p>
                <p className="text-2xl font-bold font-poppins text-primary">₹{totalAmount.toFixed(2)}</p>
              </div>
              {selectedCustomer && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-mutedtxt uppercase tracking-wider">Customer Details</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{selectedCustomer.phone}</p>
                </div>
              )}
            </div>

            {/* Split Options Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Assign Payment Split</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash payment */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Wallet size={14} className="text-success" />
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl outline-none font-semibold text-sm transition-all"
                  />
                </div>

                {/* UPI payment */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Smartphone size={14} className="text-secondary" />
                    UPI / Scan Code
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={upiAmount || ''}
                    onChange={(e) => setUpiAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl outline-none font-semibold text-sm transition-all"
                  />
                </div>

                {/* Card payment */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <CreditCard size={14} className="text-accent" />
                    Card Swiped
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cardAmount || ''}
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl outline-none font-semibold text-sm transition-all"
                  />
                </div>

                {/* Credit (Udhar) payment */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <BookOpen size={14} className="text-warning" />
                    Udhar / Credit Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!selectedCustomer}
                    value={creditAmount || ''}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    placeholder={!selectedCustomer ? 'Select Customer First' : '0.00'}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl outline-none font-semibold text-sm transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* UPI/Card Transaction reference code */}
              {(upiAmount > 0 || cardAmount > 0) && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top duration-200">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Transaction ID / Reference Code</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter UPI Tx ID or Card Auth Code"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl outline-none text-sm transition-all"
                  />
                </div>
              )}
            </div>

            {/* Calculations summaries */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Assigned Total:</span>
                <span className="font-semibold text-slate-800 dark:text-white">₹{totalSplit.toFixed(2)}</span>
              </div>
              
              {balanceDue > 0 ? (
                <div className="flex justify-between items-center text-xs p-2.5 bg-error/10 border border-error/20 rounded-xl">
                  <span className="text-error font-bold">Unassigned Balance Due:</span>
                  <span className="font-bold text-error">₹{balanceDue.toFixed(2)}</span>
                </div>
              ) : changeBack > 0 ? (
                <div className="flex justify-between items-center text-xs p-2.5 bg-success/15 border border-success/20 rounded-xl">
                  <span className="text-success font-bold">Cash Change to Return:</span>
                  <span className="font-bold text-success">₹{changeBack.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                  <span className="text-primary font-bold">Payment Fully Assigned:</span>
                  <span className="font-bold text-primary">₹0.00</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Modify Cart
              </button>
              <button
                type="submit"
                disabled={balanceDue > 0}
                className="flex-1 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Generate Bill
              </button>
            </div>

          </form>
        ) : (
          <div className="p-6 space-y-6 text-center">
            
            {/* Confirmation Banner */}
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/15 flex items-center justify-center text-success">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-poppins font-bold text-lg text-slate-800 dark:text-white">
                Invoice #{createdInvoice?.invoice_number}
              </h4>
              <p className="text-xs text-mutedtxt">
                POS transaction cleared and stock inventory updated successfully.
              </p>
            </div>

            {/* Automation Options Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Print Receipt */}
              <button
                onClick={() => createdInvoice && printer.printViaBrowser(createdInvoice, business)}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 text-slate-700 dark:text-slate-200 transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <Printer size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs">Print Thermal bill</p>
                  <p className="text-[10px] text-mutedtxt">Trigger ESC/POS printer</p>
                </div>
              </button>

              {/* WhatsApp Delivery */}
              <button
                onClick={handleSendWhatsApp}
                disabled={whatsappLoading}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  whatsappSent 
                    ? 'border-success bg-success/5 text-success'
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${whatsappSent ? 'bg-success/10 text-success' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {whatsappSent ? <CheckCircle2 size={18} /> : <Send size={18} />}
                </div>
                <div>
                  <p className="font-bold text-xs">{whatsappSent ? 'Sent on WhatsApp' : 'Send WhatsApp'}</p>
                  <p className="text-[10px] text-mutedtxt">Digital PDF delivery</p>
                </div>
              </button>

              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 text-slate-700 dark:text-slate-200 transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <FileDown size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs">Download PDF</p>
                  <p className="text-[10px] text-mutedtxt">Save invoice locally</p>
                </div>
              </button>

              {/* Share link options */}
              <button
                onClick={() => {
                  if (createdInvoice) {
                    const shareText = `Digital Receipt: https://billflow.vercel.app/invoice/${createdInvoice.id}`;
                    navigator.clipboard.writeText(shareText);
                    alert('Receipt link copied to clipboard!');
                  }
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 text-slate-700 dark:text-slate-200 transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <Share2 size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs">Copy Share URL</p>
                  <p className="text-[10px] text-mutedtxt">Send link via email/SMS</p>
                </div>
              </button>
            </div>

            {/* Print + WhatsApp simultaneously shortcut */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (createdInvoice) {
                    printer.printViaBrowser(createdInvoice, business);
                    handleSendWhatsApp();
                  }
                }}
                className="w-full py-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Sparkles size={14} />
                Auto-Print + WhatsApp Delivery
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={onClose}
                className="text-xs font-bold text-primary hover:underline"
              >
                Start Next Billing Cycle
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
