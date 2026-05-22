import React, { useState } from "react";
import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import {
  Search,
  ShoppingCart,
  Heart,
  Sun,
  Moon,
  User,
  Globe,
  Sliders,
  LogOut,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  onSearch: (query: string) => void;
  activeView: string;
  onSetView: (view: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onTriggerAuth: () => void;
}

export default function Navbar({
  onSearch,
  activeView,
  onSetView,
  onOpenCart,
  onOpenWishlist,
  onTriggerAuth
}: NavbarProps) {
  const {
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    currentUser,
    logout,
    cart,
    wishlist
  } = useThemeLanguage();

  const [inputVal, setInputVal] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const t = translations[language];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputVal);
    onSetView("shop");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300 glass-card-adaptive border-slate-200/80 dark:border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div
            onClick={() => onSetView("home")}
            className="flex items-center cursor-pointer space-x-2 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30 transition-transform duration-300 group-hover:scale-105">
              YT
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Youth Tech
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase -mt-1">
                Online Shopping
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-4 relative hidden md:block"
          >
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl text-sm border bg-slate-100/50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-indigo-500"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </form>

          {/* Right Header Navigation Panel */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* View Catalog */}
            <button
              onClick={() => {
                onSearch("");
                setInputVal("");
                onSetView("shop");
              }}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                activeView === "shop"
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t.shop}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center gap-1.5 focus:outline-none border border-slate-100 dark:border-slate-800 text-xs font-semibold"
              title="Change Language / भाषा परिवर्तन गर्नुहोस्"
            >
              <Globe className="w-4.5 h-4.5 text-slate-500" />
              <span>{language === "en" ? "नेपाली" : "English"}</span>
            </button>

            {/* Light / Dark Theme Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 focus:outline-none"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4.5 h-4.5" />
              ) : (
                <Sun className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Heart Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 focus:outline-none"
              title={t.wishlist}
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-950">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 focus:outline-none"
              title={t.cart}
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-950">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Separator */}
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-1.5 focus:outline-none p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser.userName.substring(0, 1).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showProfileDropdown && (
                  <div
                    onMouseLeave={() => setShowProfileDropdown(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-2 text-sm text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="block font-bold truncate">
                        {currentUser.userName}
                      </span>
                      <span className="block text-xs text-slate-400 truncate mt-0.5">
                        {currentUser.email}
                      </span>
                      {currentUser.role === "admin" && (
                        <span className="inline-block px-2 py-0.5 mt-1.5 rounded text-[10px] font-bold text-indigo-700 bg-indigo-50 uppercase dark:bg-indigo-950/80 dark:text-indigo-400">
                          Store Admin
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onSetView("user");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-805 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t.userProfile}</span>
                    </button>

                    {currentUser.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onSetView("admin");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-600 dark:hover:bg-indigo-950/20 dark:text-indigo-400 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Sliders className="w-4 h-4 text-indigo-500" />
                        <span>{t.adminPanel}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                        onSetView("home");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-500 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onTriggerAuth}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="py-2.5 pb-3 border-t border-slate-100 dark:border-slate-800 block md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl text-xs border bg-slate-100/50 border-slate-205 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </form>
        </div>
      </div>
    </header>
  );
}
