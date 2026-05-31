'use client';

import { useState, useEffect } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { Product } from '@/lib/db';
import {
  Package,
  Plus,
  PlusCircle,
  Search,
  AlertTriangle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  DollarSign,
  Tag,
  Percent,
  CheckCircle,
  X
} from 'lucide-react';

export default function InventoryPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    loadData
  } = useErpStore();

  // Reload cache
  useEffect(() => {
    loadData();
  }, [loadData]);

  // UI state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Form inputs variables
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [gstRate, setGstRate] = useState(18);
  const [stockQty, setStockQty] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');

  // Handle open Product form
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditProductId(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setBarcode('');
    setSku('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setGstRate(18);
    setStockQty(10);
    setLowStockThreshold(5);
    setBatchNo('');
    setExpiryDate('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setModalMode('edit');
    setEditProductId(p.id);
    setName(p.name);
    setCategoryId(p.category_id || '');
    setBarcode(p.barcode || '');
    setSku(p.sku || '');
    setPurchasePrice(p.purchase_price);
    setSellingPrice(p.selling_price);
    setGstRate(p.gst_rate);
    setStockQty(p.stock_qty);
    setLowStockThreshold(p.low_stock_threshold);
    setBatchNo(p.batch_no || '');
    setExpiryDate(p.expiry_date || '');
    setIsProductModalOpen(true);
  };

  // Submit Product handler
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return alert('Product name is required.');
    if (purchasePrice > sellingPrice) {
      if (!confirm('Warning: Purchase price is higher than Selling price. Click OK to proceed anyway.')) return;
    }

    const payload = {
      name,
      category_id: categoryId || undefined,
      barcode: barcode || undefined,
      sku: sku || undefined,
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      gst_rate: Number(gstRate),
      stock_qty: Number(stockQty),
      low_stock_threshold: Number(lowStockThreshold),
      batch_no: batchNo || undefined,
      expiry_date: expiryDate || undefined,
    };

    if (modalMode === 'add') {
      addProduct(payload);
    } else if (editProductId) {
      updateProduct(editProductId, payload);
    }

    setIsProductModalOpen(false);
  };

  // Submit Category handler
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
    
    // Auto sync category field selection
    setTimeout(() => {
      loadData();
    }, 100);
  };

  // Delete product handler
  const handleDeleteProduct = (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete "${prodName}" from inventory? This action is permanent.`)) {
      deleteProduct(id);
    }
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(searchQuery)) ||
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800/55 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs text-mutedtxt font-bold uppercase">Total Unique SKUs</p>
            <p className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">{products.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800/55 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-mutedtxt font-bold uppercase">Low Stock Alerts</p>
            <p className="text-2xl font-bold font-poppins text-warning">
              {products.filter(p => p.stock_qty <= p.low_stock_threshold).length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800/55 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-mutedtxt font-bold uppercase">Total Categories</p>
            <p className="text-2xl font-bold font-poppins text-accent">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
        
        {/* Search & Category Filter */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, code, barcode..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>
          
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="w-full sm:w-auto flex gap-3 justify-end">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <PlusCircle size={14} className="text-accent" />
            New Category
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 shadow-md shadow-primary/25 flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Stock SKU
          </button>
        </div>

      </div>

      {/* Table grid of records */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-bold font-poppins">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Sale Price</th>
                <th className="px-6 py-4 text-right">GST Rate</th>
                <th className="px-6 py-4 text-center">In-Stock Qty</th>
                <th className="px-6 py-4">Expiry / Lot</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-medium text-slate-700 dark:text-slate-200">
              {filteredProducts.map(p => {
                const catName = categories.find(c => c.id === p.category_id)?.name || 'Unassigned';
                const isLowStock = p.stock_qty <= p.low_stock_threshold;
                const isOutOfStock = p.stock_qty <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white font-poppins">{p.name}</p>
                        {p.barcode && <p className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{p.sku || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-500">{catName}</td>
                    <td className="px-6 py-4 text-right font-mono">₹{p.purchase_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-primary">₹{p.selling_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">{p.gst_rate}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        isOutOfStock
                          ? 'bg-error/15 text-error'
                          : isLowStock
                            ? 'bg-warning/15 text-warning'
                            : 'bg-success/15 text-success'
                      }`}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {p.expiry_date ? (
                          <p className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar size={10} />
                            {new Date(p.expiry_date).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400">No Expiry</p>
                        )}
                        {p.batch_no && (
                          <p className="text-[9px] font-mono text-slate-400">Lot: {p.batch_no}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Stock details"
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-error hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT FORM MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white">
                {modalMode === 'add' ? 'Add New Product to Stock' : 'Edit Product Inventory Details'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 rounded hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Product / Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Britannia Marie Gold Biscuit"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Stock Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">GST tax Bracket</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-semibold"
                  >
                    <option value={0}>0% (Tax Free / Exempt)</option>
                    <option value={5}>5% (Essential Goods)</option>
                    <option value={12}>12% (Standard Foods)</option>
                    <option value={18}>18% (Consumer Goods)</option>
                    <option value={28}>28% (Luxury Items)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Barcode Identifier (Optional)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan barcode number..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">SKU / Custom Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BIS-MARIE-250"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Purchase Price (₹ Cost)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Selling Price (₹ Retail)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Available Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Low Stock Trigger Threshold</label>
                  <input
                    type="number"
                    required
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Batch / Lot Number</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    placeholder="Lot ID or Batch number"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95"
                >
                  {modalMode === 'add' ? 'Save Product' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY FORM MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1">
                <PlusCircle size={15} className="text-primary" />
                Add New Category
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Beverages, Bakery"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
