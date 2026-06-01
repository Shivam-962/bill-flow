'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import Link from 'next/link';
import { Store, User, Mail, Phone, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, login, updateBusiness } = useErpStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [gstin, setGstin] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<'admin' | 'pending' | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const result = register({ email, name, phone: phone || undefined, password });
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Registration failed.');
        return;
      }

      if (result.isFirstUser) {
        // First user = admin, auto-login and set up business
        if (storeName) {
          updateBusiness({
            name: storeName,
            phone: phone,
            invoice_prefix: invoicePrefix.toUpperCase() || 'BF',
            gstin: gstin || undefined,
          });
        }
        login(email, password);
        setSuccess('admin');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        // Subsequent users need admin approval
        setSuccess('pending');
      }
    }, 800);
  };

  // Success states
  if (success === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131314] px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Account Created!</h2>
          <p className="text-sm text-[#cbc3d7]">Setting up your workspace...</p>
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (success === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131314] px-4">
        <div className="max-w-md text-center space-y-5 bg-[#201f20] border border-white/5 rounded-lg p-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Registration Submitted!</h2>
          <p className="text-sm text-[#cbc3d7] leading-relaxed">
            Your account has been created but requires <strong className="text-white">admin approval</strong> before you can access the system. Please contact your administrator.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#131314] px-4 py-12 relative overflow-hidden">

      {/* Background */}
      <div className="fixed bottom-0 left-0 w-full h-[30vh] opacity-20 pointer-events-none z-0">
        <img
          className="w-full h-full object-cover"
          alt="Server room"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5dSnmnhWBV1CxH0KhTRY2FLTUBq9kuWhcqozKUFAIcYgvOT0j2BYXvs8cDIVcIwHwFbV9wbAroS2tMOtWfHr-8d6pwu7AsLSQmGyB9xgDR3cB3F934elfujujRAwAs9vOBU18b3amrhgQWn616TbTEy4sr-qeynkOgfa97CVtoWp99ATApbRhuayLXIATS8zHj3bgKVhxGD4Q-teFwEEzywwHgmpgrRsaqA-XkiFEqtL3mJVfaeqNxpI-TlTkdHVBox2PLb0ZCTz"
        />
      </div>

      <main className="w-full max-w-[500px] relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight mb-2 text-primary">
            BillFlow
          </h1>
          <p className="font-mono text-xs text-[#cbc3d7] tracking-[0.2em] uppercase">
            Create Your Account
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-[#201f20] border border-white/5 rounded-lg p-8 flex flex-col gap-6">

          {error && (
            <div className="p-3.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#cbc3d7] tracking-wide flex items-center gap-1.5">
                  <User size={12} /> Full Name
                </label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" required
                  className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#cbc3d7] tracking-wide flex items-center gap-1.5">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" required
                  className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-[#cbc3d7] tracking-wide flex items-center gap-1.5">
                <Phone size={12} /> Phone (optional)
              </label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#cbc3d7] tracking-wide flex items-center gap-1.5">
                  <Lock size={12} /> Password
                </label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required minLength={6}
                  className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#cbc3d7] tracking-wide flex items-center gap-1.5">
                  <Lock size={12} /> Confirm Password
                </label>
                <input
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password" required
                  className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Business Info (optional but encouraged) */}
            <div className="pt-3 border-t border-white/5">
              <p className="font-mono text-[10px] text-[#958ea0] mb-3 uppercase tracking-wider">Business Details (for first admin setup)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[#cbc3d7] tracking-wide flex items-center gap-1.5">
                    <Store size={12} /> Store Name
                  </label>
                  <input
                    type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                    placeholder="My Business"
                    className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[#cbc3d7] tracking-wide">
                    Invoice Prefix
                  </label>
                  <input
                    type="text" maxLength={5} value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="e.g. BF"
                    className="w-full py-3 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-primary text-white font-semibold text-sm flex items-center justify-center gap-3 mt-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-75"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#958ea0]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
