'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Unhandled BillFlow application crash:', error);
  }, [error]);

  const handleHardReset = () => {
    if (confirm('Are you sure you want to perform a hard reset? This will clear temporary session caches, but customer and invoice databases will remain intact.')) {
      // Clear session cache and reload
      localStorage.removeItem('bf_session');
      localStorage.removeItem('bf_checkout_count');
      // Keep main db cache unless they want a complete wipe, but let's keep database safe and just clear layout caches
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-poppins">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6 text-center relative">
        {/* Background Decorative Gradient Radial */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-error/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Application Interrupted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            BillFlow encountered a rendering exception. Your transaction state and inventory data are preserved in local storage.
          </p>
        </div>

        {/* Error Details */}
        {error.message && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
              Error Diagnosis
            </span>
            <code className="text-[11px] text-error font-mono break-all block max-h-24 overflow-y-auto">
              {error.message}
            </code>
          </div>
        )}

        {/* Action Button Controls */}
        <div className="grid grid-cols-1 gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Reload Interface (Recover)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleHardReset}
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 size={12} className="text-error" />
              Reset Cache
            </button>

            <Link
              href="/"
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Home size={12} />
              Home Page
            </Link>
          </div>
        </div>

        {/* Footer Support Tag */}
        <div className="pt-2 text-[10px] text-slate-400">
          If this issue persists, please contact the developer via our feedback form.
        </div>
      </div>
    </div>
  );
}
