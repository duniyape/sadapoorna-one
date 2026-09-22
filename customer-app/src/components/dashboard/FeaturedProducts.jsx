import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { cxData } from '../../data/dummyData';
import { X } from 'lucide-react';

const FeaturedProducts = ({ selectedCategory, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [toastMessage, setToastMessage] = useState('');

  let displayProducts = cxData.catalog;
  
  if (selectedCategory) {
    displayProducts = displayProducts.filter(p => 
      p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // Fallback to top 4 if no category or if category yields no results
  if (!selectedCategory || displayProducts.length === 0) {
    displayProducts = cxData.catalog.slice(0, 4);
  }

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setQuantity('1');
  };

  const handleConfirmAdd = () => {
    if (onAddToCart && selectedProduct && quantity && parseInt(quantity) > 0) {
      onAddToCart(selectedProduct.id, parseInt(quantity));
      
      setToastMessage(`${selectedProduct.name} added to cart!`);
      setTimeout(() => setToastMessage(''), 3000);
    }
    setSelectedProduct(null);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#17232D] font-bold text-lg">
          {selectedCategory && displayProducts.length > 0 
            ? `${selectedCategory} Products` 
            : 'Featured Products'}
        </h2>
        <button className="text-[#E52323] text-sm font-semibold flex items-center gap-1">
          View All <span>→</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {displayProducts.map((product, idx) => (
          <ProductCard 
            key={idx} 
            id={product.id}
            name={product.name}
            subtitle={product.variant}
            price={`₹ ${product.price} / ${product.variant.split(' ')[0] || 'Unit'}`}
            image={product.image}
            onAdd={handleOpenModal}
          />
        ))}
      </div>

      {/* Quantity Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-[280px] overflow-hidden shadow-2xl scale-100 transition-transform">
            <div className="flex justify-between items-center p-3 border-b border-gray-100">
              <h3 className="font-bold text-[#17232D] text-sm">Add Quantity</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                  <img src={selectedProduct.image || cxData.catalog.find(c => c.id === selectedProduct.id)?.image} alt={selectedProduct.name} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div>
                  <h4 className="font-bold text-[#17232D] text-[13px] leading-tight">{selectedProduct.name}</h4>
                  <p className="text-[#59636D] text-[10px] mt-0.5">{selectedProduct.subtitle}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[#17232D] text-sm font-bold outline-none focus:border-[#E52323] focus:ring-1 focus:ring-[#E52323] transition-all bg-gray-50 focus:bg-white"
                    placeholder="Qty"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">
                    {selectedProduct.subtitle.split(' ')[0]}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleConfirmAdd}
                className="w-full bg-[#E52323] hover:bg-red-700 text-white font-bold py-2.5 rounded-lg shadow-sm text-sm transition-all active:scale-[0.98]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
