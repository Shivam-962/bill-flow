import { createClient } from '@supabase/supabase-js';

// --- TS Types mirroring our DB Schema ---
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
}

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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

// --- Empty Defaults (No Demo Data) ---
const DEFAULT_PRODUCTS: Product[] = [];
const DEFAULT_CUSTOMERS: Customer[] = [];
const DEFAULT_CATEGORIES: Category[] = [];

const DEFAULT_BUSINESS: Business = {
  id: 'b-default',
  name: 'BillFlow ERP',
  phone: '',
  invoice_prefix: 'BF',
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
  USERS: 'bf_registered_users',
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
  deleteCustomer: (id: string): void => {
    const customers = db.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    setLocal(KEYS.CUSTOMERS, filtered);
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
  },

  // --- User Registration & Access Control ---
  getRegisteredUsers: (): RegisteredUser[] => {
    return getLocal<RegisteredUser[]>(KEYS.USERS, []);
  },

  registerUser: (user: { email: string; name: string; phone?: string; password: string }): RegisteredUser => {
    const users = db.getRegisteredUsers();
    // Check if email already exists
    const exists = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists.');

    const isFirstUser = users.length === 0;
    const newUser: RegisteredUser = {
      id: 'usr_' + Date.now(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      password: user.password,
      role: isFirstUser ? 'admin' : 'cashier',
      status: isFirstUser ? 'approved' : 'pending',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setLocal(KEYS.USERS, users);
    return newUser;
  },

  authenticateUser: (email: string, password: string): RegisteredUser | null => {
    const users = db.getRegisteredUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user || null;
  },

  approveUser: (userId: string): RegisteredUser => {
    const users = db.getRegisteredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx].status = 'approved';
    setLocal(KEYS.USERS, users);
    return users[idx];
  },

  rejectUser: (userId: string): RegisteredUser => {
    const users = db.getRegisteredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx].status = 'rejected';
    setLocal(KEYS.USERS, users);
    return users[idx];
  },

  updateUserRole: (userId: string, role: 'admin' | 'manager' | 'cashier'): RegisteredUser => {
    const users = db.getRegisteredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx].role = role;
    setLocal(KEYS.USERS, users);
    return users[idx];
  },

  deleteRegisteredUser: (userId: string): void => {
    const users = db.getRegisteredUsers();
    const filtered = users.filter(u => u.id !== userId);
    setLocal(KEYS.USERS, filtered);
  },

  clearAllBusinessData: (): void => {
    setLocal(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    setLocal(KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    setLocal(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setLocal(KEYS.INVOICES, []);
    setLocal(KEYS.CREDITS, []);
    setLocal(KEYS.EXPENSES, []);
    setLocal(KEYS.PRINTER, DEFAULT_PRINTER);
  },
};
