import React, { useRef } from 'react';
import CategoryItem from './CategoryItem';
import { Wheat, Bean, Soup, Milk, Flame, NutOff, Grid2X2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategorySection = ({ onSelectCategory }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const categories = [
    { name: 'Grains', icon: Wheat },
    { name: 'Pulses', icon: Bean },
    { name: 'Rice', icon: Soup }, // closest to bowl of rice
    { name: 'Edible Oils', icon: Milk }, // bottle-like
    { name: 'Spices', icon: Flame }, // chili-like representation
    { name: 'Dry Fruits', icon: NutOff },
    { name: 'More', icon: Grid2X2 },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleCategoryClick = (name) => {
    if (onSelectCategory) {
      onSelectCategory(name);
    } else {
      const searchParam = name === 'More' ? '' : name;
      navigate(`/create-order?search=${encodeURIComponent(searchParam)}`);
    }
  };

  return (
    <div className="mt-6 mb-6 relative group">
      
      {/* Scroll Left Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#17232D] hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-2 px-1 snap-x"
      >
        {categories.map((cat, idx) => (
          <div key={idx} className="snap-start shrink-0">
            <CategoryItem 
              name={cat.name} 
              icon={cat.icon} 
              onClick={() => handleCategoryClick(cat.name)}
            />
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#17232D] hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

    </div>
  );
};

export default CategorySection;
