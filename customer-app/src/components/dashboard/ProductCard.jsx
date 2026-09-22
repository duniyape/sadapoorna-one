import React from 'react';
import { Heart } from 'lucide-react';

const ProductCard = ({ id, name, subtitle, price, image, onAdd }) => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 group">
        <img src={image} alt={name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
        <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-[#17232D] text-sm leading-tight">{name}</h3>
        <p className="text-[#59636D] text-[11px] mt-0.5">{subtitle}</p>
        
        <div className="mt-3 flex items-center justify-between mt-auto">
          <span className="font-bold text-[#17232D] text-sm">{price}</span>
          <button 
            onClick={() => onAdd && onAdd({ id, name, subtitle, price })}
            className="border border-[#E52323] text-[#E52323] bg-white rounded-full px-4 py-1 text-xs font-semibold hover:bg-[#E52323] hover:text-white transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
