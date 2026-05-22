import React, { useState, useEffect } from "react";
import { Product, Order, Review, Coupon, Banner } from "../types";
import {
  DollarSign,
  Briefcase,
  Users,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Check,
  Tag,
  Image as ImageIcon,
  TrendingUp,
  X,
  FileText
} from "lucide-react";

interface AdminDashboardViewProps {
  onClose: () => void;
  allProducts: Product[];
  onRefreshData: () => void;
}

export default function AdminDashboardView({
  onClose,
  allProducts,
  onRefreshData,
}: AdminDashboardViewProps) {
  // Navigation tabs: 'overview' | 'products' | 'orders' | 'reviews' | 'coupons' | 'banners'
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "reviews" | "coupons" | "banners">("overview");

  // Dashboard Stats States
  const [stats, setStats] = useState({
    totalSales: 219150,
    totalOrders: 2,
    totalCustomers: 2,
    lowStockAlerts: [] as { id: string; name: string; stock: number }[],
    monthlyRevData: [] as { name: string; sales: number; orders: number }[]
  });

  // Data lists
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Modals / Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [prodForm, setProdForm] = useState({
    name: "",
    description: "",
    category: "Laptops",
    brand: "",
    price: "",
    discountPrice: "",
    stock: "",
    images: "",
    Processor: "",
    RAM: "",
    Storage: "",
    Graphics: "",
    Display: "",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false
  });

  // Coupons form states
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [coupForm, setCoupForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    value: "",
    minPurchase: "",
    expiryDate: "2027-12-31"
  });

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchReviews();
    fetchCoupons();
    fetchBanners();
  }, [allProducts]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders for admin panel", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews?requireApproval=true");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load reviews list", err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error("Failed to fetch coupon records", err);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners");
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (err) {
      console.error("Failed to load banners list", err);
    }
  };

  // PRODUCTS ops
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: "",
      description: "",
      category: "Laptops",
      brand: "",
      price: "",
      discountPrice: "",
      stock: "",
      images: "",
      Processor: "",
      RAM: "",
      Storage: "",
      Graphics: "",
      Display: "",
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false
    });
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      price: p.price.toString(),
      discountPrice: p.discountPrice ? p.discountPrice.toString() : "",
      stock: p.stock.toString(),
      images: p.images.join(", "),
      Processor: p.specs["Processor"] || "",
      RAM: p.specs["RAM"] || "",
      Storage: p.specs["Storage"] || "",
      Graphics: p.specs["Graphics"] || "",
      Display: p.specs["Display"] || "",
      isFeatured: !!p.isFeatured,
      isNewArrival: !!p.isNewArrival,
      isBestSeller: !!p.isBestSeller
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imgsArray = prodForm.images
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    const specsObj: Record<string, string> = {};
    if (prodForm.Processor) specsObj["Processor"] = prodForm.Processor;
    if (prodForm.RAM) specsObj["RAM"] = prodForm.RAM;
    if (prodForm.Storage) specsObj["Storage"] = prodForm.Storage;
    if (prodForm.Graphics) specsObj["Graphics"] = prodForm.Graphics;
    if (prodForm.Display) specsObj["Display"] = prodForm.Display;

    const payload = {
      name: prodForm.name,
      description: prodForm.description,
      category: prodForm.category,
      brand: prodForm.brand,
      price: parseFloat(prodForm.price) || 0,
      discountPrice: prodForm.discountPrice ? parseFloat(prodForm.discountPrice) : null,
      stock: parseInt(prodForm.stock) || 0,
      images: imgsArray,
      specs: specsObj,
      isFeatured: prodForm.isFeatured,
      isNewArrival: prodForm.isNewArrival,
      isBestSeller: prodForm.isBestSeller
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setShowProductForm(false);
      onRefreshData(); // reloads main state products list
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action is irreversible.")) return;

    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (response.ok) {
      onRefreshData();
    }
  };

  // ORDER status change
  const handleUpdateOrderStatus = async (id: string, orderStatus: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus })
    });
    fetchOrders();
  };

  // REVIEWS approvals
  const handleApproveReview = async (id: string) => {
    const response = await fetch(`/api/reviews/${id}/approve`, { method: "POST" });
    if (response.ok) {
      fetchReviews();
      onRefreshData();
    }
  };

  const handleDeleteReview = async (id: string) => {
    const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchReviews();
      onRefreshData();
    }
  };

  // COUPON submissions
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: coupForm.code.toUpperCase(),
      discountType: coupForm.discountType,
      value: parseFloat(coupForm.value) || 0,
      minPurchase: parseFloat(coupForm.minPurchase) || 0,
      expiryDate: new Date(coupForm.expiryDate).toISOString(),
    };

    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setShowCouponForm(false);
      fetchCoupons();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const response = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchCoupons();
    }
  };

  // BANNER toggles
  const handleToggleBanner = async (idx: number) => {
    const updatedBanners = banners.map((b, i) => i === idx ? { ...b, active: !b.active } : b);
    const response = await fetch("/api/banners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBanners)
    });
    if (response.ok) {
      fetchBanners();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Admin Console panel</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Store Management & Metrics dashboard</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Admin Panel Layout Split */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side menu */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
              tab === "overview" ? "bg-indigo-650 text-white bg-indigo-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Store Metrics</span>
          </button>
          
          <button
            onClick={() => setTab("products")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
              tab === "products" ? "bg-indigo-650 text-white bg-indigo-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Products Hub</span>
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
              tab === "orders" ? "bg-indigo-650 text-white bg-indigo-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Sales Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setTab("reviews")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
              tab === "reviews" ? "bg-indigo-650 text-white bg-indigo-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Review Moderation ({reviews.filter(r => !r.isApproved).length})</span>
          </button>

          <button
            onClick={() => setTab("coupons")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
              tab === "coupons" ? "bg-indigo-650 text-white bg-indigo-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>Promo Coupons</span>
          </button>

          <button
            onClick={() => setTab("banners")}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
              tab === "banners" ? "bg-indigo-650 text-white bg-indigo-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Homepage Banners</span>
          </button>
        </div>

        {/* Right Content Panel (colspan 3) */}
        <div className="md:col-span-3 min-h-[400px]">
          
          {/* 1. OVERVIEW STATS TAB */}
          {tab === "overview" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              
              {/* Widgets cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center space-x-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Sales</span>
                    <span className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Rs. {stats.totalSales.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center space-x-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
                    <span className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{stats.totalOrders}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center space-x-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Customers</span>
                    <span className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{stats.totalCustomers}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center space-x-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Low Stock</span>
                    <span className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{stats.lowStockAlerts.length}</span>
                  </div>
                </div>
              </div>

              {/* Stock inventory warnings block */}
              {stats.lowStockAlerts.length > 0 && (
                <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/20 text-xs text-rose-700 flex flex-col gap-2">
                  <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px]">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Low Stock Alert Warnings</span>
                  </div>
                  <ul className="list-disc pl-5 font-semibold leading-normal">
                    {stats.lowStockAlerts.map((item) => (
                      <li key={item.id}>
                        Gadget "{item.name}" has only <strong className="font-extrabold text-slate-800">{item.stock}</strong> units left in database records. Please restock details!
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Monthly Trend Chart SVG Vector */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-sm">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight mb-6">Monthly Revenue Growth Trends</h3>
                
                {/* SVG Visual Bar chart */}
                <div className="h-64 w-full flex items-end gap-x-6 sm:gap-x-12 px-6 pb-2 relative border-b border-slate-200 dark:border-slate-800">
                  {stats.monthlyRevData.map((data, index) => {
                    const maxval = Math.max(...stats.monthlyRevData.map(d => d.sales)) || 100000;
                    const pct = Math.max(10, Math.round((data.sales / maxval) * 100));
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none transition-opacity duration-200">
                          Rs. {data.sales.toLocaleString()} ({data.orders} order)
                        </div>

                        {/* Visual Column bar */}
                        <div
                          style={{ height: `${pct}%` }}
                          className="w-full rounded-t-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 shadow-lg shadow-indigo-600/10 transition-all duration-500 cursor-pointer"
                        ></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{data.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCT MANAGEMENT TAB */}
          {tab === "products" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
                <span className="text-xs sm:text-sm font-bold">Manage store items ({allProducts.length})</span>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 duration-100"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Product Grid Lists */}
              <div className="flex flex-col gap-3">
                {allProducts.map((p) => {
                  const rate = p.discountPrice || p.price;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative"
                    >
                      <div className="flex items-center space-x-3.5">
                        <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover bg-slate-50 border shrink-0" />
                        <div>
                          <span className="block font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{p.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 uppercase">{p.category}</span>
                            <span className="text-xs font-mono text-slate-400">Stock: <strong className={p.stock < 5 ? "text-rose-500 font-extrabold" : "text-slate-700"}>{p.stock}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-none pt-2 sm:pt-0">
                        <span className="font-extrabold text-sm text-slate-950 dark:text-white">Rs. {rate.toLocaleString()}</span>
                        
                        {/* Actions controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500 focus:outline-none dark:border-slate-800 dark:hover:bg-slate-800"
                            title="Edit gadget data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-xl border border-rose-50 bg-rose-50/10 hover:bg-rose-50 text-rose-500 focus:outline-none dark:border-slate-800"
                            title="Delete gadget"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SALES ORDERS TAB */}
          {tab === "orders" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              {orders.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200">No order histories recorded in database yet.</p>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col gap-3.5 text-xs"
                  >
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between border-b pb-3 border-slate-100 dark:border-slate-800 gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-indigo-600 block">ORDER: #{o.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Client: {o.userEmail} | {new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Payment labels */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          Payment: {o.paymentStatus}
                        </span>

                        {/* Order statuses dropdown */}
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="h-8 px-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold hover:bg-slate-100"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Products details */}
                    <div className="flex flex-col gap-2">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                          <span>• {item.name} (x{item.quantity})</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total info */}
                    <div className="flex justify-between items-center border-t border-dashed pt-3 border-slate-150 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400">Total Charged: </span>
                        <strong className="font-black text-indigo-600 dark:text-indigo-400">Rs. {o.finalTotal.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono font-bold uppercase">Method: {o.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. REVIEWS MODERATION */}
          {tab === "reviews" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              {reviews.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200">No client reviews submitted or requiring moderation.</p>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm text-xs flex flex-col gap-2 relative leading-normal"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{r.userName}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">Submitted for {r.productId}</span>
                      </div>
                      <span className={`px-2 py-0.5 mt-1.5 rounded text-[10px] font-bold ${r.isApproved ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                        {r.isApproved ? "Approved & Public" : "Pending Approval"}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-350 italic mt-1 font-medium bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 dark:bg-slate-950/40 dark:border-slate-850">"{r.comment}"</p>

                    <div className="flex justify-end gap-2.5 mt-2 border-t pt-2 border-slate-100 dark:border-slate-800">
                      {!r.isApproved && (
                        <button
                          onClick={() => handleApproveReview(r.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 duration-100 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Display</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="px-3 py-1.5 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-lg text-xs font-bold active:scale-95 duration-100 cursor-pointer"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. COUPONS TAB */}
          {tab === "coupons" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
                <span className="text-xs sm:text-sm font-bold">Promo Coupon Codes ({coupons.length})</span>
                <button
                  onClick={() => {
                    setCoupForm({
                      code: "",
                      discountType: "percent",
                      value: "",
                      minPurchase: "",
                      expiryDate: "2027-12-31"
                    });
                    setShowCouponForm(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 duration-100"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Coupons List */}
              <div className="flex flex-col gap-3.5">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-medium"
                  >
                    <div>
                      <span className="font-black text-sm tracking-widest text-indigo-650 bg-indigo-50 border border-indigo-100 uppercase py-1 px-3 rounded-lg dark:bg-slate-800 dark:text-indigo-400">
                        {c.code}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-2.5">
                        Discount: <strong>{c.discountType === "percent" ? `${c.value}%` : `Rs. ${c.value}`}</strong> | Min Purchase: <strong>Rs. {c.minPurchase}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-2 border border-rose-50 text-rose-500 rounded-xl hover:bg-rose-50 focus:outline-none ml-auto sm:ml-0"
                      title="Delete Promo Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. HOMEPAGE BANNERS */}
          {tab === "banners" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <span className="text-xs sm:text-sm font-bold block mb-2"> Homepage Banners Slider lists</span>
              
              <div className="flex flex-col gap-4">
                {banners.map((b, idx) => (
                  <div key={b.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-sm md:flex gap-4 items-center">
                    <img src={b.imageUrl} className="w-36 h-20 rounded-xl object-cover bg-slate-50 shrink-0 mb-3 md:mb-0" />
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm text-slate-950 dark:text-white mb-1 line-clamp-1">{b.title}</h4>
                      <p className="text-xs text-slate-400 leading-normal line-clamp-2">{b.subtitle}</p>
                    </div>

                    <button
                      onClick={() => handleToggleBanner(idx)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl outline-none active:scale-95 duration-150 shrink-0 ${
                        b.active
                          ? "bg-green-50/70 border border-green-200 text-green-700 hover:bg-green-150"
                          : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {b.active ? "Banner Active" : "Banner Hidden"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PRODUCT SUBMISSION FULL FORM MODAL */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto animate-in fade-in duration-250">
          <form
            onSubmit={handleProductSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-5 text-slate-700 dark:text-slate-200 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-extrabold tracking-tight">
                {editingProduct ? `Edit gadget: ${editingProduct.name.substring(0, 20)}...` : "Add New Gadget Listing"}
              </h2>
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="font-bold text-slate-400 uppercase">Product title name</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="h-10 px-4 rounded-xl border focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="font-bold text-slate-400 uppercase">Long description</label>
                <textarea
                  required
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="p-3 rounded-xl border focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Category</label>
                <select
                  value={prodForm.category}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  className="h-10 px-4 rounded-xl border"
                >
                  <option value="Laptops">Laptops</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Monitors">Monitors</option>
                  <option value="Smart Home">Smart Home</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Brand</label>
                <input
                  type="text"
                  required
                  value={prodForm.brand}
                  onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                  className="h-10 px-4 rounded-xl border"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Original Price (NPR)</label>
                <input
                  type="number"
                  required
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  className="h-10 px-4 rounded-xl border"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Discount Price (NPR, optional)</label>
                <input
                  type="number"
                  value={prodForm.discountPrice}
                  onChange={(e) => setProdForm({ ...prodForm, discountPrice: e.target.value })}
                  className="h-10 px-4 rounded-xl border"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Stock quantity</label>
                <input
                  type="number"
                  required
                  value={prodForm.stock}
                  onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                  className="h-10 px-4 rounded-xl border"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Images (comma separated Unsplash URLs)</label>
                <input
                  type="text"
                  required
                  placeholder="https://image1.com, https://image2.com"
                  value={prodForm.images}
                  onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })}
                  className="h-10 px-4 rounded-xl border"
                />
              </div>

              {/* Specs */}
              <div className="col-span-2 border-t pt-2 mt-2">
                <span className="block font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-3">Specifications fields (optional)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label>Processor</label><input type="text" value={prodForm.Processor} onChange={(e) => setProdForm({...prodForm, Processor: e.target.value})} className="h-8 px-3 rounded-lg border" /></div>
                  <div className="flex flex-col gap-1"><label>RAM memory</label><input type="text" value={prodForm.RAM} onChange={(e) => setProdForm({...prodForm, RAM: e.target.value})} className="h-8 px-3 rounded-lg border" /></div>
                  <div className="flex flex-col gap-1"><label>Storage disk</label><input type="text" value={prodForm.Storage} onChange={(e) => setProdForm({...prodForm, Storage: e.target.value})} className="h-8 px-3 rounded-lg border" /></div>
                  <div className="flex flex-col gap-1"><label>Display screen</label><input type="text" value={prodForm.Display} onChange={(e) => setProdForm({...prodForm, Display: e.target.value})} className="h-8 px-3 rounded-lg border" /></div>
                </div>
              </div>

              {/* Toggles */}
              <div className="col-span-2 flex space-x-6 items-center mt-3">
                <label className="flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px]">
                  <input type="checkbox" checked={prodForm.isFeatured} onChange={(e) => setProdForm({...prodForm, isFeatured: e.target.checked})} className="rounded text-indigo-650" />
                  <span>Featured listing</span>
                </label>
                <label className="flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px]">
                  <input type="checkbox" checked={prodForm.isNewArrival} onChange={(e) => setProdForm({...prodForm, isNewArrival: e.checked ? true : e.target.checked})} className="rounded text-indigo-650" />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px]">
                  <input type="checkbox" checked={prodForm.isBestSeller} onChange={(e) => setProdForm({...prodForm, isBestSeller: e.target.checked})} className="rounded text-indigo-655" />
                  <span>Best Seller</span>
                </label>
              </div>

            </div>

            <button
              type="submit"
              className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-98 transition duration-150 mt-4"
            >
              Save changes
            </button>
          </form>
        </div>
      )}

      {/* CREATIVE COUPON DIALOG FORM */}
      {showCouponForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 shadow-2xl p-6 sm:p-8 w-full max-w-md flex flex-col gap-4 text-slate-700 dark:text-slate-200 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold tracking-tight">Create Promo Coupon</h3>
              <button type="button" onClick={() => setShowCouponForm(false)} className="text-slate-400 hover:text-slate-655"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Coupon code string</label>
                <input type="text" required placeholder="E.G. NEWYEAR2026" value={coupForm.code} onChange={(e) => setCoupForm({...coupForm, code: e.target.value})} className="h-9 px-3 rounded-lg border uppercase font-mono font-bold" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Discount Type</label>
                <select value={coupForm.discountType} onChange={(e) => setCoupForm({...coupForm, discountType: e.target.value as "percent" | "fixed"})} className="h-9 px-3 rounded-lg border">
                  <option value="percent">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Balance Discount (NPR)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Discount value</label>
                <input type="number" required placeholder="E.G. 10 for 10% or 2500 for Rs. 2500" value={coupForm.value} onChange={(e) => setCoupForm({...coupForm, value: e.target.value})} className="h-9 px-3 rounded-lg border" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Minimum order purchase (NPR)</label>
                <input type="number" required value={coupForm.minPurchase} onChange={(e) => setCoupForm({...coupForm, minPurchase: e.target.value})} className="h-9 px-3 rounded-lg border" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase">Expiration Date</label>
                <input type="date" required value={coupForm.expiryDate} onChange={(e) => setCoupForm({...coupForm, expiryDate: e.target.value})} className="h-9 px-3 rounded-lg border" />
              </div>
            </div>

            <button type="submit" className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold active:scale-95 duration-100 flex items-center justify-center mt-2 shadow-md">Create Promo Coupon</button>
          </form>
        </div>
      )}

    </div>
  );
}
