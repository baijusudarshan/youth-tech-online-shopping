import React from "react";
import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import { Product } from "../types";
import { Heart, Star, Eye, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  key?: any;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { language, addToCart, wishlist, addToWishlist, removeFromWishlist } = useThemeLanguage();
  const t = translations[language];

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const originalPrice = product.price;
  const currentPrice = product.discountPrice || product.price;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - (product.discountPrice || 0)) / originalPrice) * 100)
    : 0;

  const isWishlisted = wishlist.includes(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col w-full h-full glass-card-adaptive rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-lg hover:border-indigo-500/35 transition-all duration-300 overflow-hidden cursor-pointer border-t-2 border-t-indigo-600/50"
    >
      {/* Top badges and heart buttons */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
        <div className="flex flex-col gap-1.5 items-start">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-500 text-white shadow-sm flex items-center">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-white shadow-sm">
              Featured
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-slate-800 uppercase tracking-wider">
              {t.lowStock} ({product.stock})
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 border dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 uppercase">
              {t.outOfStock}
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={toggleWishlist}
          className={`p-1.5 rounded-full shadow-md backdrop-blur-md focus:outline-none transition-all active:scale-90 ${
            isWishlisted
              ? "bg-rose-500 text-white hover:bg-rose-600Scaler"
              : "bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white dark:bg-slate-800/80 dark:text-slate-300"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Image Gallery switcher */}
      <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Hover overlay quick actions */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-3 rounded-full bg-white text-slate-800 hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
            title={t.quickView}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Information Card */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Brand Metadata */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-bold">
            {product.category}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            {product.brand}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Ratings and reviews bar */}
        <div className="flex items-center space-x-1.5 mb-3">
          <div className="flex items-center bg-amber-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded text-amber-500 gap-0.5 font-bold text-xs">
            <span>{product.rating}</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            ({product.reviewsCount} {t.reviews})
          </span>
        </div>

        {/* Pricing & Add Cart Action Row */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Rs. {currentPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl cursor-pointer active:scale-95 transition-all outline-none ${
              product.stock === 0
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/10"
            }`}
            title={t.addToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
