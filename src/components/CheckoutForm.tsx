import React, { useState } from "react";
import { useThemeLanguage, translations } from "./ThemeLanguageContext";
import { CreditCard, CheckCircle, ArrowLeft, ArrowRight, Printer, Download, Receipt } from "lucide-react";
import { Coupon, Order } from "../types";

interface CheckoutFormProps {
  onBackToHome: () => void;
  onOrderPlaced: () => void;
}

export default function CheckoutForm({ onBackToHome, onOrderPlaced }: CheckoutFormProps) {
  const { language, cart, currentUser, clearCart } = useThemeLanguage();
  const t = translations[language];

  // Steps: 'shipping' | 'payment_portal' | 'confirmation'
  const [step, setStep] = useState<"shipping" | "payment_portal" | "confirmation">("shipping");

  const [shippingInfo, setShippingInfo] = useState({
    name: currentUser?.userName || "",
    phone: currentUser?.addresses[0]?.phone || "",
    address: currentUser?.addresses[0]?.addressLine || "",
    city: currentUser?.addresses[0]?.city || "",
    province: currentUser?.addresses[0]?.province || "Bagmati",
  });

  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [billingInfo, setBillingInfo] = useState({
    name: currentUser?.userName || "",
    phone: currentUser?.addresses[0]?.phone || "",
    address: currentUser?.addresses[0]?.addressLine || "",
    city: currentUser?.addresses[0]?.city || "",
    province: currentUser?.addresses[0]?.province || "Bagmati",
  });

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"Khalti" | "eSewa" | "Cash on Delivery">("Cash on Delivery");

  // Portal simulation
  const [portalStep, setPortalStep] = useState<"phone" | "otp" | "success">("phone");
  const [portalPhone, setPortalPhone] = useState("");
  const [portalPin, setPortalPin] = useState("");
  const [portalOtp, setPortalOtp] = useState("");

  // Final Order details
  const [finalPlacedOrder, setFinalPlacedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => {
    const rate = item.discountPrice || item.price;
    return sum + rate * item.quantity;
  }, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const shippingFee = subtotal > 15000 ? 0 : 150;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const response = await fetch(`/api/coupons/validate?code=${couponCode.trim()}&subtotal=${subtotal}`);
      if (response.ok) {
        const coupon: Coupon = await response.json();
        setAppliedCoupon(coupon);
        setCouponMessage(`Successfully applied promo! General discount applied.`);
      } else {
        const error = await response.json();
        setCouponMessage(error.error || "Failed to validate coupon");
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponMessage("Connection error");
    }
  };

  const submitAddressStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "Cash on Delivery") {
      // Create order directly
      dispatchOrder("Pending");
    } else {
      // Open instant e-wallet portal
      setPortalStep("phone");
      setPortalPhone(shippingInfo.phone || "");
      setStep("payment_portal");
    }
  };

  const dispatchOrder = async (payStatus: "Pending" | "Paid") => {
    const payload = {
      userEmail: currentUser?.email || "guest@gmail.com",
      shippingInfo,
      billingInfo: useShippingAsBilling ? shippingInfo : billingInfo,
      items: cart,
      paymentMethod,
      couponCode: appliedCoupon?.code,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const doc: Order = await response.json();
        // Force state updates to sync with payment status
        if (payStatus === "Paid") {
          // Put paid
          await fetch(`/api/orders/${doc.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "Paid" }),
          });
          doc.paymentStatus = "Paid";
        }

        setFinalPlacedOrder(doc);
        clearCart();
        setStep("confirmation");
        onOrderPlaced(); // notifies app to refresh data
      }
    } catch (err) {
      console.error("Payment dispatch failure", err);
    }
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalStep === "phone") {
      setPortalStep("otp");
    } else if (portalStep === "otp") {
      dispatchOrder("Paid");
    }
  };

  // HTML Print utility
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">1</div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">Billing</span>
        </div>
        <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${step !== "shipping" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>2</div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">Payment Portal</span>
        </div>
        <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${step === "confirmation" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>3</div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">Confirmation</span>
        </div>
      </div>

      {step === "shipping" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Address Forms Column (colspan 2) */}
          <form onSubmit={submitAddressStep} className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Delivery address card */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-extrabold mb-4 tracking-tight">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs text-slate-400 font-medium">FullName</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800/50 dark:border-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Nepali Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    pattern="[9][6-8][0-9]{8}"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800/50 dark:border-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Province</label>
                  <select
                    value={shippingInfo.province}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Koshi">Koshi Province</option>
                    <option value="Madhesh">Madhesh Province</option>
                    <option value="Bagmati">Bagmati Province</option>
                    <option value="Gandaki">Gandaki Province</option>
                    <option value="Lumbini">Lumbini Province</option>
                    <option value="Karnali">Karnali Province</option>
                    <option value="Sudurpashchim">Sudurpashchim Province</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800/50 dark:border-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 col-span-2">
                  <label className="text-xs text-slate-400 font-medium">Street Address / Landmark details</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:bg-slate-800/50 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Offline and e-wallet select cards */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-extrabold mb-4 tracking-tight">Select Payment Channels</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Cash on Delivery */}
                <label className={`p-4 rounded-2xl border-2 flex flex-col justify-between h-28 cursor-pointer transition-all ${
                  paymentMethod === "Cash on Delivery"
                    ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={() => setPaymentMethod("Cash on Delivery")}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-sm font-mono uppercase">COD</div>
                  <div>
                    <span className="block font-bold text-xs sm:text-sm">Cash on Delivery</span>
                  </div>
                </label>

                {/* eSewa */}
                <label className={`p-4 rounded-2xl border-2 flex flex-col justify-between h-28 cursor-pointer transition-all ${
                  paymentMethod === "eSewa"
                    ? "border-green-600 bg-green-50/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="eSewa"
                    checked={paymentMethod === "eSewa"}
                    onChange={() => setPaymentMethod("eSewa")}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-black text-xs font-serif uppercase">eS</div>
                  <div>
                    <span className="block font-extrabold text-xs sm:text-sm text-green-600">eSewa Wallet</span>
                  </div>
                </label>

                {/* Khalti */}
                <label className={`p-4 rounded-2xl border-2 flex flex-col justify-between h-28 cursor-pointer transition-all ${
                  paymentMethod === "Khalti"
                    ? "border-purple-600 bg-purple-50/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Khalti"
                    checked={paymentMethod === "Khalti"}
                    onChange={() => setPaymentMethod("Khalti")}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white font-extrabold text-xs uppercase shadow-sm">Kh</div>
                  <div>
                    <span className="block font-extrabold text-xs sm:text-sm text-purple-600">Khalti Wallet</span>
                  </div>
                </label>

              </div>
            </div>

            <button
              type="submit"
              className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/35 flex items-center justify-center space-x-2 active:scale-98 transition duration-200"
            >
              <span>{paymentMethod === "Cash on Delivery" ? t.placeOrder : "Continue to Wallet Login"}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </form>

          {/* Checkout Totals Summary column */}
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h3 className="font-extrabold text-base tracking-tight mb-4">Order Summary</h3>
              <div className="flex flex-col gap-3 mb-4 max-h-[160px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-2.5 justify-between items-center text-xs">
                    <img src={item.image} className="w-8 h-8 rounded-lg bg-slate-50 object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-slate-800 dark:text-slate-100">{item.name}</p>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">
                      Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 border-t pt-4 border-slate-100 dark:border-slate-800 mb-4">
                <input
                  type="text"
                  placeholder="YOUTHTECH10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-9 px-3 text-xs bg-slate-50 rounded-lg focus:outline-none dark:bg-slate-800 dark:text-slate-100 uppercase font-mono font-semibold"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold text-xs cursor-pointer focus:outline-none active:scale-95 duration-100"
                >
                  Verify
                </button>
              </form>

              {couponMessage && (
                <p className="text-[10px] text-indigo-500 font-bold mb-4">{couponMessage}</p>
              )}

              {/* pricing detail totals */}
              <div className="flex flex-col gap-2.5 text-xs text-slate-500 border-t pt-4 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                    <span>Coupon ({appliedCoupon.code}):</span>
                    <span className="font-bold animate-pulse">- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {shippingFee === 0 ? "FREE" : `Rs. ${shippingFee}`}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                <div className="flex justify-between text-sm">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">Grand Total:</span>
                  <span className="font-black text-indigo-600 text-base dark:text-indigo-400">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Nepali eSewa / Khalti wallet login popup */}
      {step === "payment_portal" && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
          
          {/* Accent Color Band */}
          <div className={`absolute top-0 inset-x-0 h-2 ${paymentMethod === "eSewa" ? "bg-green-500" : "bg-purple-600"}`}></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-white text-xs ${
                paymentMethod === "eSewa" ? "bg-green-500" : "bg-indigo-900"
              }`}>
                {paymentMethod === "eSewa" ? "eS" : "Kh"}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base leading-none">
                  {paymentMethod} Checkout
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 block">Simulated Gateway Portal</span>
              </div>
            </div>

            <button
              onClick={() => setStep("shipping")}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 focus:outline-none"
            >
              Cancel
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs flex justify-between items-center text-slate-600 dark:text-slate-350">
            <span>Amount to pay:</span>
            <span className="font-black text-slate-900 text-sm dark:text-white">Rs. {grandTotal.toLocaleString()}</span>
          </div>

          <form onSubmit={handleWalletSubmit} className="flex flex-col gap-4">
            {portalStep === "phone" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Wallet Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={portalPhone}
                    onChange={(e) => setPortalPhone(e.target.value)}
                    className="h-10 px-4 rounded-xl border focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Secure Wallet Pin / Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    value={portalPin}
                    onChange={(e) => setPortalPin(e.target.value)}
                    className="h-10 px-4 rounded-xl border focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </>
            )}

            {portalStep === "otp" && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500">
                  A verification code has been dispatched to <strong className="font-bold text-slate-800">{portalPhone}</strong>. Enter the 4-digit code to complete authentication.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Enter OTP One-Time Passcode</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{4}"
                    placeholder="1234"
                    value={portalOtp}
                    onChange={(e) => setPortalOtp(e.target.value)}
                    className="h-10 px-4 rounded-xl border text-center tracking-widest text-lg font-bold"
                  />
                </div>
                <span className="text-[10px] text-indigo-500 text-center font-bold animate-pulse">Simulated OTP auto-sent helper code: 1234</span>
              </div>
            )}

            <button
              type="submit"
              className={`h-11 text-white rounded-xl font-bold text-sm shadow-lg active:scale-98 transition ${
                paymentMethod === "eSewa" ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
              }`}
            >
              {portalStep === "phone" ? "Authorize Login" : "Confirm & Pay"}
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Step & Printable Invoice view */}
      {step === "confirmation" && finalPlacedOrder && (
        <div className="flex flex-col items-center max-w-2xl mx-auto paperview">
          <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-1">
            Order Successfully Placed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 text-center mb-6">
            Thank you for shopping at Youth Tech. Your order ID is <strong className="font-bold text-indigo-600">{finalPlacedOrder.id}</strong>. A digital ledger invoice has been generated below.
          </p>

          {/* DIGITAL INVOICE BILL FOR PRINT / EXPORT */}
          <div id="invoice-bill" className="w-full p-6 sm:p-8 rounded-2xl border text-slate-800 bg-white border-slate-205 dark:bg-slate-900 dark:border-slate-800 shadow-lg text-xs leading-relaxed mb-6 font-mono">
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-indigo-600">Youth Tech Online Shopping</h3>
                <p className="text-[10px] text-slate-400 mt-1">Kathmandu, Nepal | Support: +977-1-4433221</p>
                <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold mt-1">VAT/PAN Reg No. 609812345</p>
              </div>
              <div className="text-left sm:text-right mt-3 sm:mt-0 font-bold text-slate-700 dark:text-slate-350">
                <p className="text-xs">INVOICE: #{finalPlacedOrder.id}</p>
                <p className="text-[10px] font-medium text-slate-400">Date: {new Date(finalPlacedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Shipping addresses ledger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b-2 border-slate-200 pb-4 mb-4">
              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Billing To:</span>
                <p className="font-bold">{finalPlacedOrder.shippingInfo.name}</p>
                <p>{finalPlacedOrder.shippingInfo.address}</p>
                <p>{finalPlacedOrder.shippingInfo.city}, {finalPlacedOrder.shippingInfo.province}</p>
                <p>Phone: {finalPlacedOrder.shippingInfo.phone}</p>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Payment:</span>
                <p>Method: <strong>{finalPlacedOrder.paymentMethod}</strong></p>
                <p>Status: <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-green-50 text-emerald-800">{finalPlacedOrder.paymentStatus}</span></p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse border-b-2 border-slate-200 pb-4 mb-4">
              <thead>
                <tr className="border-b border-slate-200 uppercase text-[9px] font-extrabold text-slate-400">
                  <th className="py-1">Gadget description</th>
                  <th className="py-1 text-center">Unit Price</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {finalPlacedOrder.items.map((item) => {
                  const rate = item.discountPrice || item.price;
                  return (
                    <tr key={item.productId} className="border-b border-slate-100 text-[11px]">
                      <td className="py-2 font-bold">{item.name}</td>
                      <td className="py-2 text-center">Rs. {rate.toLocaleString()}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right font-extrabold">Rs. {(rate * item.quantity).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Invoice Totals calculation */}
            <div className="flex flex-col items-end gap-1.5 font-bold">
              <div className="flex justify-between w-48 text-[11px] text-slate-400">
                <span>Subtotal:</span>
                <span className="text-slate-800">Rs. {finalPlacedOrder.subtotal.toLocaleString()}</span>
              </div>
              {finalPlacedOrder.discount > 0 && (
                <div className="flex justify-between w-48 text-[11px] text-indigo-600">
                  <span>Discount Code:</span>
                  <span>- Rs. {finalPlacedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between w-48 text-[11px] text-slate-400">
                <span>Shipping:</span>
                <span className="text-slate-800">{finalPlacedOrder.shippingFee === 0 ? "FREE" : `Rs. ${finalPlacedOrder.shippingFee}`}</span>
              </div>
              <div className="flex justify-between w-48 text-[12px] border-t pt-1.5 text-slate-900 border-slate-200 font-extrabold text-sm text-indigo-600 uppercase">
                <span>Amount Paid:</span>
                <span>Rs. {finalPlacedOrder.finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Note */}
            <div className="border-t border-dashed border-slate-200 pt-3 mt-4 text-center text-[10px] text-slate-400 font-medium leading-normal">
              Thank you for trusting Youth Tech Online Shopping! If you require any support, replacement or refunds, please review our Return/Refund policies on the homepage footer or contact live chat assistant.
            </div>
          </div>

          {/* Print controls */}
          <div className="flex gap-4 scroll-smooth">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 text-xs font-bold outline-none flex items-center justify-center space-x-1 hover:scale-101 duration-150"
            >
              <Printer className="w-4.5 h-4.5 text-slate-500" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onBackToHome}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg text-xs font-bold outline-none flex items-center justify-center space-x-1 hover:scale-101 duration-150"
            >
              <span>Back to Store Shopping</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
