'use client';

import { useState, useEffect, useRef } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { Product, Customer } from '@/lib/db';
import PaymentModal from '@/components/billing/PaymentModal';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  Tag,
  Percent,
  ChevronRight,
  User,
  Sparkles,
  Camera,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export default function BillingPage() {
  const {
    products,
    categories,
    customers,
    cart,
    cartDiscount,
    selectedCustomer,
    addToCart,
    updateCartQty,
    removeFromCart,
    setCartDiscount,
    selectCustomer,
    addCustomer,
    loadData
  } = useErpStore();

  // Load initial caches
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Input states
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  // Name-Based Customer search states
  const [customerNameQuery, setCustomerNameQuery] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  
  // Mobile UI navigation tab
  const [activeMobileTab, setActiveMobileTab] = useState<'catalog' | 'cart'>('catalog');
  
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [isDiscountInputOpen, setIsDiscountInputOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState<number>(cartDiscount);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Camera scanner state
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('Position product barcode in front of the camera');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input for instant scan-gun workflows
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Barcode enter handler (mimics physical USB scanner entering keystroke + Enter)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    // Search by barcode field
    const matched = products.find(
      p => p.barcode === barcodeQuery.trim() || p.sku === barcodeQuery.trim()
    );

    if (matched) {
      addToCart(matched, 1);
      setBarcodeQuery('');
    } else {
      alert(`Barcode "${barcodeQuery}" not matched in catalog.`);
      setBarcodeQuery('');
    }
  };

  // Sync text input with store customer selection
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerNameQuery(selectedCustomer.name);
    } else {
      setCustomerNameQuery('');
    }
  }, [selectedCustomer]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowCustomerSuggestions(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Discount modifier
  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setCartDiscount(discountValue);
    setIsDiscountInputOpen(false);
  };

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchQuery)) ||
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Precise Cart calculations (inclusive tax)
  const subtotalInclusive = cart.reduce((sum, item) => sum + (item.product.selling_price * item.qty), 0);
  
  // Calculate raw GST element included inside selling rates
  const gstInclusiveTotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.selling_price * item.qty;
    const basePrice = itemTotal / (1 + item.product.gst_rate / 100);
    return sum + (itemTotal - basePrice);
  }, 0);

  const netPayable = Math.max(0, subtotalInclusive - cartDiscount);

  // Simulated Camera Scanner Trigger
  const handleCameraScanSimulate = (mockBarcode: string) => {
    setScanMessage('Scanning barcode...');
    setTimeout(() => {
      const matched = products.find(p => p.barcode === mockBarcode);
      if (matched) {
        addToCart(matched, 1);
        setScanMessage('Product added to cart!');
        setTimeout(() => {
          setIsCameraScannerOpen(false);
        }, 800);
      } else {
        setScanMessage('Barcode not found in catalog.');
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-100px)] relative">
      
      {/* Mobile Tab Toggle */}
      <div className="flex lg:hidden bg-slate-100 dark:bg-slate-950 p-1 rounded-xl gap-1 w-full no-print">
        <button
          type="button"
          onClick={() => setActiveMobileTab('catalog')}
          className={`flex-1 py-2.5 text-xs font-bold font-poppins rounded-xl transition-all ${
            activeMobileTab === 'catalog'
              ? 'bg-white dark:bg-slate-900 text-primary shadow-sm border border-slate-200/50 dark:border-slate-800/50'
              : 'text-slate-500'
          }`}
        >
          Catalog ({filteredProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('cart')}
          className={`flex-1 py-2.5 text-xs font-bold font-poppins rounded-xl transition-all relative ${
            activeMobileTab === 'cart'
              ? 'bg-white dark:bg-slate-900 text-primary shadow-sm border border-slate-200/50 dark:border-slate-800/50'
              : 'text-slate-500'
          }`}
        >
          Terminal Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
          {cart.length > 0 && (
            <span className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-error animate-pulse border-2 border-white dark:border-slate-900"></span>
          )}
        </button>
      </div>
      
      {/* LEFT PORTION: CATALOG & PRODUCT SEARCH (Flexible Width) */}
      <div className={`flex-1 flex flex-col min-w-0 h-[calc(100vh-180px)] lg:h-full space-y-4 ${activeMobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Scan & Search Control Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Real physical barcode parser entry */}
          <form onSubmit={handleBarcodeSubmit} className="sm:col-span-1 relative flex">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-3 text-primary" size={16} />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                placeholder="Scan Barcode / SKU"
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-xs outline-none font-semibold transition"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCameraScannerOpen(true);
                setScanMessage('Position product barcode in front of the camera');
              }}
              title="Open Device Camera Scanner"
              className="ml-1.5 p-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
            >
              <Camera size={16} />
            </button>
          </form>

          {/* Autocomplete Text Search */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, brand, barcode, or code..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-xs outline-none transition"
            />
          </div>
        </div>

        {/* Category horizontal scrolling tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-print">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-primary text-white shadow-md shadow-primary/10'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-center">
              <Search className="text-slate-300 mb-2" size={32} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-poppins">No items found</p>
              <p className="text-xs text-mutedtxt max-w-xs mt-1">
                Refine your query or map new inventory stocks from the Stock Management screen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map(p => {
                const isLowStock = p.stock_qty <= p.low_stock_threshold;
                const isOutOfStock = p.stock_qty <= 0;
                
                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p, 1)}
                    className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-[#444749]/60 p-4 rounded-2xl flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 hover:scale-[1.02] hover:-translate-y-0.5 select-none glass-shine-card ${
                      isOutOfStock 
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-950/20' 
                        : 'hover:border-secondary/50 dark:hover:border-secondary'
                    }`}
                  >
                    <div className="space-y-1">
                      {/* Stock indicator badge */}
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                            : isLowStock
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                        }`}>
                          {isOutOfStock ? 'OUT' : `Stock: ${p.stock_qty}`}
                        </span>
                        {p.batch_no && (
                          <span className="text-[9px] font-mono-tech text-slate-400">Lot:{p.batch_no}</span>
                        )}
                      </div>

                      <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 pt-1 font-sora group-hover:text-secondary transition-colors">
                        {p.name}
                      </h5>
                      {p.barcode && (
                        <p className="text-[9px] font-mono-tech text-slate-400">Barcode: {p.barcode}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-850">
                      <div>
                        <span className="text-[10px] text-mutedtxt">Price: </span>
                        <span className="font-mono-tech font-bold text-sm text-slate-800 dark:text-secondary">
                          ₹{p.selling_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-secondary group-hover:text-[#111827] flex items-center justify-center text-slate-400 transition-all duration-200 active:scale-90">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PORTION: CART WORKSPACE & CHECKOUT PANEL (Sticky Sidebar layout) */}
      <div className={`w-full lg:w-96 glass-panel rounded-2xl shadow-xl flex flex-col h-[calc(100vh-180px)] lg:h-full overflow-hidden ${activeMobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Customer Select Form */}
        <div 
          className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-primary" />
                Customer Account Name
              </label>
              {selectedCustomer && (
                <button
                  onClick={() => selectCustomer(null)}
                  className="text-[10px] font-bold text-red-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={customerNameQuery}
                onChange={(e) => {
                  setCustomerNameQuery(e.target.value);
                  setShowCustomerSuggestions(true);
                  if (selectedCustomer && e.target.value !== selectedCustomer.name) {
                    selectCustomer(null);
                  }
                }}
                onFocus={() => setShowCustomerSuggestions(true)}
                placeholder="Type customer name to search..."
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl text-xs outline-none transition"
              />

              {/* Suggestions Dropdown panel */}
              {showCustomerSuggestions && customerNameQuery && !selectedCustomer && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-850">
                  {customers
                    .filter(c => c.name.toLowerCase().includes(customerNameQuery.toLowerCase()))
                    .map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          selectCustomer(c);
                          setCustomerNameQuery(c.name);
                          setShowCustomerSuggestions(false);
                          setIsQuickAddCustomerOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">+91 {c.phone}</span>
                      </button>
                    ))}
                  {customers.filter(c => c.name.toLowerCase().includes(customerNameQuery.toLowerCase())).length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickAddCustomerOpen(true);
                        setShowCustomerSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-xs text-primary hover:bg-slate-50 dark:hover:bg-slate-800 font-bold flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      Register "{customerNameQuery}" as new customer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Linked customer profile card */}
            {selectedCustomer && (
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top duration-200">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 font-poppins">{selectedCustomer.name}</span>
                  <span className="text-primary font-mono text-[10px]">+91 {selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    Udhar Balance: <span className={selectedCustomer.credit_balance > 0 ? 'text-red-500 font-bold' : 'text-emerald-500'}>
                      ₹{selectedCustomer.credit_balance.toFixed(2)}
                    </span>
                  </span>
                  <span>Loyalty Pts: <span className="text-primary font-bold">{selectedCustomer.loyalty_points}</span></span>
                </div>
              </div>
            )}

            {/* Quick Register form */}
            {isQuickAddCustomerOpen && !selectedCustomer && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customerNameQuery.trim() || !newCustomerPhone.trim()) return;
                  const newCust = addCustomer({
                    name: customerNameQuery,
                    phone: newCustomerPhone,
                  });
                  selectCustomer(newCust);
                  setCustomerNameQuery(newCust.name);
                  setIsQuickAddCustomerOpen(false);
                  setNewCustomerPhone('');
                }}
                className="p-3 bg-warning/5 border border-warning/10 rounded-xl space-y-2 animate-in fade-in slide-in-from-top duration-200"
              >
                <p className="text-[10px] font-bold text-warning uppercase">Register New Customer</p>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    disabled
                    value={customerNameQuery}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none opacity-80"
                  />
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit phone number"
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-warning rounded-lg text-xs outline-none transition"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-warning text-white rounded-lg text-xs font-semibold hover:bg-warning/90"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Cart items list (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <PlusCircle size={28} className="text-slate-300 mb-1" />
              <p className="text-xs font-semibold">Terminal Cart Empty</p>
              <p className="text-[10px] text-mutedtxt">Scan items or tap catalog to begin</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl hover:border-slate-350 transition-all group"
              >
                {/* Details */}
                <div className="flex-1 min-w-0 pr-2">
                  <h6 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate font-poppins">
                    {item.product.name}
                  </h6>
                  <p className="text-[10px] text-mutedtxt pt-0.5">
                    ₹{item.product.selling_price.toFixed(2)} &bull; GST {item.product.gst_rate}%
                  </p>
                </div>

                {/* Quantities adjuster */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-500 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-xs font-bold w-6 text-center text-slate-800 dark:text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-500 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                  
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 rounded-xl text-slate-350 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ml-1 active:scale-90"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals panel */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 space-y-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Items Total:</span>
              <span>₹{subtotalInclusive.toFixed(2)}</span>
            </div>
            
            {/* Discount Panel */}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                Discount applied:
                <button
                  onClick={() => setIsDiscountInputOpen(!isDiscountInputOpen)}
                  className="p-0.5 rounded text-primary hover:bg-primary/10 transition"
                >
                  <Tag size={12} />
                </button>
              </span>
              <span className="font-semibold text-error">
                -₹{cartDiscount.toFixed(2)}
              </span>
            </div>

            {/* Discount Value Drawer Input */}
            {isDiscountInputOpen && (
              <form onSubmit={handleApplyDiscount} className="flex gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg animate-in slide-in-from-bottom duration-200">
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="Flat discount in ₹"
                  className="flex-1 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded text-xs outline-none"
                />
                <button type="submit" className="px-3 bg-primary text-white rounded text-xs font-semibold">
                  Apply
                </button>
              </form>
            )}

            <div className="flex justify-between text-slate-500 font-medium">
              <span>Included GST Tax:</span>
              <span>₹{gstInclusiveTotal.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>

            <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white">
              <span className="font-poppins">Net Total Amount:</span>
              <span className="font-mono text-primary text-lg">₹{netPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout trigger */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-3 bg-primary text-white text-xs font-poppins font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
          >
            Collect Payment
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* Camera Simulator Scanning Modal */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Camera size={16} />
                POS Camera Scanner
              </h3>
              <button
                onClick={() => setIsCameraScannerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Visual Viewport Box */}
            <div className="p-6 flex flex-col items-center gap-4 bg-slate-950">
              <div className="relative w-full aspect-video border-2 border-dashed border-primary rounded-xl flex items-center justify-center text-center overflow-hidden">
                {/* Scanner guide box */}
                <div className="absolute inset-x-8 top-6 bottom-6 border border-primary/40 rounded-lg flex items-center justify-center">
                  <div className="w-full h-0.5 bg-error animate-bounce"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">CAMERA ACTIVE</span>
              </div>
              <p className="text-[10px] text-slate-350 text-center font-medium font-mono">{scanMessage}</p>
            </div>

            {/* Mock scanning shortcuts */}
            <div className="p-4 border-t border-slate-150 dark:border-slate-850 space-y-2">
              <p className="text-[10px] font-bold text-mutedtxt uppercase">Simulate scanned products</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCameraScanSimulate('8901063013284')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-left px-3 text-[10px] rounded-lg truncate font-medium transition-colors"
                >
                  Marie Gold Biscuit
                </button>
                <button
                  onClick={() => handleCameraScanSimulate('8901725181228')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-left px-3 text-[10px] rounded-lg truncate font-medium transition-colors"
                >
                  Aashirvaad Atta 5kg
                </button>
                <button
                  onClick={() => handleCameraScanSimulate('8901396328639')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-left px-3 text-[10px] rounded-lg truncate font-medium transition-colors"
                >
                  Dettol Liquid Refill
                </button>
                <button
                  onClick={() => handleCameraScanSimulate('8901262010019')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-left px-3 text-[10px] rounded-lg truncate font-medium transition-colors"
                >
                  Amul Butter 100g
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified payment splits checker drawer modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={netPayable}
      />

      {/* Floating Action Button (FAB) for Quick Scanner */}
      <button
        onClick={() => {
          setIsCameraScannerOpen(true);
          setScanMessage('Position product barcode in front of the camera');
        }}
        title="Quick Scan Barcode"
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] hover:from-[#7c3aed] hover:to-[#0891b2] text-white flex items-center justify-center shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-110 active:scale-95 transition-all duration-200 group no-print"
      >
        <Camera size={24} className="group-hover:rotate-12 transition-transform duration-200" />
      </button>
    </div>
  );
}
