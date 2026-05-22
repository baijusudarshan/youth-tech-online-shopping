import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroBannerSlider from "./components/HeroBannerSlider";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import ShoppingCartDrawer from "./components/ShoppingCartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import CheckoutForm from "./components/CheckoutForm";
import AdminDashboardView from "./components/AdminDashboardView";
import UserDashboardView from "./components/UserDashboardView";
import LiveChatWidget from "./components/LiveChatWidget";
import { FAQPage, ReturnPolicyPage, PrivacyPolicyPage, ContactPage } from "./components/InformationPages";
import { ThemeLanguageProvider, useThemeLanguage, translations } from "./components/ThemeLanguageContext";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { Product, Banner } from "./types";
import {
  Laptop,
  Smartphone,
  Headphones,
  Clock,
  Shield,
  Truck,
  Flame,
  Award,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  UserCheck,
  Building,
  KeyRound,
  X
} from "lucide-react";

function AppContent() {
  const {
    language,
    theme,
    currentUser,
    login,
    register,
    logout,
    cart,
    wishlist,
    addToCart
  } = useThemeLanguage();

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const t = translations[language];

  // Routing Views: 'home' | 'shop' | 'checkout' | 'user' | 'admin' | 'faq' | 'returns' | 'privacy' | 'contact'
  const [activeView, setActiveView] = useState<string>("home");

  // Selected single item details
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(400000);
  const [sortOrder, setSortOrder] = useState("latest");

  // Drawers states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Authentication submodes: 'login' | 'register' | 'forgot' | 'verified'
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "verified">("login");
  const [selectedRole, setSelectedRole] = useState<"customer" | "admin">("customer");
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", pass: "" });

  // Promotional banners state
  const [banners, setBanners] = useState<Banner[]>([]);

  // Email Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Pull products and active banners directly from API
  const refreshStoreData = async () => {
    try {
      // 1. Get products
      const pRes = await fetch("/api/products");
      if (pRes.ok) {
        const prodData = await pRes.json();
        setAllProducts(prodData);
      }

      // 2. Get active banners
      const bRes = await fetch("/api/banners");
      if (bRes.ok) {
        const banData = await bRes.json();
        setBanners(banData.filter((b: Banner) => b.active));
      }
    } catch (err) {
      console.error("Failed to sync client state catalog details", err);
    }
  };

  useEffect(() => {
    refreshStoreData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveView("shop");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveView("shop");
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  // Auth Handler triggers
  const executeAuthFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");

    if (authMode === "login") {
      try {
        // Enforce role authorization lookup
        const profileRes = await fetch("/api/auth/profile?email=" + encodeURIComponent(authForm.email));
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (selectedRole === "admin" && profileData.role !== "admin") {
            setAuthError("This email address is not registered with an Administrator profile. If you are a customer, please select 'Customer Account' to proceed.");
            return;
          }
          if (selectedRole === "customer" && profileData.role === "admin") {
            setAuthError("This email is registered with an Administrator profile. Please select 'Administrator Profile' sign-in option.");
            return;
          }
        } else if (selectedRole === "admin") {
          // If profile doesn't exist yet but user wants to try anyway, check if they are seeded admin.
          // In case of error let auth proceed but notify if they are trying to log in as admin.
          if (authForm.email !== "admin@youthtech.com" && authForm.email !== "baijusudarshan@gmail.com") {
            setAuthError("This email address is not registered with an Administrator profile.");
            return;
          }
        }

        await signInWithEmailAndPassword(auth, authForm.email, authForm.pass);
        setShowAuthModal(false);
        setAuthForm({ name: "", email: "", pass: "" });
      } catch (err: any) {
        console.error("Firebase Auth sign-in failed", err);
        let errorMsg = "Login credentials failed";
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          errorMsg = "Invalid email or matching password credentials.";
        } else if (err.code === "auth/invalid-email") {
          errorMsg = "Please provide a valid email address.";
        } else {
          errorMsg = err.message || errorMsg;
        }
        setAuthError(errorMsg);
      }
    } else if (authMode === "register") {
      try {
        // Pass selected register role
        localStorage.setItem("pending_role", selectedRole);
        const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.pass);
        if (authForm.name) {
          await updateProfile(userCredential.user, { displayName: authForm.name });
        }
        setAuthSuccessMsg(`Account profile initiated! Your Firebase credentials were created successfully as ${selectedRole === "admin" ? "an Administrator" : "a Customer"}.`);
        setAuthMode("verified");
      } catch (err: any) {
        console.error("Firebase Auth sign-up failed", err);
        let errorMsg = "Registration error";
        if (err.code === "auth/email-already-in-use") {
          errorMsg = "This email is already in use by another account.";
        } else if (err.code === "auth/weak-password") {
          errorMsg = "Password is too weak. Must be at least 6 characters.";
        } else if (err.code === "auth/invalid-email") {
          errorMsg = "Invalid email address format.";
        } else {
          errorMsg = err.message || errorMsg;
        }
        setAuthError(errorMsg);
      }
    } else if (authMode === "forgot") {
      try {
        await sendPasswordResetEmail(auth, authForm.email);
        setAuthSuccessMsg(`A password reset authorization mail has been sent via Firebase to ${authForm.email}.`);
      } catch (err: any) {
        console.error("Firebase Reset email error", err);
        setAuthError(err.message || "Failed to trigger password reset email.");
      }
    } else if (authMode === "verified") {
      setShowAuthModal(false);
      setAuthForm({ name: "", email: "", pass: "" });
    }
  };

  const executeGoogleLogin = async () => {
    setAuthError("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      localStorage.setItem("pending_role", selectedRole);
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setShowAuthModal(false);
      }
    } catch (err: any) {
      console.error("Google Sign-In failed", err);
      if (err.code === "auth/popup-closed-by-user") {
        setAuthError("Google authentication popup closed before completing. Please try again.");
      } else {
        setAuthError(err.message || "Failed to sign in using Google.");
      }
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  // Split products categories lists for home blocks
  const featuredList = allProducts.filter((p) => p.isFeatured);
  const newArrivalsList = allProducts.filter((p) => p.isNewArrival);
  const bestSellersList = allProducts.filter((p) => p.isBestSeller);

  // Categories grid lookup
  const categoriesGrid = [
    { name: "Laptops", icon: Laptop, count: allProducts.filter(p => p.category === "Laptops").length, bg: "from-blue-500 to-cyan-500" },
    { name: "Smartphones", icon: Smartphone, count: allProducts.filter(p => p.category === "Smartphones").length, bg: "from-purple-500 to-indigo-500" },
    { name: "Audio", icon: Headphones, count: allProducts.filter(p => p.category === "Audio").length, bg: "from-rose-500 to-pink-500" }
  ];

  // Filtering list for main catalog shop
  const filteredProducts = allProducts.filter((p) => {
    const rate = p.discountPrice || p.price;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesBrand = selectedBrand ? p.brand.toLowerCase() === selectedBrand.toLowerCase() : true;
    const matchesPrice = rate >= minPrice && rate <= maxPrice;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    const rateA = a.discountPrice || a.price;
    const rateB = b.discountPrice || b.price;

    if (sortOrder === "low-to-high") return rateA - rateB;
    if (sortOrder === "high-to-low") return rateB - rateA;
    if (sortOrder === "rating") return b.rating - a.rating;
    return b.id.localeCompare(a.id); // 'latest'
  });

  return (
    <div className={`min-h-screen font-sans duration-200 flex flex-col ${theme === "dark" ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-800"}`}>
      
      {/* 1. Header Navigation Bar */}
      <Navbar
        onSearch={handleSearch}
        activeView={activeView}
        onSetView={(v) => {
          setActiveView(v);
          setSearchQuery(""); // clear searches on normal clicks
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onTriggerAuth={() => {
          setAuthMode("login");
          setAuthError("");
          setAuthSuccessMsg("");
          setShowAuthModal(true);
        }}
      />

      {/* 2. Primary Views Router Panel */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
        
        {/* VIEW: HOME */}
        {activeView === "home" && (
          <div className="flex flex-col gap-12 animate-in fade-in duration-200">
            {/* Promo slider */}
            <HeroBannerSlider banners={banners} onSetCategory={handleCategorySelect} />

            {/* Electronic Categories cards */}
            <section className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Department grid</span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Shop by Core categories</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {categoriesGrid.map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="p-5 rounded-3xl cursor-pointer bg-white border border-slate-200 hover:border-slate-300 relative overflow-hidden group shadow-sm dark:bg-slate-900 dark:border-slate-800"
                  >
                    {/* Visual gradient orb */}
                    <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-15 bg-gradient-to-tr ${cat.bg}`}></div>
                    
                    <cat.icon className="w-8 h-8 text-indigo-600 mb-2.5 duration-200 group-hover:scale-105" />
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base leading-tight text-slate-850 dark:text-slate-100">{cat.name}</h4>
                      <span className="text-[11px] text-slate-400 mt-1 block">{cat.count} Premium gadgets</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Devices */}
            {featuredList.length > 0 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center space-x-2.5">
                  <Flame className="w-5 h-5 text-indigo-600 fill-current" />
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{t.featuredProducts}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredList.map((p) => (
                    <ProductCard key={p.id} product={p} onQuickView={handleProductSelect} />
                  ))}
                </div>
              </section>
            )}

            {/* New Arrivals */}
            {newArrivalsList.length > 0 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-600 fill-current animate-spin [animation-duration:10s]" />
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{t.newArrivals}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {newArrivalsList.map((p) => (
                    <ProductCard key={p.id} product={p} onQuickView={handleProductSelect} />
                  ))}
                </div>
              </section>
            )}

            {/* Customer Trust Review Slider banner */}
            <section className="p-6 sm:p-8 rounded-3xl border border-slate-205 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm md:flex gap-8 items-center">
              <div className="max-w-xs mb-4 md:mb-0">
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-600">Client validation</span>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mt-1.5 dark:text-white leading-tight">Authentic reviews from verified buyers</h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-normal">Youth Tech values original purchase feedback. Every comment is validated against real database order numbers.</p>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/50 border dark:bg-slate-950/20 dark:border-slate-800 leading-normal">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-xs">Arun K. • Kathmandu</span>
                    <span className="text-indigo-600 font-extrabold text-xs">★★★★★</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">"The Ultimate Pro Laptop is a game-changer! Super fluid for compilation. Ordered with eSewa and got flat delivery within 4 hours in Kupondole!"</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/50 border dark:bg-slate-950/20 dark:border-slate-800 leading-normal">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-xs">Sujata S. • Pokhara</span>
                    <span className="text-indigo-600 font-extrabold text-xs">★★★★★</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">"Phenomenal battery on the Nebula Smartphone. The ANC headphones also isolate sound completely. Highly recommend Youth Tech for premium gadgets!"</p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW: CATALOG SHOP */}
        {activeView === "shop" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-in fade-in duration-200">
            {/* Filter side block */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col gap-6">
              
              {/* Category Filter */}
              <div className="flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Filter Category</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] outline-none cursor-pointer border ${
                      selectedCategory === ""
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700"
                    }`}
                  >
                    All Categories
                  </button>
                  {Array.from(new Set(allProducts.map(p => p.category))).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] outline-none cursor-pointer border ${
                        selectedCategory === cat
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Selection */}
              <div className="flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Select Brand</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="h-9 px-3.5 rounded-xl bg-slate-50 border focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-700 text-xs text-slate-650"
                >
                  <option value="">All Brands</option>
                  {Array.from(new Set(allProducts.map(p => p.brand))).map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Cap selector */}
              <div className="flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Price Limit (NPR)</span>
                  <strong className="text-indigo-600 dark:text-indigo-400">Rs. {maxPrice.toLocaleString()}</strong>
                </span>
                <input
                  type="range"
                  min="3000"
                  max="350000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 mt-2 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                />
              </div>

              {/* Sort Order */}
              <div className="flex flex-col gap-2 text-xs">
                <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Sort List</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="h-9 px-3.5 rounded-xl bg-slate-50 border focus:outline-none dark:bg-slate-800 dark:border-slate-700 text-xs text-slate-650"
                >
                  <option value="latest">New Arrivals first</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="rating">Customer Ratings</option>
                </select>
              </div>

            </div>

            {/* Product catalog column */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Info text bar */}
              <div className="flex justify-between items-center text-xs text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                <span>Displaying <strong className="font-black text-indigo-650 dark:text-indigo-450">{filteredProducts.length}</strong> premium gadgets</span>
                {searchQuery && (
                  <span>Filtering for "<strong>{searchQuery}</strong>"</span>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800">
                  No products match your custom filter rules. Try pulling the slider to its maximum limit.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onQuickView={handleProductSelect} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW: CHECKOUT WIZARD */}
        {activeView === "checkout" && (
          <CheckoutForm
            onBackToHome={() => setActiveView("home")}
            onOrderPlaced={refreshStoreData}
          />
        )}

        {/* VIEW: ADMIN CONSOLE */}
        {activeView === "admin" && (
          <AdminDashboardView
            onClose={() => setActiveView("home")}
            allProducts={allProducts}
            onRefreshData={refreshStoreData}
          />
        )}

        {/* VIEW: USER PROFILE */}
        {activeView === "user" && <UserDashboardView />}

        {/* VIEW: FAQ */}
        {activeView === "faq" && <FAQPage />}

        {/* VIEW: RETURNS */}
        {activeView === "returns" && <ReturnPolicyPage />}

        {/* VIEW: PRIVACY */}
        {activeView === "privacy" && <PrivacyPolicyPage />}

        {/* VIEW: CONTACT */}
        {activeView === "contact" && <ContactPage />}

      </main>

      {/* 3. Global Footer block */}
      <footer className="border-t bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 leading-relaxed">
          
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Youth Tech Online Shopping</h4>
            <p>Premium specialized gadgets catalog in Kathmandu, Nepal. We prioritize authentic hardware, fast deliveries, and customer-first support channels.</p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Legal Terms</h4>
            <button onClick={() => setActiveView("privacy")} className="text-left hover:text-indigo-600">Privacy Policy</button>
            <button onClick={() => setActiveView("returns")} className="text-left hover:text-indigo-600">Refund & Defective replacement policy</button>
            <button onClick={() => setActiveView("faq")} className="text-left hover:text-indigo-600">FAQs</button>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Outlets Contacts</h4>
            <button onClick={() => setActiveView("contact")} className="text-left hover:text-indigo-600">Contact Support form</button>
            <span>Kupondole, Kathmandu Valley | Phone: +977-1-4433221</span>
          </div>

          {/* Newsletter subscription form */}
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Join the Newsletter</h4>
            <p className="text-[11px]">Receive monthly discount coupon codes and hardware restock alerts instantly!</p>
            {newsletterSubscribed ? (
              <span className="text-[10px] text-green-700 bg-green-50/70 p-2 rounded-xl border border-green-100 block font-bold">Thank you! Subscribed successfully.</span>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border focus:outline-none dark:border-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-650 text-white rounded-lg text-xs font-bold font-mono bg-indigo-600"
                >
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-slate-850 py-6 text-center text-[10px] text-slate-400 font-medium">
          © 2026 Youth Tech Online Shopping (Pvt Ltd). Kathmandu, Nepal. Registered and Secured.
        </div>
      </footer>

      {/* 4. Drawers & Modals Overlay */}
      {isCartOpen && (
        <ShoppingCartDrawer
          onClose={() => setIsCartOpen(false)}
          onSetView={(v) => {
            setActiveView(v);
            setIsCartOpen(false);
          }}
        />
      )}

      {isWishlistOpen && (
        <WishlistDrawer
          onClose={() => setIsWishlistOpen(false)}
          allProducts={allProducts}
          onOpenCart={() => {
            setIsWishlistOpen(false);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* AUTH OAUTH AND EMAIL LOGIN REGISTER MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col gap-5 animate-in zoom-in-95 relative leading-normal">
            
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-655"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                {authMode === "login" && "Login to Account"}
                {authMode === "register" && "Create New Account"}
                {authMode === "forgot" && "Reset Password Code"}
                {authMode === "verified" && "Security Verification"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Unlock digital ledger checkouts and tracking dashboards</p>
            </div>

            {authError && (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-center block leading-normal">
                {authError}
              </span>
            )}

            {authSuccessMsg && (
              <span className="text-xs font-bold text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-100 text-center block leading-normal">
                {authSuccessMsg}
              </span>
            )}

            <form onSubmit={executeAuthFormSubmit} className="flex flex-col gap-4 text-xs font-medium text-slate-705">
              
              {/* Account Role Selector Options (Two Sign-in options: Admin / Customer) */}
              {(authMode === "login" || authMode === "register") && (
                <div className="flex flex-col gap-1.5 mb-1 bg-slate-50 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold block mb-1 px-1">Sign In Option / Persona</span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("customer")}
                      className={`py-2 text-[11px] font-bold rounded-xl transition-all duration-250 cursor-pointer ${
                        selectedRole === "customer"
                          ? "bg-indigo-650 dark:bg-blue-600 text-white shadow-md shadow-indigo-600/10 dark:shadow-blue-600/15 animate-none"
                          : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-zinc-100 border border-slate-200 dark:border-white/5"
                      }`}
                    >
                      Customer Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`py-2 text-[11px] font-bold rounded-xl transition-all duration-250 cursor-pointer ${
                        selectedRole === "admin"
                          ? "bg-indigo-650 dark:bg-blue-600 text-white shadow-md shadow-indigo-600/10 dark:shadow-blue-600/15 animate-none"
                          : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-zinc-100 border border-slate-200 dark:border-white/5"
                      }`}
                    >
                      Store Admin Role
                    </button>
                  </div>
                </div>
              )}

              {authMode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <label>Full Representative Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="h-10 px-4 rounded-xl border"
                  />
                </div>
              )}

              {authMode !== "verified" && (
                <div className="flex flex-col gap-1.5">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="h-10 px-4 rounded-xl border"
                  />
                </div>
              )}

              {(authMode === "login" || authMode === "register" || authMode === "verified") && (
                <div className="flex flex-col gap-1.5">
                  <label>Account Password</label>
                  <input
                    type="password"
                    required
                    value={authForm.pass}
                    onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })}
                    className="h-10 px-4 rounded-xl border"
                  />
                </div>
              )}

              {authMode === "verified" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-center font-bold text-slate-400 uppercase">Verification Digits Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1234"
                    className="h-10 px-4 rounded-xl border text-center font-bold text-lg tracking-widest"
                  />
                </div>
              )}

              {authMode === "login" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-right text-[10px] hover:text-indigo-600 font-bold"
                >
                  Forgot Password?
                </button>
              )}

              <button
                type="submit"
                className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase shadow-md active:scale-98 transition mt-2 cursor-pointer"
              >
                {authMode === "login" && "Authorize Sign In"}
                {authMode === "register" && "Initiate Registration"}
                {authMode === "forgot" && "Send Password Reset Link"}
                {authMode === "verified" && "Confirm verification"}
              </button>

            </form>

            {/* Google Identity Providers block */}
            {(authMode === "login" || authMode === "register") && (
              <div className="flex flex-col gap-4 border-t pt-4 mt-1 border-slate-100 dark:border-slate-800">
                <button
                  onClick={executeGoogleLogin}
                  className="h-11 w-full border border-slate-200 hover:bg-slate-50 dark:border-slate-800/80 rounded-xl text-xs font-bold tracking-wide cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.73 14.92 1 12 1 7.35 1 3.39 3.65 1.39 7.5l3.81 2.95C6.12 7.23 8.84 5.04 12 5.04z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.87 3.75-8.49z"/><path fill="#FBBC05" d="M5.2 14.45c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 6.9c-.83 1.66-1.3 3.52-1.3 5.5s.47 3.84 1.3 5.5l3.81-2.95z"/><path fill="#34A853" d="M12 18.96c-3.16 0-5.88-2.19-6.8-5.41L1.39 16.5c2 3.85 5.96 6.5 10.61 6.5 2.92 0 5.61-.98 7.55-2.67l-3.66-2.84c-1.04.7-2.38 1.47-3.89 1.47z"/></svg>
                  <span>Continue with Google</span>
                </button>

                <div className="text-center text-[10px] text-slate-400">
                  {authMode === "login" ? (
                    <span>Don't have an account? <button onClick={() => setAuthMode("register")} className="font-bold text-indigo-600 hover:underline">Register Now</button></span>
                  ) : (
                    <span>Already have an account? <button onClick={() => setAuthMode("login")} className="font-bold text-indigo-600 hover:underline">Sign In</button></span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* RENDER DETAILED ITEM MODAL SPECIFICATIONS */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          allProductsList={allProducts}
          onSelectProduct={handleProductSelect}
        />
      )}

      {/* FLOAT ASSISTANT */}
      <LiveChatWidget />

    </div>
  );
}

export default function App() {
  return (
    <ThemeLanguageProvider>
      <AppContent />
    </ThemeLanguageProvider>
  );
}
