import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cxData } from '../data/dummyData';
import { ArrowLeft, CheckCircle2, AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCart = location.state?.initialCart || {};
  
  const [cart, setCart] = useState(initialCart);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = cxData.catalog.find(p => p.id === id);
    return { ...product, qty };
  }).filter(item => item && item.qty > 0);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  const isOverLimit = (cartTotal + cxData.financials.totalDue) > cxData.financials.creditLimit;

  const handleUpdateCart = (id, delta) => {
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

  const handleConfirmOrder = () => {
    setIsOrderPlaced(true);
    setCart({});
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in space-y-6 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-[#17232D] mb-2">Order Placed Successfully!</h2>
          <p className="text-[#59636D] font-medium">Your order has been forwarded to the distributor.</p>
        </div>
        <div className="flex gap-4 mt-8 w-full max-w-sm">
          <Link to="/dashboard" className="flex-1 py-3 bg-white border border-gray-200 text-[#17232D] font-bold rounded-xl hover:bg-gray-50 transition-colors">
            Back to Home
          </Link>
          <Link to="/profile/orders" className="flex-1 py-3 bg-[#E52323] text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto pb-24 pt-4 px-4 min-h-screen bg-[#FFF9F7]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#17232D]" />
        </button>
        <h1 className="text-xl font-bold text-[#17232D]">Your Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-[#17232D] mb-2">Your cart is empty</h2>
          <p className="text-[#59636D] text-sm mb-6">Looks like you haven't added any products yet.</p>
          <Link to="/dashboard" className="px-6 py-2.5 bg-[#E52323] text-white font-bold rounded-full">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {isOverLimit && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900">Credit Limit Warning</h4>
                <p className="text-xs text-rose-700 mt-1">
                  This order (₹{cartTotal.toLocaleString()}) plus your pending dues (₹{cxData.financials.totalDue.toLocaleString()}) exceeds your available credit limit of ₹{cxData.financials.creditLimit.toLocaleString()}.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#17232D] text-sm">{item.name}</h4>
                    <p className="text-[#59636D] text-[11px] mt-0.5">{item.variant}</p>
                    <div className="font-black text-[#E52323] text-sm mt-1">₹{item.price.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => handleUpdateCart(item.id, -item.qty)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => handleUpdateCart(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-[#17232D] font-bold">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-sm text-[#17232D] w-4 text-center">{item.qty}</span>
                      <button onClick={() => handleUpdateCart(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-[#17232D] font-bold">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <span className="font-bold text-[#59636D] text-sm">Order Total</span>
              <span className="text-2xl font-black text-[#17232D]">₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={handleConfirmOrder}
            className="w-full py-4 bg-[#E52323] hover:bg-red-700 text-white font-black rounded-xl shadow-[0_4px_12px_rgba(229,35,35,0.3)] transition-colors active:scale-[0.98]"
          >
            Confirm & Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
