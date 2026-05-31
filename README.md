# BillFlow ERP

BillFlow ERP is a production-ready, cloud-based Smart Billing, Inventory, and Customer Management System tailored for retail businesses, pharmacies, grocery outlets, and wholesalers. It modernizes traditional storefront workflows with instant POS invoice generation, barcode scan handling, offline-first reliability, automated WhatsApp PDF receipt delivery, and ESC/POS thermal printer support.

---

## Technical Stack & Architecture

- **Frontend Core:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Local Persistence & State:** Zustand state store with automated math-rounding calculations and transparent fallback to LocalStorage for offline-first resilience.
- **Backend & Cloud Database:** Supabase (PostgreSQL with automated schema triggers for real-time inventory deduction and Udhar balance ledger mapping).
- **Integrations:** Meta WhatsApp Cloud API (digital receipt templates), pdf-lib (client-side tax receipt compilers), Razorpay Checkout (licensing subscriptions), ESC/POS payload encoders.

---

## Directory Layout

```
billflow-erp/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Landing Page)
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── dashboard/page.tsx (Analytics & Recent Ledger logs)
│       ├── billing/page.tsx   (POS Terminal checkout)
│       ├── inventory/page.tsx (Stock SKU & Category mapper)
│       ├── customers/page.tsx (CRM & Udhar Credit logs)
│       ├── analytics/page.tsx (Performance charts)
│       ├── reports/page.tsx   (Taxes CSV export center)
│       ├── settings/page.tsx  (Hardware & profile settings)
│       └── admin/page.tsx     (SaaS Control panel diagnostics)
├── components/
│   ├── billing/
│   │   └── PaymentModal.tsx   (Checkout splits & printing automation)
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── store/
│   └── useErpStore.ts (State engine managing POS cart, catalog, and caches)
├── lib/
│   ├── db.ts (Abstracted Database layer with local storage fallback)
│   ├── whatsapp.ts (WhatsApp Web & Cloud API helpers)
│   ├── printer.ts (ESC/POS encoder & browser print spooler)
│   ├── pdf.ts (pdf-lib tax invoice creator)
│   └── razorpay.ts (Razorpay scripts loader & simulator)
├── supabase/
│   └── migrations/
│       └── 20260525000000_init_schema.sql (Postgres Database Schema)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Setup & Deployment Guide

### 1. Local Prerequisites
You can run this codebase locally using Node.js. 

Pre-requisites:
```bash
node -v  # Recommended version >= 18
npm -v
```

### 2. Installation
Navigate into the workspace folder and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment settings template:
```bash
cp .env.example .env.local
```
Update `.env.local` with your own Supabase, WhatsApp, and Razorpay API tokens when moving to production. **Note: If environment keys are omitted, the system automatically falls back to LocalStorage mode with pre-populated dummy seeds. This guarantees a fully working, interactive demo immediately on first startup!**

### 4. Running the Development Server
Launch the compiler server:
```bash
npm run dev
```
Open your browser and navigate to: `http://localhost:3000`

### 5. Production Compilation
Build a production-optimized package:
```bash
npm run build
npm run start
```

---

## Database Migration & Automation Triggers

To set up the cloud PostgreSQL database:
1. Create a new project in [Supabase Console](https://supabase.com).
2. Go to the SQL Editor tab.
3. Paste the contents of `supabase/migrations/20260525000000_init_schema.sql` and run it.

This migration sets up:
- **`trigger_decrease_stock_on_sale`**: Automatically deducts in-stock levels for products and writes stock movement logs whenever new invoice items are written.
- **`trigger_apply_credit_on_invoice`**: Automatically records outstanding debt under the customer profile if "credit (Udhar)" is chosen during checkout, tracking balances safely.
- **Row Level Security (RLS)** rules linked to businesses.

---

## Verification & Walkthrough Checklist

Here are the verification loops you can run to test the POS:
1. **Onboarding:** Create a shop profile on the Signup screen, choose a plan, and finalize.
2. **POS Checkout:** Open the Billing screen. Tap on product blocks to add them to the cart, or scan a barcode (using the camera scanner simulation).
3. **Customer Lookup:** Type `9876543210` in the customer phone search. Watch Rajesh Kumar's profile, past dues (₹1,250), and loyalty score load instantly.
4. **Checkout Splits:** Click "Collect Payment". Split payments between UPI and Cash, and select OK.
5. **Receipt Automation:** A new browser window will auto-open to spool the thermal receipt. Close it to view digital options (PDF download, copy share URL, WhatsApp Cloud API log event).
6. **Stock Inspection:** Go to Inventory and notice that Marie Gold Biscuit stock has decremented automatically.
7. **Reports:** Go to Report Center, review GST summaries, and click "Export GST Excel/CSV" to download a clean spreadsheet.
