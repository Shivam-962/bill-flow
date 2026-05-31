import { createClient } from '@supabase/supabase-js';

// --- TS Types mirroring our DB Schema ---
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
}

export interface Business {
  id: string;
  name: string;
  gstin?: string;
  phone: string;
  address?: string;
  logo_url?: string;
  invoice_prefix: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  barcode?: string;
  sku?: string;
  purchase_price: number;
  selling_price: number;
  gst_rate: number; // percentage (e.g. 18)
  stock_qty: number;
  low_stock_threshold: number;
  expiry_date?: string;
  batch_no?: string;
  image_url?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
  credit_balance: number; // Positive means they owe money (Udhar)
  loyalty_points: number;
}

export interface PaymentSplit {
  payment_method: 'cash' | 'upi' | 'card' | 'credit';
  amount: number;
  transaction_ref?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  unit_price: number;
  purchase_price: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  gst_amount: number;
  total_amount: number;
  status: 'paid' | 'unpaid' | 'partially_paid';
  payments: PaymentSplit[];
  items: InvoiceItem[];
}

export interface CreditTx {
  id: string;
  customer_id: string;
  invoice_id?: string;
  invoice_number?: string;
  type: 'due' | 'payment';
  amount: number;
  notes?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  qty: number; // negative for sales
  type: 'sale' | 'purchase' | 'return' | 'audit' | 'adjustment';
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  notes?: string;
  created_at: string;
}

export interface PrinterSettings {
  printer_type: 'browser' | 'usb' | 'network' | 'bluetooth';
  connection_string?: string;
  paper_size_mm: 58 | 80;
}

// Initialize Supabase if variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl !== '' && supabaseKey !== '';
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// --- Mock Seed Data ---
const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Crystal Still', category_id: 'cat1', barcode: '8901063013284', sku: 'GW-202', purchase_price: 30.0, selling_price: 45.0, gst_rate: 18, stock_qty: 45, low_stock_threshold: 10, batch_no: 'B291', expiry_date: '2026-12-31', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPrsMx6mtuyKWU8OSXRJlVt2goIskVXyk3RuNHlfIYZghpi0zJk_Q0z5HSVSoYoN1Dbdixj_H-8pyFh97ieAZ6j6-IO7uRrKALbv4Ux47V7Mj-6U9JKOVOPII-NXta0LRYTW1Bi3nUVBafNNmgscE1ksbRBJ2GN6yr8fNl6pcthevP5NvsKdKb06jdWgjwQyNpGlA4P7wENb62EkhVHRI-j0s13-Gqq_uIuR_V-ZtvPqDbEz1ZpI4HLBHq-OcA4Ov6gZXg4XB8Wku' },
  { id: 'p2', name: 'Vintage Cola', category_id: 'cat1', barcode: '8901058002316', sku: 'GW-105', purchase_price: 25.0, selling_price: 39.5, gst_rate: 18, stock_qty: 120, low_stock_threshold: 15, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEqnwZo3MNj1RGbXGis7xN0uNbCZahKVriVN9bn-DL9FAArCeYaikOqxsJ5aQydsdFoXvlpbtdwZd9sFyN2gCPFo_5XLWvFa9s4CGGQuslOXJl117jE2dU7JyssgK8BgVmU7PaZcy7_s96add8vtoMqxX2DYIyeZfduSkwkG5qoV3-cMcI2tiqcjeR3gQGHh1twp8BrN0wURfK-0uL5GAmy_N-qAovIRpsZb2OTIBLapXM7Zg5UnKOZCJtToe0-kPJgtX5Dg-ij13P' },
  { id: 'p3', name: 'Solar Citrus', category_id: 'cat1', barcode: '8901725181228', sku: 'GW-308', purchase_price: 35.0, selling_price: 52.0, gst_rate: 18, stock_qty: 24, low_stock_threshold: 5, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtuFnQbqK3eDpbeZ0eH0PDzypd_UnV9v97kXlPb_OfvsNrCcSEmldOSpEngyoGhGgk3NkYKha8LWrUj7oUbnBglc2HfGE1GDsBGJIXgWXMEe6RjqesG3n7RgdSzTmM8-c7qY6Ff-mGGVLhWzf8ITpn9h03KSWSSbOKSQ9l_1zXHupImXsa4-R0h91TqT5OYBI-Lkr1IqNt4sAyKIS1LTUPURpm2ev6myxr5HEU4p3C4_DKhNqyBwO4Jh-bM9gttIp03gzJbuh_HC4n' },
  { id: 'p4', name: 'Glacier Lime', category_id: 'cat1', barcode: '8901396328639', sku: 'GW-401', purchase_price: 32.0, selling_price: 47.5, gst_rate: 18, stock_qty: 32, low_stock_threshold: 6, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDotAzFZK3Lgx_ebYSzGtIkqyR2U2vEJgaucjF2L_mvQLC4GJ7YAY5Emkq5PtkL6Ds3JJ5sm37S9qOGabnW3OVS6bbVhTyRZquDFd-bBy2bwBcD5YLo27W8DufGq0T4STPLwmcLDvh_JC15h_hSqRyQOKV1nQwtR9YGdZJNrgcq2tnzjYkhpVR23V-U08bu8REJTl4R5xtI8JaXIEG3QrcuQo_osTg0uJry1AZj2ZnykvzgsX7HgXwG2Kr1rwFAS0AslhKNwC9l_OC' },
  { id: 'p5', name: 'Artisanal Quartet', category_id: 'cat2', barcode: '8901117101035', sku: 'GW-ALL', purchase_price: 100.0, selling_price: 145.0, gst_rate: 18, stock_qty: 15, low_stock_threshold: 5, image_url: 'https://lh3.googleusercontent.com/aida/ADBb0ui7PO_WSXawmHRt65PtLqRD8mwRR3YWnxab-lLAbKnSWjCt8saAVwFdoQSwm8A2pkFadOookBDTcGNKuBAgXJcfYHs0QUsSddzDBRqdu3FZ_ZzNxT1yqo-NO8Gw2D5txD1j5UP0a8uBIFGQp_dmZqCIuUf4pAUG3KLH7ZrrgEh1QNp0-7JHEKadXsjjT_xUJRAJIlti_8BoGxP0MuFSPcHujxFZIdLIcyyk9duoIJCgI21Zlo6zzNjRDWyO' },
  { id: 'p6', name: 'Silver Label', category_id: 'cat2', barcode: '8901262010019', sku: 'GW-SILVER', purchase_price: 55.0, selling_price: 80.0, gst_rate: 18, stock_qty: 18, low_stock_threshold: 5, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY4mOh4iIvppZi2MEkT5dr2BTkifvg4VZiv4Xc8RwPbV1pIAjDhK8CFiA33Bkkv18AsFsbgAkUpLD8ZH6WEzjy2X1QclYTyg0LH_ZrtZd3fOTnMiJHUz3dw7hPYXlqVMWPflto5OyK5EbXuKQcI0TWtVNcg-QWMEU6lzSJ_B_BdYu4QPww389x0a6OooCnaV9ZuJAeg2-eiu7Jaqe_y_bCGTCLyFbrznmUi9tlaQsFGlM4OV3YCcI4pvywk5D4_IffOIJ6xQ8MGjhS' },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Rajesh Kumar', phone: '9876543210', address: 'Flat 402, Green Glen Layout, Bangalore', gstin: '29AAAAA1111A1Z1', credit_balance: 1250.0, loyalty_points: 150 },
  { id: 'c2', name: 'Sunita Sharma', phone: '8765432109', address: 'HSR Layout, Sector 3, Bangalore', credit_balance: 0.0, loyalty_points: 80 },
  { id: 'c3', name: 'Vijay Patel', phone: '7654321098', address: 'Indiranagar, Bangalore', credit_balance: 420.0, loyalty_points: 210 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Sparkling & Still' },
  { id: 'cat2', name: 'Artisanal & Reserve' }
];

const DEFAULT_BUSINESS: Business = {
  id: 'b-default',
  name: 'Glacier White POS',
  gstin: '29GSTIN1234F1Z0',
  phone: '9999888877',
  address: '12th Main Road, HSR Layout, Sector 6, Bangalore - 560102',
  invoice_prefix: 'GW',
  currency: 'INR',
};

const DEFAULT_PRINTER: PrinterSettings = {
  printer_type: 'browser',
  paper_size_mm: 80
};

// Key helpers for localStorage keys
const KEYS = {
  BUSINESS: 'bf_business',
  CATEGORIES: 'bf_categories',
  PRODUCTS: 'bf_products',
  CUSTOMERS: 'bf_customers',
  INVOICES: 'bf_invoices',
  CREDITS: 'bf_credits',
  EXPENSES: 'bf_expenses',
  PRINTER: 'bf_printer',
};

// Safe LocalStorage getters/setters
const getLocal = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val) as T;
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      console.error('LocalStorage write failed:', e);
      if (
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22 ||
        e.code === 1014
      ) {
        alert('Warning: LocalStorage quota limit (5MB) exceeded! Please synchronize your data with the cloud database to free up local disk space.');
      }
    }
  }
};

// Database Bridge Implementation
export const db = {
  // --- Business & Config ---
  getBusiness: (): Business => {
    return getLocal<Business>(KEYS.BUSINESS, DEFAULT_BUSINESS);
  },
  updateBusiness: (business: Partial<Business>): Business => {
    const current = db.getBusiness();
    const updated = { ...current, ...business };
    setLocal(KEYS.BUSINESS, updated);
    return updated;
  },

  // --- Categories ---
  getCategories: (): Category[] => {
    return getLocal<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },
  addCategory: (name: string): Category => {
    const categories = db.getCategories();
    const newCat = { id: 'cat_' + Date.now(), name };
    categories.push(newCat);
    setLocal(KEYS.CATEGORIES, categories);
    return newCat;
  },

  // --- Products ---
  getProducts: (): Product[] => {
    return getLocal<Product[]>(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },
  addProduct: (product: Omit<Product, 'id'>): Product => {
    const products = db.getProducts();
    const newProd = { ...product, id: 'p_' + Date.now() };
    products.push(newProd);
    setLocal(KEYS.PRODUCTS, products);
    return newProd;
  },
  updateProduct: (id: string, updates: Partial<Product>): Product => {
    const products = db.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const updated = { ...products[idx], ...updates };
    products[idx] = updated;
    setLocal(KEYS.PRODUCTS, products);
    return updated;
  },
  deleteProduct: (id: string): void => {
    const products = db.getProducts();
    const filtered = products.filter(p => p.id !== id);
    setLocal(KEYS.PRODUCTS, filtered);
  },

  // --- Customers ---
  getCustomers: (): Customer[] => {
    return getLocal<Customer[]>(KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },
  getCustomerByPhone: (phone: string): Customer | undefined => {
    const customers = db.getCustomers();
    return customers.find(c => c.phone.trim() === phone.trim());
  },
  addCustomer: (customer: Omit<Customer, 'id' | 'credit_balance' | 'loyalty_points'>): Customer => {
    const customers = db.getCustomers();
    const existing = customers.find(c => c.phone === customer.phone);
    if (existing) return existing;
    const newCust: Customer = {
      ...customer,
      id: 'c_' + Date.now(),
      credit_balance: 0,
      loyalty_points: 0,
    };
    customers.push(newCust);
    setLocal(KEYS.CUSTOMERS, customers);
    return newCust;
  },
  updateCustomerBalance: (id: string, diff: number): Customer => {
    const customers = db.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    customers[idx].credit_balance = Number((customers[idx].credit_balance + diff).toFixed(2));
    setLocal(KEYS.CUSTOMERS, customers);
    return customers[idx];
  },
  updateCustomerLoyalty: (id: string, points: number): Customer => {
    const customers = db.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    customers[idx].loyalty_points += points;
    setLocal(KEYS.CUSTOMERS, customers);
    return customers[idx];
  },
  updateCustomer: (id: string, updates: Partial<Customer>): Customer => {
    const customers = db.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    customers[idx] = { ...customers[idx], ...updates };
    setLocal(KEYS.CUSTOMERS, customers);
    return customers[idx];
  },

  // --- Invoices ---
  getInvoices: (): Invoice[] => {
    return getLocal<Invoice[]>(KEYS.INVOICES, []);
  },
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'invoice_date'>): Invoice => {
    const invoices = db.getInvoices();
    const prefix = db.getBusiness().invoice_prefix || 'BF';
    const invoiceNum = `${prefix}-${Date.now().toString().slice(-6)}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: 'inv_' + Date.now(),
      invoice_number: invoiceNum,
      invoice_date: new Date().toISOString(),
    };

    // 1. Deduct Stock for each invoice item and record stock movements
    invoiceData.items.forEach(item => {
      try {
        const prod = db.getProducts().find(p => p.id === item.product_id);
        if (prod) {
          db.updateProduct(item.product_id, {
            stock_qty: Math.max(0, prod.stock_qty - item.qty)
          });
        }
      } catch (err) {
        console.error('Stock decrement failed for item:', item, err);
      }
    });

    // 2. Adjust customer credit/Udhar if there is a credit payment method
    const creditPayment = invoiceData.payments.find(p => p.payment_method === 'credit');
    if (creditPayment && creditPayment.amount > 0 && invoiceData.customer_id) {
      db.updateCustomerBalance(invoiceData.customer_id, creditPayment.amount);
      db.addCreditTransaction({
        customer_id: invoiceData.customer_id,
        invoice_id: newInvoice.id,
        invoice_number: newInvoice.invoice_number,
        type: 'due',
        amount: creditPayment.amount,
        notes: `Purchase balance due. Invoice #${newInvoice.invoice_number}`
      });
    }

    // 3. Award loyalty points (1 point per 100 Rs spent)
    if (invoiceData.customer_id && invoiceData.total_amount > 100) {
      const points = Math.floor(invoiceData.total_amount / 100);
      db.updateCustomerLoyalty(invoiceData.customer_id, points);
    }

    // Save invoice
    invoices.unshift(newInvoice);
    setLocal(KEYS.INVOICES, invoices);
    return newInvoice;
  },

  // --- Credits (Udhar History) ---
  getCreditTransactions: (customerId?: string): CreditTx[] => {
    const txs = getLocal<CreditTx[]>(KEYS.CREDITS, []);
    if (customerId) {
      return txs.filter(t => t.customer_id === customerId);
    }
    return txs;
  },
  addCreditTransaction: (tx: Omit<CreditTx, 'id' | 'created_at'>): CreditTx => {
    const txs = db.getCreditTransactions();
    const newTx: CreditTx = {
      ...tx,
      id: 'tx_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    txs.unshift(newTx);
    setLocal(KEYS.CREDITS, txs);
    return newTx;
  },
  payCustomerCredit: (customerId: string, amount: number, notes?: string): void => {
    // Subtract from customer's credit balance
    db.updateCustomerBalance(customerId, -amount);
    // Log payment transaction
    db.addCreditTransaction({
      customer_id: customerId,
      type: 'payment',
      amount,
      notes: notes || 'Manual Udhar payment received.'
    });
  },

  // --- Expenses ---
  getExpenses: (): Expense[] => {
    return getLocal<Expense[]>(KEYS.EXPENSES, []);
  },
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>): Expense => {
    const expenses = db.getExpenses();
    const newExp = {
      ...expense,
      id: 'exp_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    expenses.unshift(newExp);
    setLocal(KEYS.EXPENSES, expenses);
    return newExp;
  },

  // --- Printer Settings ---
  getPrinterSettings: (): PrinterSettings => {
    return getLocal<PrinterSettings>(KEYS.PRINTER, DEFAULT_PRINTER);
  },
  updatePrinterSettings: (settings: Partial<PrinterSettings>): PrinterSettings => {
    const current = db.getPrinterSettings();
    const updated = { ...current, ...settings };
    setLocal(KEYS.PRINTER, updated);
    return updated;
  }
};
