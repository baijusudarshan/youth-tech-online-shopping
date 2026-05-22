import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import { Product } from "../types";
import { X, Heart, Trash2, ShoppingCart } from "lucide-react";

interface WishlistDrawerProps {
  onClose: () => void;
  allProducts: Product[];
  onOpenCart: () => void;
}

export default function WishlistDrawer({ onClose, allProducts, onOpenCart }: WishlistDrawerProps) {
  const { language, wishlist, removeFromWishlist, addToCart } = useThemeLanguage();
  const t = translations[language];

  // Map wishlist strings to actual products
  const wishlistItems = allProducts.filter((p) => wishlist.includes(p.id));

  const handleMoveToCart = (p: Product) => {
    addToCart(p, 1);
    removeFromWishlist(p.id);
    onClose();
    onOpenCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-350">
        
        {/* Wishlist Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-500 font-extrabold">
            <Heart className="w-5 h-5 fill-current" />
            <h2 className="text-base sm:text-lg tracking-tight">{t.wishlist}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {wishlistItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-3">
              <Heart className="w-16 h-16 text-slate-300 stroke-[1]" />
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Wishlist is empty</p>
                <p className="text-xs mt-1">Tap the heart icons while browsing our electronics product grid to save items here!</p>
              </div>
            </div>
          ) : (
            wishlistItems.map((p) => {
              const rate = p.discountPrice || p.price;
              return (
                <div
                  key={p.id}
                  className="flex gap-3 px-3 py-2.5 rounded-2xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-900/40 relative"
                >
                  {/* Thumbnail */}
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                    reffererPolicy="no-referrer"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col min-w-0 pr-5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                      {p.name}
                    </h3>
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Rs. {rate.toLocaleString()}
                    </span>

                    {/* Move to bag */}
                    <button
                      onClick={() => handleMoveToCart(p)}
                      disabled={p.stock === 0}
                      className="mt-2.5 w-max flex items-center space-x-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold rounded-lg text-[10px] duration-150"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>{p.stock === 0 ? "Out of Stock" : "Add to Bag"}</span>
                    </button>
                  </div>

                  {/* Remove Bin */}
                  <button
                    onClick={() => removeFromWishlist(p.id)}
                    className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 hover:text-rose-500 duration-150 outline-none"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
