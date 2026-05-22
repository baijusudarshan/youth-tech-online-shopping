import React, { useState, useEffect } from "react";
import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import { Order, ShippingAddress } from "../types";
import {
  Package,
  MapPin,
  Lock,
  Calendar,
  Gift,
  Plus,
  Trash2,
  Sliders,
  CheckCircle,
  Truck,
  FileText
} from "lucide-react";

export default function UserDashboardView() {
  const { language, currentUser, updateUserInDb, wishlist } = useThemeLanguage();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "account" >("orders");
  const [orders, setOrders] = useState<Order[]>([]);

  // Address form fields
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: currentUser?.userName || "",
    phone: "",
    addressLine: "",
    city: "",
    province: "Bagmati"
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/orders?email=${currentUser?.email}`);
      if (response.ok) {
        const list = await response.json();
        setOrders(list);
      }
    } catch (err) {
      console.error("Failed to fetch user orders list", err);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const added: ShippingAddress = {
      id: "addr_" + Date.now(),
      name: newAddress.name,
      phone: newAddress.phone,
      addressLine: newAddress.addressLine,
      city: newAddress.city,
      province: newAddress.province,
      isDefault: currentUser.addresses.length === 0,
    };

    const updatedAddresses = [...currentUser.addresses, added];
    updateUserInDb({
      ...currentUser,
      addresses: updatedAddresses,
    });

    setShowAddressForm(false);
    setNewAddress({
      name: currentUser?.userName || "",
      phone: "",
      addressLine: "",
      city: "",
      province: "Bagmati"
    });
  };

  const handleDeleteAddress = (id: string) => {
    if (!currentUser) return;
    const updated = currentUser.addresses.filter((a) => a.id !== id);
    updateUserInDb({
      ...currentUser,
      addresses: updated,
    });
  };

  // Helper for progress tracker color steps
  const getStepStatus = (orderStatus: string, step: "Pending" | "Confirmed" | "Shipped" | "Delivered") => {
    const sequence = ["Pending", "Confirmed", "Shipped", "Delivered"];
    const currentIdx = sequence.indexOf(orderStatus);
    const stepIdx = sequence.indexOf(step);

    if (orderStatus === "Cancelled") return "cancelled";
    if (currentIdx >= stepIdx) return "complete";
    return "pending";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      
      {/* Dashboard Grid split panel */}
      {currentUser ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Quick Profile Left summary */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20 mb-3 uppercase">
                {currentUser.userName.substring(0, 1)}
              </div>
              <h2 className="font-extrabold text-slate-850 dark:text-slate-100 truncate w-full">{currentUser.userName}</h2>
              <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full">{currentUser.email}</span>

              <div className="border-t w-full my-4 border-slate-100 dark:border-slate-800"></div>

              <div className="flex flex-col gap-3.5 w-full text-xs font-semibold text-slate-500 text-left">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4.5 h-4.5 text-slate-400" />
                  <span>Joined {new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gift className="w-4.5 h-4.5 text-slate-400" />
                  <span>{wishlist.length} Items Wishlisted</span>
                </div>
              </div>
            </div>

            {/* In-dashboard menu items tabs */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
                  activeTab === "orders" ? "bg-indigo-650 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
                }`}
              >
                <Package className="w-5 h-5 text-slate-400" />
                <span>My Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
                  activeTab === "addresses" ? "bg-indigo-650 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
                }`}
              >
                <MapPin className="w-5 h-5 text-slate-400" />
                <span>Saved Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab("account")}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide gap-3 flex items-center transition ${
                  activeTab === "account" ? "bg-indigo-650 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
                }`}
              >
                <Sliders className="w-5 h-5 text-slate-400" />
                <span>Account Security</span>
              </button>
            </div>
          </div>

          {/* Right Dashboard Contents Col (colspan 3) */}
          <div className="md:col-span-3 min-h-[400px]">
            
            {/* 1. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="flex flex-col gap-6">
                <span className="text-xs sm:text-sm font-extrabold block">Your order milestones ({orders.length})</span>
                
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
                    <p className="font-bold text-slate-700 dark:text-slate-200">No Orders Purchased yet</p>
                    <p className="text-xs mt-1">Ready to grab some elite electronic devices? Head over to the tech catalog!</p>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col gap-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 border-slate-100 dark:border-slate-800 gap-2">
                        <div>
                          <strong className="block text-sm font-extrabold text-slate-800 dark:text-slate-200">#ORD_{o.id}</strong>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Placed on {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
                            {o.paymentMethod} • {o.paymentStatus}
                          </span>
                          {o.orderStatus === "Cancelled" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 uppercase">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Purchased products lists */}
                      <div className="flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                        {o.items.map((item, id) => (
                          <div key={id} className="flex justify-between text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                            <span>• {item.name} <strong className="text-slate-400 font-mono text-[10px]">({item.quantity} Qty)</strong></span>
                            <span className="font-bold text-slate-900 dark:text-white">Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2 border-slate-200/50 flex justify-between font-extrabold text-sm text-indigo-650 dark:text-indigo-400">
                          <span>Grand TotalPaid:</span>
                          <span>Rs. {o.finalTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* STEP SEQUENTIAL Delivery TRACKER PROGRESS BAR */}
                      {o.orderStatus !== "Cancelled" && (
                        <div className="py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                          
                          {/* Step 1: Pending */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600">
                              <Calendar className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-[9px] font-bold mt-1.5 uppercase text-indigo-600 text-center">Placed</span>
                          </div>
                          <div className={`flex-1 h-[2px] ${getStepStatus(o.orderStatus, "Confirmed") === "complete" ? "bg-indigo-600" : "bg-slate-200"}`}></div>

                          {/* Step 2: Confirmed */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              getStepStatus(o.orderStatus, "Confirmed") === "complete" ? "bg-indigo-650 text-white bg-indigo-600" : "bg-slate-100 text-slate-400"
                            }`}>
                              <CheckCircle className="w-4.5 h-4.5" />
                            </div>
                            <span className={`text-[9px] font-bold mt-1.5 uppercase text-center ${
                              getStepStatus(o.orderStatus, "Confirmed") === "complete" ? "text-indigo-600" : "text-slate-400"
                            }`}>Confirmed</span>
                          </div>
                          <div className={`flex-1 h-[2px] ${getStepStatus(o.orderStatus, "Shipped") === "complete" ? "bg-indigo-600" : "bg-slate-200"}`}></div>

                          {/* Step 3: Shipped */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              getStepStatus(o.orderStatus, "Shipped") === "complete" ? "bg-indigo-650 text-white bg-indigo-600" : "bg-slate-100 text-slate-400"
                            }`}>
                              <Truck className="w-4.5 h-4.5" />
                            </div>
                            <span className={`text-[9px] font-bold mt-1.5 uppercase text-center ${
                              getStepStatus(o.orderStatus, "Shipped") === "complete" ? "text-indigo-600" : "text-slate-400"
                            }`}>Shipped</span>
                          </div>
                          <div className={`flex-1 h-[2px] ${getStepStatus(o.orderStatus, "Delivered") === "complete" ? "bg-indigo-600" : "bg-slate-200"}`}></div>

                          {/* Step 4: Delivered */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              getStepStatus(o.orderStatus, "Delivered") === "complete" ? "bg-indigo-650 text-white bg-indigo-600" : "bg-slate-100 text-slate-400"
                            }`}>
                              <CheckCircle className="w-4.5 h-4.5 fill-current text-white bg-emerald-600" />
                            </div>
                            <span className={`text-[9px] font-bold mt-1.5 uppercase text-center ${
                              getStepStatus(o.orderStatus, "Delivered") === "complete" ? "text-emerald-600 font-extrabold" : "text-slate-400"
                            }`}>Delivered</span>
                          </div>

                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <span className="text-sm font-bold">Addresses Saved</span>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="px-4 py-2 rounded-xl bg-indigo-650 text-white font-bold text-xs bg-indigo-600 flex items-center gap-1.5 active:scale-95 duration-100"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>

                {showAddressForm && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col gap-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1"><label className="font-bold text-slate-400">FullName recipient</label><input type="text" required value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="h-9 px-3 rounded-xl border focus:ring-1 focus:ring-indigo-600" /></div>
                      <div className="flex flex-col gap-1"><label className="font-bold text-slate-400">Mobile Phone Number</label><input type="tel" required placeholder="98XXXX" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="h-9 px-3 rounded-xl border focus:ring-1 focus:ring-indigo-600" /></div>
                      <div className="flex flex-col gap-1"><label className="font-bold text-slate-400">Province</label><select value={newAddress.province} onChange={(e) => setNewAddress({...newAddress, province: e.target.value})} className="h-9 px-3 rounded-xl border"><option value="Bagmati">Bagmati Province</option><option value="Koshi">Koshi Province</option><option value="Gandaki">Gandaki Province</option></select></div>
                      <div className="flex flex-col gap-1"><label className="font-bold text-slate-400">City</label><input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="h-9 px-3 rounded-xl border focus:ring-1 focus:ring-indigo-600" /></div>
                      <div className="flex flex-col gap-1 col-span-2"><label className="font-bold text-slate-400">Street / landmark details</label><input type="text" required value={newAddress.addressLine} onChange={(e) => setNewAddress({...newAddress, addressLine: e.target.value})} className="h-9 px-3 rounded-xl border focus:ring-1 focus:ring-indigo-600" /></div>
                    </div>
                    <button type="submit" className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer inline-block w-max px-6">Save address profile</button>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentUser.addresses.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 p-5 rounded-3xl border bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 relative shadow-sm text-xs leading-relaxed"
                    >
                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{a.name}</span>
                        {a.isDefault && <span className="text-[10px] tracking-wide font-black bg-indigo-50 text-indigo-700 uppercase px-1.5 py-0.5 rounded">Default Profile</span>}
                      </h4>
                      <p className="text-slate-500 font-medium mt-1">{a.addressLine}</p>
                      <p className="text-slate-500 font-medium">{a.city}, {a.province}</p>
                      <p className="font-bold text-slate-800 dark:text-slate-300 mt-2.5">Mobile: {a.phone}</p>

                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        className="absolute top-3 right-3 p-1 rounded-lg text-slate-350 hover:text-rose-500 duration-150"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SAFETY SETTINGS TAB */}
            {activeTab === "account" && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col gap-4 text-xs">
                <div className="flex items-center space-x-2 border-b pb-3 mb-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm sm:text-base">Authentication & Encryption logs</h3>
                </div>
                <div className="leading-normal text-slate-500 font-medium flex flex-col gap-2.5">
                  <p>Your session profiles are authenticated securely under encrypted passwords stored in local JSON hashes on the server sandbox.</p>
                  <p>In production clouds, you can switch seamlessly to firebase or JWT auth keys utilizing the preloaded environment examples.</p>
                  <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-slate-100 flex items-center text-indigo-650 justify-between dark:bg-slate-950/40 dark:border-slate-850">
                    <span>Account Rank role:</span>
                    <strong className="uppercase font-bold text-xs">{currentUser.role}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <p className="p-12 text-center text-slate-400">Please authenticate to display your customer order dashboards!</p>
      )}

    </div>
  );
}
