import { create } from 'zustand';
import { db, Product, Customer, Category, Invoice, Business, PrinterSettings, PaymentSplit, InvoiceItem, CreditTx, Expense } from '../lib/db';

interface CartItem {
  product: Product;
  qty: number;
  discount: number; // percentage discount on item
}

interface ErpState {
  // --- POS State ---
  cart: CartItem[];
  cartDiscount: number; // Fixed amount discount on total bill
  selectedCustomer: Customer | null;
  paymentSplits: PaymentSplit[];
  
  // --- Database Caches ---
  business: Business;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  printerSettings: PrinterSettings;
  theme: 'light' | 'dark';
  themeColor: 'blue' | 'green' | 'violet' | 'rose' | 'orange';
  currentUser: { email: string; role: 'admin' | 'manager' | 'cashier' } | null;

  // --- POS Actions ---
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  setCartDiscount: (amount: number) => void;
  selectCustomer: (customer: Customer | null) => void;
  updatePaymentSplits: (splits: PaymentSplit[]) => void;
  clearCart: () => void;
  checkout: () => Invoice;

  // --- DB Operations ---
  loadData: () => void;
  addCategory: (name: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'credit_balance' | 'loyalty_points'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  payCustomerCredit: (customerId: string, amount: number, notes?: string) => void;
  addExpense: (amount: number, category: string, notes?: string) => void;
  updateBusiness: (updates: Partial<Business>) => void;
  updatePrinter: (updates: Partial<PrinterSettings>) => void;
  toggleTheme: () => void;
  setThemeColor: (color: 'blue' | 'green' | 'violet' | 'rose' | 'orange') => void;

  // --- Auth Actions ---
  login: (email: string, role: 'admin' | 'manager' | 'cashier') => void;
  logout: () => void;
}

export const useErpStore = create<ErpState>((set, get) => ({
  // Initial POS state
  cart: [],
  cartDiscount: 0,
  selectedCustomer: null,
  paymentSplits: [{ payment_method: 'cash', amount: 0 }],

  // Caches loaded dynamically on mount
  business: { id: 'default', name: 'BillFlow ERP', phone: '', invoice_prefix: 'BF', currency: 'INR' },
  categories: [],
  products: [],
  customers: [],
  invoices: [],
  printerSettings: { printer_type: 'browser', paper_size_mm: 80 },
  theme: 'light',
  themeColor: 'blue',
  currentUser: null,

  // --- POS Actions ---
  addToCart: (product, qty = 1) => {
    const { cart } = get();
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.qty : 0;
    const newQty = currentQty + qty;

    if (newQty > product.stock_qty) {
      alert(`Warning: Insufficient stock! Only ${product.stock_qty} units of "${product.name}" are available in inventory.`);
      return;
    }

    if (existing) {
      const updated = cart.map(item =>
        item.product.id === product.id ? { ...item, qty: newQty } : item
      );
      set({ cart: updated });
    } else {
      set({ cart: [...cart, { product, qty, discount: 0 }] });
    }
  },

  updateCartQty: (productId, qty) => {
    const { cart } = get();
    if (qty <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const item = cart.find(i => i.product.id === productId);
    if (item && qty > item.product.stock_qty) {
      alert(`Warning: Insufficient stock! Only ${item.product.stock_qty} units of "${item.product.name}" are available in inventory.`);
      return;
    }
    const updated = cart.map(item =>
      item.product.id === productId ? { ...item, qty } : item
    );
    set({ cart: updated });
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    set({ cart: cart.filter(item => item.product.id !== productId) });
  },

  setCartDiscount: (amount) => {
    set({ cartDiscount: Math.max(0, amount) });
  },

  selectCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },

  updatePaymentSplits: (splits) => {
    set({ paymentSplits: splits });
  },

  clearCart: () => {
    set({
      cart: [],
      cartDiscount: 0,
      selectedCustomer: null,
      paymentSplits: [{ payment_method: 'cash', amount: 0 }]
    });
  },

  checkout: () => {
    const { cart, cartDiscount, selectedCustomer, paymentSplits, business } = get();
    if (cart.length === 0) throw new Error('Cart is empty');

    // 1. Precise calculations
    let subtotal = 0;
    let gst_amount = 0;

    const items: InvoiceItem[] = cart.map(item => {
      const p = item.product;
      const itemSubtotal = p.selling_price * item.qty;
      // GST calculation: price includes tax (GST-inclusive billing)
      // Base Price = Selling Price / (1 + GST_Rate / 100)
      const basePrice = itemSubtotal / (1 + p.gst_rate / 100);
      const taxAmount = itemSubtotal - basePrice;

      subtotal += basePrice;
      gst_amount += taxAmount;

      return {
        id: 'item_' + Math.random().toString(36).substring(2, 9),
        invoice_id: '',
        product_id: p.id,
        product_name: p.name,
        qty: item.qty,
        unit_price: p.selling_price,
        purchase_price: p.purchase_price,
        gst_rate: p.gst_rate,
        gst_amount: Number(taxAmount.toFixed(2)),
        total_amount: Number(itemSubtotal.toFixed(2)),
      };
    });

    const itemsTotal = cart.reduce((sum, item) => sum + (item.product.selling_price * item.qty), 0);
    const total_amount = Math.max(0, Number((itemsTotal - cartDiscount).toFixed(2)));

    // 2. Validate Payment splits match Total
    const totalPaid = paymentSplits.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - total_amount) > 0.05) {
      throw new Error(`Payments split (INR ${totalPaid.toFixed(2)}) must exactly equal Invoice total (INR ${total_amount.toFixed(2)})`);
    }

    // Determine billing status
    const creditPay = paymentSplits.find(p => p.payment_method === 'credit')?.amount || 0;
    let status: 'paid' | 'unpaid' | 'partially_paid' = 'paid';
    if (creditPay === total_amount) {
      status = 'unpaid';
    } else if (creditPay > 0) {
      status = 'partially_paid';
    }

    // 3. Create database invoice record
    const invoice = db.createInvoice({
      customer_id: selectedCustomer?.id,
      customer_name: selectedCustomer?.name,
      customer_phone: selectedCustomer?.phone,
      subtotal: Number(subtotal.toFixed(2)),
      discount_amount: cartDiscount,
      gst_amount: Number(gst_amount.toFixed(2)),
      total_amount,
      status,
      payments: paymentSplits,
      items,
    });

    // 4. Reload DB data and clear cart
    get().loadData();
    get().clearCart();

    return invoice;
  },

  // --- DB Operations ---
  loadData: () => {
    // Check local storage and load cached structures
    if (typeof window === 'undefined') return;

    // Load business
    const business = db.getBusiness();
    const categories = db.getCategories();
    const products = db.getProducts();
    const customers = db.getCustomers();
    const invoices = db.getInvoices();
    const printerSettings = db.getPrinterSettings();

    // Check theme
    const isDark = document.body.classList.contains('dark') || localStorage.getItem('bf_theme') === 'dark';
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }

    // Check color theme
    const savedColor = localStorage.getItem('bf_color_theme') as any;
    const themeColor = ['blue', 'green', 'violet', 'rose', 'orange'].includes(savedColor) ? savedColor : 'blue';
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    document.documentElement.classList.add(`theme-${themeColor}`);

    // Check session
    const savedUser = localStorage.getItem('bf_session');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    set({
      business,
      categories,
      products,
      customers,
      invoices,
      printerSettings,
      theme: isDark ? 'dark' : 'light',
      themeColor,
      currentUser,
    });
  },

  addCategory: (name) => {
    db.addCategory(name);
    get().loadData();
  },

  addProduct: (product) => {
    db.addProduct(product);
    get().loadData();
  },

  updateProduct: (id, updates) => {
    db.updateProduct(id, updates);
    get().loadData();
  },

  deleteProduct: (id) => {
    db.deleteProduct(id);
    get().loadData();
  },

  addCustomer: (customer) => {
    const newCust = db.addCustomer(customer);
    get().loadData();
    return newCust;
  },

  updateCustomer: (id, updates) => {
    db.updateCustomer(id, updates);
    get().loadData();
  },

  payCustomerCredit: (customerId, amount, notes) => {
    db.payCustomerCredit(customerId, amount, notes);
    get().loadData();
  },

  addExpense: (amount, category, notes) => {
    db.addExpense({ amount, category, notes });
    get().loadData();
  },

  updateBusiness: (updates) => {
    db.updateBusiness(updates);
    get().loadData();
  },

  updatePrinter: (updates) => {
    db.updatePrinterSettings(updates);
    get().loadData();
  },

  toggleTheme: () => {
    const { theme } = get();
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('bf_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bf_theme', 'light');
    }
    set({ theme: nextTheme });
  },

  setThemeColor: (color) => {
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    document.documentElement.classList.add(`theme-${color}`);
    localStorage.setItem('bf_color_theme', color);
    set({ themeColor: color });
  },

  // --- Auth Actions ---
  login: (email, role) => {
    const session = { email, role };
    localStorage.setItem('bf_session', JSON.stringify(session));
    set({ currentUser: session });
  },

  logout: () => {
    localStorage.removeItem('bf_session');
    set({ currentUser: null });
  }
}));
