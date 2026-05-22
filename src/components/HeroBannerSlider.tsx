import { useState, useEffect } from "react";
import { Banner } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroBannerSliderProps {
  banners: Banner[];
  onSetCategory: (category: string) => void;
}

export default function HeroBannerSlider({ banners, onSetCategory }: HeroBannerSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const activeBanners = banners.filter((b) => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
  };

  const currentBanner = activeBanners[currentIdx];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group">
      {/* Slide Container */}
      <div className="relative h-[250px] sm:h-[350px] md:h-[420px] w-full transition-all duration-700 ease-in-out">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply transition-all duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent"></div>

        {/* Banner Content Card */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-xl text-white">
          <span className="inline-block px-3 py-1 mb-3 rounded-full bg-indigo-600 text-white font-semibold text-xs tracking-wide w-max animate-pulse">
            Promotional Offer
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-4 text-white uppercase sm:leading-tight">
            {currentBanner.title}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6 line-clamp-2">
            {currentBanner.subtitle}
          </p>
          <button
            onClick={() => onSetCategory(currentBanner.link)}
            className="w-max px-6 py-2.5 bg-white text-indigo-600 font-bold text-xs sm:text-sm rounded-xl cursor-pointer hover:bg-slate-100 uppercase tracking-widest hover:scale-105 active:scale-95 duration-200"
          >
            Explore Now
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white cursor-pointer hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white cursor-pointer hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIdx ? "bg-white w-6" : "bg-white/40"
              }`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
