import React, { useState, useRef, useEffect } from 'react';

const HeroBanner = () => {
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);

  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800&h=600",
      title: "Quality Products",
      subtitle: "for Growing",
      highlight: "Businesses",
      desc: "Wide Range | Trusted Supply | Wholesale Prices"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800&h=600",
      title: "Premium Spices",
      subtitle: "Fresh From",
      highlight: "The Farms",
      desc: "Pure & Authentic | Bulk Packaging Available"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800&h=600",
      title: "Finest Grains",
      subtitle: "Everyday",
      highlight: "Essentials",
      desc: "Best Wholesale Rates | Quality Guaranteed"
    }
  ];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const intervalId = setInterval(() => {
      // Check if we reached the end (with a small 10px threshold for rounding errors)
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const currentIndex = Math.round(scrollLeft / width);
    setActiveDot(currentIndex);
  };

  return (
    <div className="relative mt-4">
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-[180px] sm:h-[210px] rounded-[22px] shadow-sm border border-black/5"
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-full shrink-0 snap-center bg-[#e5d9c5] overflow-hidden">
            {/* Background Image Setup */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Red tinted gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAD2C9] via-[#FAD2C9]/85 to-black/50"></div>
            <div className="absolute inset-0 bg-[#E52323]/5"></div>

            {/* Content */}
            <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-center">
              <h2 className="text-[20px] sm:text-[24px] leading-tight font-bold text-[#17232D] max-w-[70%]">
                {banner.title}<br />{banner.subtitle}<br /><span className="text-[#E52323]">{banner.highlight}</span>
              </h2>
              
              <p className="text-[8px] sm:text-[10px] text-[#59636D] mt-1.5 font-medium tracking-wide">
                {banner.desc}
              </p>
              
              <button className="mt-3 sm:mt-4 bg-[#EF2026] text-white rounded-full px-4 py-1.5 font-semibold text-[10px] sm:text-xs w-max flex items-center gap-1.5">
                Shop Now <span className="text-sm leading-none">→</span>
              </button>
            </div>

            {/* Decorative Text */}
            <div className="absolute top-4 right-4 sm:right-6 text-right">
              <p className="font-serif italic text-xs sm:text-sm leading-tight text-[#17232D]/80">
                Har<br />Vyapar<br />Ke Saath
              </p>
              <div className="w-8 h-0.5 bg-[#E52323] ml-auto mt-1 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        {banners.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              activeDot === idx ? 'bg-[#E52323]' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
