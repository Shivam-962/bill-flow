'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import Link from 'next/link';
import { ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#131314] px-4 py-12 relative overflow-hidden">

      {/* Background Visual Embellishment */}
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
          
          {/* Card Header */}
          <div className="flex flex-col gap-2">
            <h2 className="font-sans text-lg font-semibold text-[#e5e2e3] flex items-center gap-3">
              <ShieldCheck size={22} className="text-[#4cd7f6]" />
              Terminal Login
            </h2>
            <p className="text-sm text-[#cbc3d7] opacity-70">Enter secure credentials to access the POS network.</p>
          </div>

          {/* Login Mode Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setLoginMode('email'); setError(''); }}
              className={`py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                loginMode === 'email'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-transparent text-[#cbc3d7] border-white/10 hover:border-white/20'
              }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('phone'); setError(''); }}
              className={`py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                loginMode === 'phone'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-transparent text-[#cbc3d7] border-white/10 hover:border-white/20'
              }`}
            >
              OTP Login
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {loginMode === 'email' ? (
              <>
                {/* Terminal ID / Email */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[#cbc3d7] tracking-wide" htmlFor="terminal-email">
                    Terminal ID / Email
                  </label>
                  <input
                    id="terminal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@billflow.com"
                    required
                    className="w-full py-3.5 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                  />
                </div>

                {/* Access Pin / Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[#cbc3d7] tracking-wide" htmlFor="access-pin">
                    Access Pin
                  </label>
                  <div className="relative">
                    <input
                      id="access-pin"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
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
              </>
            ) : (
              <>
                {/* Phone number */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[#cbc3d7] tracking-wide" htmlFor="phone-field">
                    Mobile Phone Number
                  </label>
                  <input
                    id="phone-field"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    required
                    disabled={otpSent}
                    className="w-full py-3.5 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm placeholder:text-[#958ea0]/40 focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                {/* OTP */}
                {otpSent && (
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs text-[#cbc3d7] tracking-wide" htmlFor="otp-field">
                      6-Digit Verification Code
                    </label>
                    <input
                      id="otp-field"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 123456"
                      required
                      className="w-full py-3.5 px-0 bg-transparent border-0 border-b border-white/10 text-[#e5e2e3] font-mono text-sm tracking-[0.5em] text-center placeholder:text-[#958ea0]/40 placeholder:tracking-normal focus:ring-0 focus:border-[#4cd7f6] outline-none transition-colors"
                    />
                    <p className="text-[10px] text-[#958ea0] text-center pt-1">
                      Didn&apos;t receive code? <span className="text-[#4cd7f6] hover:underline cursor-pointer">Resend OTP</span>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Role selector */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="font-mono text-xs text-[#cbc3d7] tracking-wide">Simulate Access Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'manager', 'cashier'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      selectedRole === role
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-white/10 text-[#958ea0] hover:text-[#e5e2e3] hover:border-white/20'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Remember Terminal */}
            <label className="flex items-center gap-3 cursor-pointer group mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#494454] bg-transparent text-[#4cd7f6] focus:ring-[#4cd7f6]/20 transition-all"
              />
              <span className="text-sm text-[#cbc3d7] group-hover:text-[#e5e2e3] transition-colors">Remember Terminal</span>
            </label>

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
                  {otpSent ? 'Verify & Authenticate' : loginMode === 'email' ? 'Sign In' : 'Request OTP Code'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Forgot Pin Link */}
          <div className="text-center pt-1">
            <Link
              href="/forgot-password"
              className="font-mono text-xs text-[#cbc3d7] hover:text-[#4cd7f6] transition-colors underline underline-offset-4 decoration-[#494454]"
            >
              Forgot Access Pin?
            </Link>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#958ea0]">
            Need a merchant account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create a Store
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
            <span className="font-mono text-xs text-[#e5e2e3]">v2.4.0-STABLE</span>
            <ShieldCheck size={16} className="text-[#e5e2e3]" />
          </div>
        </div>
      </main>
    </div>
  );
}
