import React, { useState } from 'react';
import { cxData } from '../data/dummyData';
import { ShoppingCart, Plus, Minus, Search, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const CreateOrder = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialSearch = query.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [cart, setCart] = useState({});
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const filteredCatalog = cxData.catalog.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) || 
      item.variant.toLowerCase().includes(term) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  });

  const handleUpdateCart = (id, delta) => {
    const product = cxData.catalog.find(p => p.id === id);
    if (delta > 0 && !product.inStock) return; // Prevent adding out of stock items

    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = cxData.catalog.find(p => p.id === id);
    return total + (item.price * qty);
  }, 0);

  const handleCheckoutClick = () => {
    setShowSummary(true);
  };

  const handleConfirmOrder = () => {
    setIsOrderPlaced(true);
    setShowSummary(false);
    setCart({});
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-slate-500 font-medium">Your order has been forwarded to the distributor.</p>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setIsOrderPlaced(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Continue Shopping
          </button>
          <Link to="/profile/orders" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const isOverLimit = (cartTotal + cxData.financials.totalDue) > cxData.financials.creditLimit;
    
    return (
      <div className="animate-fade-in max-w-2xl mx-auto pb-24 pt-4 px-4">
        <button onClick={() => setShowSummary(false)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-6">Checkout Summary</h1>

        {isOverLimit && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900">Credit Limit Warning</h4>
              <p className="text-sm text-rose-700 mt-1">
                This order (₹{cartTotal.toLocaleString()}) plus your pending dues (₹{cxData.financials.totalDue.toLocaleString()}) exceeds your available credit limit of ₹{cxData.financials.creditLimit.toLocaleString()}.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-900">Order Items</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(cart).map(([id, qty]) => {
              const item = cxData.catalog.find(p => p.id === id);
              return (
                <div key={id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.variant} • ₹{item.price.toLocaleString()} x {qty}</p>
                  </div>
                  <div className="font-black text-slate-900">
                    ₹{(item.price * qty).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-sm">Grand Total</span>
            <span className="text-2xl font-black text-emerald-600">₹{cartTotal.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={handleConfirmOrder}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200 transition-colors"
        >
          Confirm & Place Order
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Grocery & Staples</h1>
          <p className="text-gray-400 font-medium text-xs">{filteredCatalog.length} products</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {filteredCatalog.map(product => {
          const qty = cart[product.id] || 0;
          return (
            <div key={product.id} className="bg-white rounded-xl p-3 border border-gray-100 flex flex-col group hover:shadow-lg transition-shadow relative overflow-hidden">
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider -rotate-12 border border-rose-200 shadow-sm">Out of Stock</span>
                </div>
              )}
              
              <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden relative">
                {product.inStock && (
                  <span className="absolute top-2 left-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded z-10">In Stock</span>
                )}
                <img src={product.image} alt={product.name} className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-500 ${product.inStock ? 'group-hover:scale-105' : 'grayscale'}`} />
              </div>
              <div className="flex-1 flex flex-col relative z-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.variant}</p>
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-3">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <div className="font-black text-gray-900 text-lg">₹{product.price.toLocaleString()}</div>
                  
                  {qty === 0 ? (
                    <button 
                      onClick={() => handleUpdateCart(product.id, 1)}
                      disabled={!product.inStock}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${
                        product.inStock ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add <Plus className="w-3 h-3" />
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-600 text-white rounded-lg p-1 w-20">
                      <button onClick={() => handleUpdateCart(product.id, -1)} className="w-6 h-6 flex items-center justify-center font-black">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-sm">{qty}</span>
                      <button onClick={() => handleUpdateCart(product.id, 1)} className="w-6 h-6 flex items-center justify-center font-black">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Bar - Minimalist */}
      <AnimatePresence>
        {Object.keys(cart).length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[76px] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-emerald-600 text-white p-3 rounded-2xl shadow-[0_8px_30px_rgba(5,150,105,0.4)] flex items-center justify-between z-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-bold">{Object.keys(cart).length} Items</p>
                <p className="text-lg font-black">₹{cartTotal.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={handleCheckoutClick}
              className="px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-black text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              Checkout <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateOrder;
