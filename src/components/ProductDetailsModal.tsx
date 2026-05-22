import React, { useState, useEffect } from "react";
import { Product, Review } from "../types";
import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import { X, Star, Check, Send, ShoppingCart } from "lucide-react";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  allProductsList: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  allProductsList,
  onSelectProduct,
}: ProductDetailsModalProps) {
  const { language, addToCart, currentUser } = useThemeLanguage();
  const t = translations[language];

  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [qty, setQty] = useState(1);

  // Reviews states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    setActiveImage(product.images[0]);
    setQty(1);
    setSubmitMessage("");
    setNewComment("");
    setNewRating(5);
    fetchReviews();
  }, [product]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${product.id}`);
      if (response.ok) {
        const list = await response.json();
        setReviews(list);
      }
    } catch (err) {
      console.error("Failed to load reviews for product", err);
    }
  };

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSubmitMessage("Please sign in to write reviews!");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userEmail: currentUser.email,
          userName: currentUser.userName,
          rating: newRating,
          comment: newComment,
        }),
      });

      if (response.ok) {
        setSubmitMessage("Review submitted! Admin approval is required before displaying.");
        setNewComment("");
        setNewRating(5);
        fetchReviews(); // refresh
      } else {
        setSubmitMessage("Failed to submit review.");
      }
    } catch (err) {
      setSubmitMessage("Error connecting to server.");
    }
  };

  // Find related products (same category, different ID)
  const related = allProductsList
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full border border-slate-100 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 outline-none transition-transform active:scale-95 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Details Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left panel: Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <img
                src={activeImage || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600"}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-opacity focus:outline-none ${
                      activeImage === img
                        ? "border-indigo-600 scale-102"
                        : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" reffererPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: Details Card */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                {product.category}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-500 font-mono font-medium lowercase">
                Brand: {product.brand}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 leading-snug">
              {product.name}
            </h1>

            {/* Star Rating Overview */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      product.rating >= i + 1 ? "fill-current" : ""
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {product.rating}
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount} verified customers)
              </span>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 mb-5 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md">
                    Save Rs. {(product.price - currentPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Stock alert */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-400">Availability:</span>
              {product.stock > 0 ? (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t.inStock} ({product.stock} left)</span>
                </div>
              ) : (
                <span className="text-slate-400 font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg uppercase">
                  {t.outOfStock}
                </span>
              )}
            </div>

            {/* Qty & Add to Cart Action controls */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm h-11 shrink-0 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm select-none"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[20px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm select-none"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(product, qty);
                    onClose();
                  }}
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/35 hover:scale-101 duration-150 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>{t.addToCart}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab switcher: specifications, reviews */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6">
          <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 mb-5">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 text-sm font-bold tracking-wide transition-colors relative outline-none cursor-pointer ${
                activeTab === "specs"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.specifications}
              {activeTab === "specs" && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-bold tracking-wide transition-colors relative outline-none cursor-pointer ${
                activeTab === "reviews"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Verified Reviews ({reviews.length})
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          </div>

          <div className="min-h-[150px]">
            {activeTab === "specs" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(product.specs || {}).map((key) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 text-xs sm:text-sm"
                  >
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {key}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {product.specs[key]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Submit review */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col gap-3"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t.addReview}
                  </h4>
                  {submitMessage && (
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 py-1.5 px-3 rounded-lg w-max">
                      {submitMessage}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Rating:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setNewRating(i + 1)}
                          className="text-amber-400 hover:scale-110 active:scale-90 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              newRating >= i + 1 ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Share your feedback with future buyers of this gadget..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-slate-100 border-none rounded-xl text-xs sm:text-sm px-4 focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 duration-100"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                  {reviews.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-400 text-center py-6">
                      No verified reviews yet. Be the first to purchase and write!
                    </p>
                  ) : (
                    reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-900/40 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {r.userName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-500 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                r.rating >= i + 1 ? "fill-current" : ""
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                          {r.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products panel */}
        {related.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="font-extrabold text-sm sm:text-base mb-4 tracking-tight">
              {t.relatedProducts}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="rounded-xl border hover:shadow-md border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900 flex flex-col gap-1.5 cursor-pointer hover:scale-102 transition-all"
                >
                  <img
                    src={p.images[0]}
                    className="w-full aspect-square object-cover rounded-lg bg-slate-100"
                    reffererPolicy="no-referrer"
                  />
                  <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">
                    {p.name}
                  </h4>
                  <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                    Rs. {(p.discountPrice || p.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
