import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Shield, HelpCircle, FileText } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "Do you deliver all over Nepal? What represent the shipping costs?",
    a: "Yes! Youth Tech delivers to all major cities and towns in Nepal (including Kathmandu Valley, Pokhara, Biratnagar, Lalitpur, Butwal, etc.). Shipping is flat Rs. 150, but we unlock completely FREE delivery for orders above Rs. 15,000!"
  },
  {
    q: "What payment partners do you support?",
    a: "We support instant online payments with eSewa and Khalti digital wallets or Cash on Delivery (COD) on arrival of physical shipments."
  },
  {
    q: "How can I assert warranty or request returns/refunds?",
    a: "We have an absolute 7-day hassle-free return window for any defective electronics! Simply fill the support form or speak to our AI Live Chat assistant."
  },
  {
    q: "Who runs Youth Tech Online Shopping?",
    a: "We are an authorized, premium Nepali gadgets vendor specializing in laptops, headphones, monitors, smartwatches and smartphones tailored for youth devs and creators."
  }
];

export function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-2.5 mb-6 border-b pb-4 border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-6 h-6 text-indigo-650" />
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
      </div>

      <div className="flex flex-col gap-3.5">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-100 pr-4">
              <span>{faq.q}</span>
              <span className="text-indigo-600 font-bold font-mono text-base">{openIdx === idx ? "−" : "+"}</span>
            </div>
            {openIdx === idx && (
              <p className="text-xs text-slate-500 dark:text-slate-350 font-medium leading-relaxed mt-3 border-t pt-2 border-slate-100 dark:border-slate-800">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 leading-relaxed text-xs sm:text-sm text-slate-550 dark:text-slate-300">
      <div className="flex items-center space-x-2.5 mb-6 border-b pb-4 border-slate-200 dark:border-slate-800">
        <FileText className="w-6 h-6 text-indigo-650" />
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Return & Refund Procedures</h1>
      </div>

      <div className="flex flex-col gap-4 font-medium">
        <p>At Youth Tech Online Shopping, we stand unconditionally behind our high-performance electronic gadgets. We offer a <strong>7-Day Returns & Replacement Guarantee</strong> of defective tech items.</p>
        
        <h3 className="font-extrabold text-slate-900 mt-2 text-sm sm:text-base dark:text-white">1. Return Eligibility Requirements</h3>
        <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-500">
          <li>Item must remain in its original box state, with manual pamphlets and accessories included.</li>
          <li>Labels, serial codes must match inventory records.</li>
          <li>No liquid damage, drop scars or user-induced physical blemishes.</li>
        </ul>

        <h3 className="font-extrabold text-slate-900 mt-2 text-sm sm:text-base dark:text-white">2. Reimbursement & Refunds</h3>
        <p>Once components pass checking tests at our Kathmandu tech lab, we process full bank transfers or eSewa/Khalti refunds within 3 business days.</p>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 leading-relaxed text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium">
      <div className="flex items-center space-x-2.5 mb-6 border-b pb-4 border-slate-200 dark:border-slate-800">
        <Shield className="w-6 h-6 text-indigo-650" />
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Privacy Policy & Secure Data</h1>
      </div>
      <div className="flex flex-col gap-4">
        <p>Youth Tech values customer privacy. We isolate personal data (shipping city, billing addresses, mobile numbers) inside tight sandboxed local repositories.</p>
        <p>We do not aggregate or distribute purchase history indices, or sell client details to third-party cookies.</p>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", msg: "" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Forms column */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5.5 h-5.5 text-indigo-600 animate-pulse" />
          <span>Write to Youth Tech</span>
        </h2>

        {submitted && (
          <span className="text-xs font-bold bg-green-50 text-green-700 py-2 px-3 rounded-xl block">
            Message submitted! Our tech support squad will return response in 24 hours.
          </span>
        )}

        <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 text-xs font-medium">
          <div className="flex flex-col gap-1">
            <label>Your Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="h-10 px-4 rounded-xl border focus:ring-1 focus:ring-indigo-600" />
          </div>
          <div className="flex flex-col gap-1">
            <label>Customer Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="h-10 px-4 rounded-xl border focus:ring-1 focus:ring-indigo-600" />
          </div>
          <div className="flex flex-col gap-1">
            <label>Gadget Inquiry detail / Order Issue</label>
            <textarea required rows={4} value={form.msg} onChange={(e) => setForm({...form, msg: e.target.value})} className="p-3 rounded-xl border focus:ring-1 focus:ring-indigo-600" placeholder="Kindly detail model numbers or invoice IDs..." />
          </div>
          <button type="submit" className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1.5 duration-100">
            <span>Send Message</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Corporate Metadata column */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 text-xs text-slate-550 dark:text-slate-350">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base dark:text-white">Our headquarters and outlets</h3>
        
        <div className="flex flex-col gap-4 font-semibold">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold text-slate-850 dark:text-slate-200">Main Office Hub</p>
              <p className="text-slate-400 mt-1">Kupondole Ward-1, Lalitpur (adjacent to Bagmati Bridge), Nepal</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold text-slate-850 dark:text-slate-200 font-mono">Customer Hotline support</p>
              <p className="text-slate-400 mt-1">+977-1-4433221 | +977-9841234567</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold text-slate-850 dark:text-slate-200">Email Channels</p>
              <p className="text-slate-400 mt-1">sales@youthtech.com | support@youthtech.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <p className="font-bold mb-2 uppercase text-slate-400 tracking-wider text-[10px]">Corporate hours</p>
          <p className="font-semibold text-slate-500">Sunday - Friday: 10:00 AM to 7:00 PM (NPT)</p>
          <p className="font-semibold text-slate-500">Saturdays: Direct online live catalog shopping open, delivery on Sundays.</p>
        </div>
      </div>
    </div>
  );
}
