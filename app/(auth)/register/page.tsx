'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErpStore } from '@/store/useErpStore';
import Link from 'next/link';
import { Store, User, Mail, Phone, ArrowRight, ShieldAlert } from 'lucide-react';
import { razorpay } from '@/lib/razorpay';

export default function RegisterPage() {
  const router = useRouter();
  const { updateBusiness, login } = useErpStore();

  // State forms
  const [storeName, setStoreName] = useState('My Local Supermart');
  const [ownerName, setOwnerName] = useState('Rajesh Patel');
  const [email, setEmail] = useState('rajesh@localmart.com');
  const [phone, setPhone] = useState('9876543210');
  const [invoicePrefix, setInvoicePrefix] = useState('LM');
  const [gstin, setGstin] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'enterprise'>('free');
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If premium plan selected, simulate Razorpay payment setup
    if (selectedPlan !== 'free') {
      try {
        const amt = selectedPlan === 'premium' ? 99900 : 499900; // in paisa
        await razorpay.openCheckout({
          amount: amt,
          currency: 'INR',
          name: 'BillFlow ERP licensing',
          description: `Subscription activation for ${storeName} (${selectedPlan.toUpperCase()})`,
          handler: (response) => {
            console.log('Payment checkout success callback:', response);
            alert(`Payment Successful!\nTransaction ID: ${response.razorpay_payment_id}\nYour account is now activated!`);
            finalizeSignup();
          },
          prefill: {
            name: ownerName,
            email: email,
            contact: phone
          }
        });
      } catch (err) {
        console.error('Payment checkout failed:', err);
        setLoading(false);
        return;
      }
    } else {
      finalizeSignup();
    }
  };

  const finalizeSignup = () => {
    // 1. Update business in DB
    updateBusiness({
      name: storeName,
      gstin: gstin || undefined,
      phone: phone,
      invoice_prefix: invoicePrefix.toUpperCase(),
    });

    // 2. Set current operator session
    login(email, 'admin');

    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slatebg dark:bg-darkbg px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-2xl p-8 space-y-6">
        
        {/* Step progress tracker */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-poppins font-bold text-lg text-slate-800 dark:text-white">
              Create Merchant Account
            </span>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full font-mono">
            STEP {step} OF 2
          </span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Business / Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Owner Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Primary Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">GSTIN / Tax Number (Optional)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="29AAAAA1111A1Z1"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Bill Invoice Prefix</label>
                <input
                  type="text"
                  maxLength={5}
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="e.g. BF, TX, LM"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-sm transition-all font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-4 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
            >
              Continue to Plans
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            {/* SaaS Tiers selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Subscription Tier</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Free plan */}
                <div
                  onClick={() => setSelectedPlan('free')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 ${
                    selectedPlan === 'free' 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <p className="font-bold text-sm text-slate-800 dark:text-white">Starter Free</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">Basic POS billing & local database.</p>
                  <p className="font-poppins font-bold text-lg pt-3 text-slate-900 dark:text-slate-100">₹0 <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/month</span></p>
                </div>
                {/* Premium plan */}
                <div
                  onClick={() => setSelectedPlan('premium')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 ${
                    selectedPlan === 'premium' 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <p className="font-bold text-sm text-primary">SaaS Premium</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">Cloud Sync, WhatsApp API & Printer.</p>
                  <p className="font-poppins font-bold text-lg pt-3 text-slate-900 dark:text-slate-100">₹999 <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/month</span></p>
                </div>
                {/* Enterprise plan */}
                <div
                  onClick={() => setSelectedPlan('enterprise')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 ${
                    selectedPlan === 'enterprise' 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <p className="font-bold text-sm text-slate-800 dark:text-white">Enterprise</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">Multi-branch outlets & API access.</p>
                  <p className="font-poppins font-bold text-lg pt-3 text-slate-900 dark:text-slate-100">₹4,999 <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/month</span></p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="text-primary mt-0.5" size={16} />
              <p className="text-[10px] leading-relaxed text-mutedtxt">
                If selecting Premium or Enterprise, clicking "Finalize Setup" will trigger our Razorpay Checkout window in simulated mode.
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Finalize & Activate'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <p className="text-slate-500">
            Already have an active account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
