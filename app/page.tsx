'use client';

import Link from 'next/link';
import {
  ArrowRight,
  HelpCircle,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Rss,
  Package,
  Receipt,
  Terminal
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-sans antialiased selection:bg-red-400 selection:text-black">
      
      {/* Google SEO JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BillFlow ERP",
            "operatingSystem": "Windows, Android, iOS, Web",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "description": "Smart Billing, Inventory, and Customer Management System tailored for retail storefronts."
          })
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-[#131314]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-sora text-lg md:text-xl font-bold text-[#F87171]">BillFlow ERP</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#cbc3d7]">
          <a className="hover:text-[#F87171] transition-colors" href="#features">Solutions</a>
          <a className="hover:text-[#F87171] transition-colors" href="#trust">Enterprise</a>
          <a className="hover:text-[#F87171] transition-colors" href="#pricing">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <HelpCircle className="text-[#cbc3d7] cursor-pointer hover:text-[#F87171] transition-colors" size={20} />
          <Settings className="text-[#cbc3d7] cursor-pointer hover:text-[#F87171] transition-colors" size={20} />
          <Link 
            href="/register" 
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#F87171] text-black hover:bg-[#fca5a5] hover:shadow-[0_0_20px_rgba(248,113,113,0.3)] transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 py-20 overflow-hidden bg-[radial-gradient(circle_at_20%_30%,rgba(248,113,113,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(109, 59, 215, 0.05)_0%,transparent_50%)]">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-[#1c1b1c] mb-8 animate-pulse">
              <span className="flex h-2 w-2 rounded-full bg-red-400"></span>
              <span className="text-xs font-mono text-[#cbc3d7]">V3.4 Now Live - New POS Terminal Engine</span>
            </div>

            <h1 className="font-sora text-4xl md:text-6xl font-extrabold mb-6 max-w-4xl tracking-tight leading-tight">
              Unified ERP for <span className="text-[#F87171]">Beverage Distribution</span>
            </h1>

            <p className="text-sm md:text-base text-[#cbc3d7] max-w-2xl mb-10 leading-relaxed">
              Streamline your wholesale and retail operations with a high-performance ledger designed for high-velocity liquid logistics. Manage inventory, billing, and terminals in one crystalline interface.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="px-8 py-3.5 rounded-lg text-sm font-bold bg-[#F87171] text-black hover:bg-[#fca5a5] hover:shadow-[0_0_25px_rgba(248,113,113,0.45)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-3.5 rounded-lg text-sm font-bold border border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/30 transition-all text-center"
              >
                Sign In
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-20 w-full max-w-5xl bg-[#0a0a0b]/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl shadow-2xl transition-all duration-300 hover:border-red-400/20">
              <img
                alt="ERP Dashboard Interface" 
                className="rounded-xl w-full opacity-90 hover:opacity-100 transition-opacity duration-300" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQMe3O98gNW550Vm1e8kNZzV5tnuFVqWDnwWsgPmCwOxwlmmDZOguCneMiKeC0I7bILsXqq1M535csvpzCdWQmtA8KQM7ZLmOzvO_4OJaNRypHLdriUPprnryll9k5NXa4iKOS_STcRWNAixQU0FIIngj-Ss6AURhJqPsvOQMpdKOw4P2r0xZC4eS5uxwUBvBwP0w4Y3B4eGENGnnLm6lhxcmlgzP2mo8sr45f3woFsXh4A682eI0s1RI3sEghakuDtzwAa3R_aBWG"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 md:px-12 py-24 bg-[#131314]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-[#0a0a0b]/60 backdrop-blur-md p-8 rounded-2xl border border-white/5 flex flex-col gap-4 transition-all duration-300 hover:border-[#F87171]/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-red-500/5 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-400/10 mb-2 group-hover:bg-[#F87171]/20 transition-colors">
                  <Package className="text-[#F87171]" size={28} />
                </div>
                <h3 className="font-sora font-semibold text-lg md:text-xl">Real-time Inventory</h3>
                <p className="text-xs md:text-sm text-[#cbc3d7] leading-relaxed">
                  Live tracking across multiple warehouses. Automated reordering alerts and batch movement history for total distribution control.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#0a0a0b]/60 backdrop-blur-md p-8 rounded-2xl border border-white/5 flex flex-col gap-4 transition-all duration-300 hover:border-[#F87171]/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-red-500/5 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-400/10 mb-2 group-hover:bg-[#F87171]/20 transition-colors">
                  <Receipt className="text-[#F87171]" size={28} />
                </div>
                <h3 className="font-sora font-semibold text-lg md:text-xl">Smart Wholesale Billing</h3>
                <p className="text-xs md:text-sm text-[#cbc3d7] leading-relaxed">
                  Complex pricing tiers and tax calculations handled instantly. Generate professional invoices and track reconciliation in one place.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#0a0a0b]/60 backdrop-blur-md p-8 rounded-2xl border border-white/5 flex flex-col gap-4 transition-all duration-300 hover:border-[#F87171]/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-red-500/5 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-400/10 mb-2 group-hover:bg-[#F87171]/20 transition-colors">
                  <Terminal className="text-[#F87171]" size={28} />
                </div>
                <h3 className="font-sora font-semibold text-lg md:text-xl">Mobile POS Integration</h3>
                <p className="text-xs md:text-sm text-[#cbc3d7] leading-relaxed">
                  Connect distribution center billing with retail floor terminals. Synchronized sales data across your entire retail ecosystem.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="trust" className="px-6 md:px-12 py-20 bg-[#0e0e0f] border-y border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-sora text-xl md:text-2xl font-bold mb-12">Built for Performance &amp; Scale</h2>
            <div className="flex flex-col md:flex-row justify-between gap-12 items-center">
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-[#F87171]" size={22} />
                  <span className="font-sora font-semibold text-base md:text-lg">Secure Terminal Access</span>
                </div>
                <p className="text-xs text-[#cbc3d7] max-w-xs">Role-based permissions and end-to-end encryption for every transaction.</p>
              </div>

              <div className="h-px w-12 md:h-12 md:w-px bg-white/10 hidden md:block"></div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-[#F87171]" size={22} />
                  <span className="font-sora font-semibold text-base md:text-lg">Enterprise Grade Reliability</span>
                </div>
                <p className="text-xs text-[#cbc3d7] max-w-xs">99.99% uptime with global edge synchronization for zero-latency billing.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="pricing" className="px-6 md:px-12 py-32 bg-[#131314] text-center">
          <div className="max-w-3xl mx-auto bg-[#0a0a0b]/60 backdrop-blur-md p-12 rounded-2xl border border-[#F87171]/20 shadow-xl transition-all duration-300 hover:border-[#F87171]/40">
            <h2 className="font-sora text-2xl md:text-4xl font-bold mb-6">Ready to optimize your flow?</h2>
            <p className="text-sm md:text-base text-[#cbc3d7] mb-10">
              Join the leading beverage distributors who have transformed their logistics with BillFlow.
            </p>
            <Link 
              href="/register" 
              className="inline-block px-10 py-4 rounded-lg text-sm font-bold bg-[#F87171] text-black hover:bg-[#fca5a5] hover:shadow-[0_0_20px_rgba(248,113,113,0.35)] transition-all"
            >
              Start Your Free Trial
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#1c1b1c] px-6 md:px-12 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <span className="font-sora text-lg font-bold text-[#F87171]">BillFlow ERP</span>
              <p className="text-xs text-[#cbc3d7] max-w-xs">The ultimate precision tool for the beverage distribution industry.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-xs text-[#cbc3d7]">
              <a className="hover:text-[#F87171] transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-[#F87171] transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-[#F87171] transition-colors" href="#">Contact Support</a>
              <a className="hover:text-[#F87171] transition-colors" href="#">API Docs</a>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#cbc3d7]">
            <p>&copy; 2026 BillFlow ERP. All rights reserved.</p>
            <div className="flex gap-4">
              <Globe className="cursor-pointer hover:text-[#F87171] transition-colors" size={18} />
              <Rss className="cursor-pointer hover:text-[#F87171] transition-colors" size={18} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
