'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import Link from 'next/link';
import { ShieldCheck, Eye, EyeOff, ArrowRight, Clock, XCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useErpStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [statusIcon, setStatusIcon] = useState<'pending' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusIcon(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed.');
        if (result.status === 'pending') setStatusIcon('pending');
        if (result.status === 'rejected') setStatusIcon('rejected');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#131314] px-4 py-12 relative overflow-hidden">

      {/* Background Visual */}
      <div className="fixed bottom-0 left-0 w-full h-[30vh] opacity-20 pointer-events-none z-0">
        <img
          className="w-full h-full object-cover"
          alt="Server room ambiance"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5dSnmnhWBV1CxH0KhTRY2FLTUBq9kuWhcqozKUFAIcYgvOT0j2BYXvs8cDIVcIwHwFbV9wbAroS2tMOtWfHr-8d6pwu7AsLSQmGyB9xgDR3cB3F934elfujujRAwAs9vOBU18b3amrhgQWn616TbTEy4sr-qeynkOgfa97CVtoWp99ATApbRhuayLXIATS8zHj3bgKVhxGD4Q-teFwEEzywwHgmpgrRsaqA-XkiFEqtL3mJVfaeqNxpI-TlTkdHVBox2PLb0ZCTz"
        />
      </div>

      <main className="w-full max-w-[440px] px-4 md:px-0 relative z-10">

        {/* Brand Identity */}
        <div className="text-center mb-8">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight mb-2 text-primary">
            BillFlow
          </h1>
          <p className="font-mono text-xs text-[#cbc3d7] tracking-[0.2em] uppercase">
            Enterprise Resource Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#201f20] border border-white/5 rounded-lg p-8 md:p-10 flex flex-col gap-7">
          
          <div className="flex flex-col gap-2">
            <h2 className="font-sans text-lg font-semibold text-[#e5e2e3] flex items-center gap-3">
              <ShieldCheck size={22} className="text-[#4cd7f6]" />
              Terminal Login
            </h2>
            <p className="text-sm text-[#cbc3d7] opacity-70">Enter your credentials to access the POS network.</p>
          </div>

          {/* Error / Status Alert */}
          {error && (
            <div className={`p-3.5 text-xs font-semibold rounded-lg flex items-center gap-3 ${
              statusIcon === 'pending'
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                : statusIcon === 'rejected'
                  ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                  : 'text-red-400 bg-red-500/10 border border-red-500/20'
            }`}>
              {statusIcon === 'pending' && <Clock size={16} />}
              {statusIcon === 'rejected' && <XCircle size={16} />}
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-[#cbc3d7] tracking-wide" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full py-3.5 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-[#cbc3d7] tracking-wide" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full py-3.5 px-0 pr-10 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm tracking-[0.3em] placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-[#958ea0] hover:text-[#e5e2e3] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-primary text-white font-semibold text-sm flex items-center justify-center gap-3 mt-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-75"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#958ea0]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Terminal Status Footer */}
        <div className="mt-10 flex justify-between items-center opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
            <span className="font-mono text-xs text-[#e5e2e3] tracking-wider">NETWORK SECURE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#e5e2e3]">v2.4.0</span>
            <ShieldCheck size={16} className="text-[#e5e2e3]" />
          </div>
        </div>
      </main>
    </div>
  );
}
