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
  const [customerPhone, setCustomerPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
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

  // Customer Phone Lookup
  useEffect(() => {
    if (customerPhone.length === 10) {
      const match = customers.find(c => c.phone.trim() === customerPhone.trim());
      if (match) {
        selectCustomer(match);
        setIsQuickAddCustomerOpen(false);
      } else {
        setIsQuickAddCustomerOpen(true);
      }
    } else if (customerPhone.length === 0) {
      selectCustomer(null);
      setIsQuickAddCustomerOpen(false);
    }
  }, [customerPhone, customers, selectCustomer]);

  // Quick Add Customer handler
  const handleQuickAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !customerPhone.trim()) return;

    const newCust = addCustomer({
      name: newCustomerName,
      phone: customerPhone,
    });
    selectCustomer(newCust);
    setIsQuickAddCustomerOpen(false);
    setNewCustomerName('');
  };

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
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] relative">
      
      {/* LEFT PORTION: CATALOG & PRODUCT SEARCH (Flexible Width) */}
      <div className="flex-1 flex flex-col min-w-0 h-full space-y-4">
        
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
                    className={`glass-card p-4 rounded-xl flex flex-col justify-between cursor-pointer group transition-all select-none ${
                      isOutOfStock 
                        ? 'opacity-50 cursor-not-allowed bg-slate-100/50' 
                        : 'hover:border-primary/50 dark:hover:border-primary/50'
                    }`}
                  >
                    <div className="space-y-1">
                      {/* Stock indicator badge */}
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-error/15 text-error'
                            : isLowStock
                              ? 'bg-warning/15 text-warning'
                              : 'bg-success/15 text-success'
                        }`}>
                          {isOutOfStock ? 'OUT OF STOCK' : `Stock: ${p.stock_qty}`}
                        </span>
                        {p.batch_no && (
                          <span className="text-[9px] font-mono text-slate-400">Lot:{p.batch_no}</span>
                        )}
                      </div>

                      <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 pt-1 font-poppins group-hover:text-primary transition-colors">
                        {p.name}
                      </h5>
                      {p.barcode && (
                        <p className="text-[9px] font-mono text-slate-400">Barcode: {p.barcode}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-850">
                      <div>
                        <span className="text-[10px] text-mutedtxt">Price: </span>
                        <span className="font-poppins font-bold text-sm text-slate-800 dark:text-white">
                          ₹{p.selling_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                        <Plus size={14} />
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
      <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
        
        {/* Customer Select Form */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-primary" />
                Customer Account phone
              </label>
              {selectedCustomer && (
                <span className="text-[10px] font-bold text-success flex items-center gap-1">
                  <Sparkles size={10} /> Auto-Linked
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter customer 10-digit number..."
                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl text-xs outline-none transition"
              />
            </div>

            {/* If Customer Matches, show Details summary card */}
            {selectedCustomer && (
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top duration-200">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 font-poppins">{selectedCustomer.name}</span>
                  <span className="text-primary font-mono text-[10px]">+91 {selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    Udhar Credit: <span className={selectedCustomer.credit_balance > 0 ? 'text-error font-bold' : 'text-success'}>
                      ₹{selectedCustomer.credit_balance.toFixed(2)}
                    </span>
                  </span>
                  <span>Loyalty Pts: <span className="text-primary font-bold">{selectedCustomer.loyalty_points}</span></span>
                </div>
              </div>
            )}

            {/* Quick Add Customer Panel */}
            {isQuickAddCustomerOpen && (
              <form onSubmit={handleQuickAddCustomerSubmit} className="p-3 bg-warning/5 border border-warning/10 rounded-xl space-y-2 animate-in fade-in slide-in-from-top duration-200">
                <p className="text-[10px] font-bold text-warning uppercase">Customer Not Registered</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Enter Customer Name"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-warning rounded-lg text-xs outline-none transition"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-warning text-white rounded-lg text-xs font-semibold hover:bg-warning/90"
                  >
                    Quick Add
                  </button>
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
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-500 flex items-center justify-center"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono text-xs font-bold w-6 text-center text-slate-800 dark:text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-500 flex items-center justify-center"
                  >
                    <Plus size={12} />
                  </button>
                  
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-error hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                  >
                    <Trash2 size={13} />
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
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-left px-3 text-[10px] rounded-lg truncate font-medium"
                >
                  Marie Gold Biscuit
                </button>
                <button
                  onClick={() => handleCameraScanSimulate('8901725181228')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-left px-3 text-[10px] rounded-lg truncate font-medium"
                >
                  Aashirvaad Atta 5kg
                </button>
                <button
                  onClick={() => handleCameraScanSimulate('8901396328639')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-left px-3 text-[10px] rounded-lg truncate font-medium"
                >
                  Dettol Liquid Refill
                </button>
                <button
                  onClick={() => handleCameraScanSimulate('8901262010019')}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 text-left px-3 text-[10px] rounded-lg truncate font-medium"
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
    </div>
  );
}
