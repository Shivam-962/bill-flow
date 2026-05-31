'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useErpStore();

  // State controls
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('demo@billflow.com');
  const [password, setPassword] = useState('admin123');
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'cashier'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (loginMode === 'email') {
        if (!email.trim() || !password.trim()) {
          setError('Email and password cannot be empty.');
          setLoading(false);
          return;
        }
      } else {
        if (!phone.trim() || (otpSent && otpCode !== '123456')) {
          setError(otpSent ? 'Incorrect OTP code. Enter 123456 for testing.' : 'Please enter a valid phone number.');
          setLoading(false);
          return;
        }
        if (!otpSent) {
          setOtpSent(true);
          setLoading(false);
          alert('OTP Sent! Enter "123456" to authenticate.');
          return;
        }
      }

      // Log in in global store
      const userMail = loginMode === 'email' ? email : `${phone}@phone.billflow.com`;
      login(userMail, selectedRole);
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slatebg dark:bg-darkbg px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-2xl p-8 space-y-6">
        
        {/* Brand Logo and Subtitle */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
            B
          </div>
          <h2 className="font-poppins font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            Welcome to BillFlow ERP
          </h2>
          <p className="text-xs text-mutedtxt dark:text-slate-400 font-medium">
            Sign in to access your dashboard and active POS terminal.
          </p>
        </div>

        {/* Login Mode Toggle Tab */}
        <div className="grid grid-cols-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/30">
          <button
            type="button"
            onClick={() => { setLoginMode('email'); setError(''); }}
            className={`py-2 rounded-lg text-xs font-semibold font-poppins transition-all ${
              loginMode === 'email'
                ? 'bg-white dark:bg-slate-850 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('phone'); setError(''); }}
            className={`py-2 rounded-lg text-xs font-semibold font-poppins transition-all ${
              loginMode === 'phone'
                ? 'bg-white dark:bg-slate-850 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 text-xs font-semibold text-error bg-error/10 border border-error/20 rounded-xl">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMode === 'email' ? (
            <>
              {/* Email field */}
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
              
              {/* Password field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Security Password</label>
                  <Link href="/forgot-password" className="text-[11px] font-semibold text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Phone number field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    required
                    disabled={otpSent}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* OTP Verification code field */}
              {otpSent && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top duration-200">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 123456"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm font-semibold tracking-widest text-center transition-all"
                  />
                  <p className="text-[10px] text-mutedtxt text-center pt-1">
                    Didn't receive code? <span className="text-primary hover:underline cursor-pointer">Resend OTP</span>
                  </p>
                </div>
              )}
            </>
          )}

          {/* Role selector dropdown for easy local testing */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Simulate Access Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'manager', 'cashier'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    selectedRole === role
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck size={18} />
                {otpSent ? 'Verify & Authenticate' : loginMode === 'email' ? 'Sign In Securely' : 'Request OTP Code'}
              </>
            )}
          </button>
        </form>

        {/* Footer info links */}
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <p className="text-slate-500">
            Need an merchant account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create a Store
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
