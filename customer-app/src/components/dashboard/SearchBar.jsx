import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-100 h-[48px] sm:h-[52px] w-full">
      <div className="pl-3 pr-2">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#17232D]" strokeWidth={2.5} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products (e.g. rice, wheat, turmeric...)"
        className="flex-1 bg-transparent border-none outline-none text-[11px] sm:text-xs text-[#17232D] placeholder:text-gray-500 font-medium"
      />
      <button className="bg-gradient-to-r from-[#E52323] to-[#EF2026] text-white rounded-full px-4 sm:px-5 py-2 font-bold text-[11px] sm:text-xs w-[90px] sm:w-[110px] shrink-0 h-full shadow-[0_2px_8px_rgba(229,35,35,0.4)]">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
