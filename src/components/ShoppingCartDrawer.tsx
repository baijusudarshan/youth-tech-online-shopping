import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import { X, Trash2, Heart, ArrowRight, ShoppingBag } from "lucide-react";

interface ShoppingCartDrawerProps {
  onClose: () => void;
  onSetView: (view: string) => void;
}

export default function ShoppingCartDrawer({ onClose, onSetView }: ShoppingCartDrawerProps) {
  const {
    language,
    cart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist
  } = useThemeLanguage();

  const t = translations[language];

  const subtotal = cart.reduce((sum, item) => {
    const rate = item.discountPrice || item.price;
    return sum + rate * item.quantity;
  }, 0);

  const shipping = subtotal > 15000 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal + shipping;

  const handleSaveForLater = (productId: string, name: string) => {
    addToWishlist(productId);
    removeFromCart(productId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-350">
        
        {/* Draw Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-base sm:text-lg tracking-tight">Shopping Bag</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draw Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-3">
              <ShoppingBag className="w-16 h-16 text-slate-300 stroke-[1]" />
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Your bag is empty</p>
                <p className="text-xs mt-1">Looks like you haven't added any premium gadgets to your shopping cart yet.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onSetView("shop");
                }}
                className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Shop Electronics
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const rate = item.discountPrice || item.price;
              return (
                <div
                  key={item.productId}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-150 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/40 relative group"
                >
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 shrink-0"
                    reffererPolicy="no-referrer"
                  />

                  {/* Descriptions */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate pr-5">
                      {item.name}
                    </h4>
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Rs. {rate.toLocaleString()}
                    </span>

                    {/* Quantity selectors */}
                    <div className="flex items-center space-x-2 mt-2.5">
                      <div className="flex items-center border rounded-lg h-7 bg-white dark:bg-slate-900 dark:border-slate-700">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 hover:bg-slate-100 text-xs font-bold font-mono text-slate-600 dark:text-slate-300"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 hover:bg-slate-100 text-xs font-bold font-mono text-slate-600 dark:text-slate-300"
                        >
                          +
                        </button>
                      </div>

                      {/* Save for later */}
                      <button
                        onClick={() => handleSaveForLater(item.productId, item.name)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center space-x-0.5"
                        title="Save for Later"
                      >
                        <Heart className="w-3 h-3 fill-slate-100 dark:fill-slate-800" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </div>
                  </div>

                  {/* Remove buttons */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-rose-500 duration-150 focus:outline-none"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Pricing Subtotals Panel */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{t.subtotal}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{t.shipping}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {shipping === 0 ? "FREE" : `Rs. ${shipping}`}
              </span>
            </div>
            {subtotal < 15000 && (
              <p className="text-[10px] text-indigo-500 font-medium">
                Add Rs. {(15000 - subtotal).toLocaleString()} more to unlock **FREE delivery** anywhere in Nepal!
              </p>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800/85 my-1.5"></div>

            <div className="flex justify-between text-sm">
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {t.totalPrice}:
              </span>
              <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onSetView("checkout");
              }}
              className="w-full mt-2.5 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/35 flex items-center justify-center space-x-2 active:scale-98 transition-transform"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
