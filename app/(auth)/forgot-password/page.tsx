'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slatebg dark:bg-darkbg px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-2xl p-8 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="font-poppins font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-mutedtxt dark:text-slate-400 font-medium">
            Enter your email and we'll send you link instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-success/15 flex items-center justify-center text-success">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Reset Link Dispatched</p>
            <p className="text-xs text-mutedtxt leading-relaxed">
              If an account matches <strong>{email}</strong>, we have dispatched a verification password reset link. Please check your inbox.
            </p>
            <Link
              href="/login"
              className="block w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 text-center transition-all"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? 'Processing...' : 'Dispatch Reset Link'}
            </button>

            <div className="text-center pt-2 text-xs">
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Back to Login Screen
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
