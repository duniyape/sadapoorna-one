import React, { useState, useRef } from 'react';
import Header from '../components/dashboard/Header';
import SearchBar from '../components/dashboard/SearchBar';
import HeroBanner from '../components/dashboard/HeroBanner';
import CategorySection from '../components/dashboard/CategorySection';
import QuickActions from '../components/dashboard/QuickActions';
import WholesaleBanner from '../components/dashboard/WholesaleBanner';
import FeaturedProducts from '../components/dashboard/FeaturedProducts';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cxData } from '../data/dummyData';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState({});
  const productsRef = useRef(null);
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === 'More' ? '' : category);
    if (productsRef.current) {
      const yOffset = -80; // account for some header space
      const y = productsRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (productId, qty) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + parseInt(qty, 10)
    }));
  };

  const cartItemCount = Object.keys(cart).length;
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = cxData.catalog.find(p => p.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div 
      className={`min-h-screen px-4 sm:px-6 w-full max-w-md mx-auto relative overflow-x-hidden pt-2 ${cartItemCount > 0 ? 'pb-24' : ''}`}
      style={{
        background: `radial-gradient(
          circle at 50% 0%,
          rgba(229, 35, 35, 0.08) 0%,
          rgba(229, 35, 35, 0.04) 20%,
          rgba(229, 35, 35, 0) 45%
        ),
        radial-gradient(
          circle at 0% 45%,
          rgba(239, 32, 38, 0.02) 0%,
          rgba(239, 32, 38, 0) 35%
        ),
        radial-gradient(
          circle at 100% 70%,
          rgba(229, 35, 35, 0.02) 0%,
          rgba(229, 35, 35, 0) 35%
        ),
        #FFF9F7`
      }}
    >
      <Header cart={cart} />
      
      <div className="mt-4">
        <SearchBar />
      </div>
      
      <HeroBanner />
      
      <CategorySection onSelectCategory={handleCategorySelect} />
      
      <QuickActions />
      
      <WholesaleBanner />
      
      <div ref={productsRef}>
        <FeaturedProducts 
          selectedCategory={selectedCategory} 
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-[#E52323] text-white p-3 rounded-2xl shadow-[0_8px_30px_rgba(229,35,35,0.4)] flex items-center justify-between z-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-bold">{cartItemCount} Items</p>
                <p className="text-lg font-black">₹{cartTotal.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/cart', { state: { initialCart: cart } })}
              className="px-5 py-2.5 bg-white text-[#E52323] rounded-xl font-black text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              Go to Cart <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
