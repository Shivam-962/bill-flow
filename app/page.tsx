'use client';

import Link from 'next/link';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Printer,
  Users,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    { q: "Is a physical barcode scanner required?", a: "No. You can connect a standard barcode scan gun via USB or Bluetooth, or utilize your device's built-in camera as an immediate mobile scanner." },
    { q: "Does digital WhatsApp invoice delivery incur extra fees?", a: "Our Starter tier lets you share links manually for free. Premium plans use our cloud WhatsApp automation engine with no per-invoice charges up to standard thresholds." },
    { q: "Does the system support offline operations?", a: "Yes. In the event of internet drops, BillFlow logs sales queues in local storage and auto-synchronizes transactions once connectivity returns." },
    { q: "What thermal printers are supported?", a: "We support standard browser print spooling (which routes to any system driver), as well as direct TCP/IP network sockets, raw USB streams, and Bluetooth interfaces." }
  ];

  return (
    <div className="min-h-screen bg-slatebg dark:bg-darkbg transition-colors duration-200">
      
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 right-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
            B
          </div>
          <span className="font-poppins font-bold text-lg text-slate-800 dark:text-white tracking-tight">
            BillFlow<span className="text-primary">.</span>
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-primary transition">Features</a>
          <a href="#pricing" className="hover:text-primary transition">Pricing</a>
          <a href="#industries" className="hover:text-primary transition">Industries</a>
          <a href="#faq" className="hover:text-primary transition">FAQ</a>
        </nav>

        {/* Call to Actions */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-primary text-white text-xs font-poppins font-bold rounded-xl shadow-md shadow-primary/10 hover:bg-primary/95 transition-all flex items-center gap-1"
          >
            Create Store
            <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      {/* 2. Hero Header Section */}
      <section className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background glow decals */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono tracking-wider uppercase">
            <Sparkles size={12} />
            Enterprise Retail ERP Made Simple
          </div>

          <h1 className="font-poppins font-bold text-4xl md:text-6xl text-slate-800 dark:text-white leading-tight tracking-tight">
            Fast POS Billing & Cloud <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Inventory SaaS</span>
          </h1>

          <p className="text-base md:text-lg text-mutedtxt dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Generate tax invoices in under 3 seconds, manage stock quantities dynamically, track customer credit accounts, and instantly deliver PDF receipts directly on WhatsApp.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 hover:scale-105 transition-all flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Access Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section id="features" className="px-6 py-20 bg-white dark:bg-slate-950/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-slate-800 dark:text-white">
              Engineered for Modern Shop Operations
            </h2>
            <p className="text-xs text-mutedtxt max-w-md mx-auto">
              Everything your storefront needs to replace paper files and accelerate checkout checkouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* POS Checkout */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingCart size={18} />
              </div>
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Fast POS Billing</h3>
              <p className="text-xs text-mutedtxt leading-relaxed">
                Add products dynamically via search autocomplete or physical scan gun. Automatically compute CGST/SGST taxes, discounts, and cashier balances.
              </p>
            </div>

            {/* WhatsApp receipt delivery */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">WhatsApp Automation</h3>
              <p className="text-xs text-mutedtxt leading-relaxed">
                Skip paper printing entirely. Deliver gorgeous PDF receipt copies directly to customer numbers via cloud API integration instantly.
              </p>
            </div>

            {/* ESC/POS Thermal Printing */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <Printer size={18} />
              </div>
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Thermal Printer driver</h3>
              <p className="text-xs text-mutedtxt leading-relaxed">
                Print formatted sales slips automatically. Fully compatible with USB, Wi-Fi, and Bluetooth 58mm/80mm thermal paper formats.
              </p>
            </div>

            {/* Inventory audit tracking */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Layers size={18} />
              </div>
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Dynamic Inventory</h3>
              <p className="text-xs text-mutedtxt leading-relaxed">
                Stock levels decrease automatically upon billing checkout. Configure low stock trigger points, map batch codes, and shelf expiries.
              </p>
            </div>

            {/* Customer credits ledger (Udhar) */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users size={18} />
              </div>
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Udhar CRM Ledger</h3>
              <p className="text-xs text-mutedtxt leading-relaxed">
                Maintain balances for regular local customers. Check credit lines instantly, post manual collections, and track purchase loyalty points.
              </p>
            </div>

            {/* Recharts Analytics dashboard */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Interactive Analytics</h3>
              <p className="text-xs text-mutedtxt leading-relaxed">
                Visualize daily and monthly sales numbers, category sales velocity, best-selling SKUs, tax accounts, and operational cost metrics.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Industries Served Section */}
      <section id="industries" className="px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-slate-800 dark:text-white">
              Tailored for Diverse Shop Verticals
            </h2>
            <p className="text-xs text-mutedtxt max-w-md mx-auto">
              Our workflows adjust dynamically to match specific business structures.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 text-center bg-white dark:bg-slate-900 border border-slate-200/50 rounded-2xl hover:scale-105 transition-all">
              <p className="font-bold text-sm text-slate-800 dark:text-white font-poppins">Grocery Stores</p>
              <p className="text-[10px] text-slate-400 pt-1">Barcode scanner checkout & bulk packets</p>
            </div>
            <div className="p-5 text-center bg-white dark:bg-slate-900 border border-slate-200/50 rounded-2xl hover:scale-105 transition-all">
              <p className="font-bold text-sm text-slate-800 dark:text-white font-poppins">Pharmacies (Medical)</p>
              <p className="text-[10px] text-slate-400 pt-1">Expiry tracking & lot number filters</p>
            </div>
            <div className="p-5 text-center bg-white dark:bg-slate-900 border border-slate-200/50 rounded-2xl hover:scale-105 transition-all">
              <p className="font-bold text-sm text-slate-800 dark:text-white font-poppins">Fashion & Apparel</p>
              <p className="text-[10px] text-slate-400 pt-1">Discount tags, barcodes & item sizes</p>
            </div>
            <div className="p-5 text-center bg-white dark:bg-slate-900 border border-slate-200/50 rounded-2xl hover:scale-105 transition-all">
              <p className="font-bold text-sm text-slate-800 dark:text-white font-poppins">Electronics Shops</p>
              <p className="text-[10px] text-slate-400 pt-1">Serial code lookups & custom invoices</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-white dark:bg-slate-950/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-slate-800 dark:text-white">
              Transparent, Flexible Plans
            </h2>
            <p className="text-xs text-mutedtxt max-w-md mx-auto">
              Start with our free offline tier and scale into cloud and hardware sync as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Starter Free */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <p className="font-bold text-sm text-slate-500 uppercase font-poppins">Starter Free</p>
                <p className="text-3xl font-bold font-poppins text-slate-800 dark:text-white">₹0</p>
                <p className="text-xs text-mutedtxt">Perfect for single offline POS billing drawers.</p>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Local Database</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Standard POS Terminal</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Browser Print Layouts</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> 200 Unique Catalog SKUs</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-center text-xs font-bold transition"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Cloud Premium */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-8 rounded-2xl border-2 border-primary flex flex-col justify-between space-y-6 relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold font-mono tracking-wider uppercase">
                Most Popular
              </div>
              <div className="space-y-2">
                <p className="font-bold text-sm text-primary uppercase font-poppins">Cloud Premium</p>
                <p className="text-3xl font-bold font-poppins text-slate-800 dark:text-white">₹999 <span className="text-xs font-normal">/month</span></p>
                <p className="text-xs text-mutedtxt">For fast-growing retail outlets seeking CRM & Cloud automations.</p>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-355">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Everything in Starter Free</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Automated WhatsApp Delivery</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Cloud Database Synchronization</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Direct Thermal Print Driver</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Udhar credit CRM Ledger</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-2.5 bg-primary text-white hover:bg-primary/95 rounded-xl text-center text-xs font-bold shadow-lg shadow-primary/15 transition"
              >
                Subscribe Premium
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <p className="font-bold text-sm text-slate-500 uppercase font-poppins">Enterprise</p>
                <p className="text-3xl font-bold font-poppins text-slate-800 dark:text-white">₹4,999 <span className="text-xs font-normal">/month</span></p>
                <p className="text-xs text-mutedtxt">Multi-branch outlets requiring custom ERP setups.</p>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Everything in Premium</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Multi-Branch Syncing</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Custom SLA Core Uptime</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Dedicated Account Manager</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-center text-xs font-bold transition"
              >
                Inquire Enterprise
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section id="faq" className="px-6 py-20 max-w-3xl mx-auto space-y-8">
        <h2 className="font-poppins font-bold text-2xl text-center text-slate-800 dark:text-white uppercase tracking-wider">
          Frequently Answered Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex justify-between items-center text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all font-poppins"
                >
                  {faq.q}
                  <ChevronRight size={14} className={`transform transition-transform ${isOpen ? 'rotate-90 text-primary' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs leading-relaxed text-mutedtxt animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="px-6 py-12 border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-poppins font-bold text-sm text-slate-800 dark:text-white">
            BillFlow ERP System
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          &copy; 2026 BillFlow Inc. All rights reserved. &bull; Privacy Policy &bull; Terms of Use &bull; Safe SSL Checkout
        </p>
      </footer>

    </div>
  );
}
