"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Minus, Plus, CreditCard, Gift, X, Truck, Zap, Clock, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Shipping data ────────────────────────────────────────────────────────────
type ShippingMethod = "standard" | "express" | "sameday";

interface ShippingOption {
  id: ShippingMethod;
  label: string;
  description: string;
  baseFee: number;          // ₹ per order
  perItemFee: number;       // ₹ extra per item beyond first
  daysMin: number;
  daysMax: number;
  icon: React.ReactNode;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "Regular postal service",
    baseFee: 0,
    perItemFee: 0,
    daysMin: 5,
    daysMax: 7,
    icon: <Truck className="w-4 h-4" />,
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "Priority courier",
    baseFee: 49,
    perItemFee: 20,
    daysMin: 2,
    daysMax: 3,
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "sameday",
    label: "Same-Day Delivery",
    description: "Order before 12 PM",
    baseFee: 99,
    perItemFee: 30,
    daysMin: 0,
    daysMax: 0,
    icon: <Clock className="w-4 h-4" />,
  },
];

// Add N calendar days to today, skipping Sundays
function addBusinessDays(days: number): string {
  if (days === 0) return "Today";
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;   // skip Sunday
  }
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function calcShippingFee(option: ShippingOption, totalItems: number): number {
  if (totalItems === 0) return 0;
  return option.baseFee + Math.max(0, totalItems - 1) * option.perItemFee;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartBook {
  id: string;
  title: string;
  author: string;
  description: string;
  format: string;
  categories: string[];
  price: number;
  currency: string;
  deliveryDate: string;
  coverBg: string;
  qty: number;
}

// ─── Cover ────────────────────────────────────────────────────────────────────
function BookCover({ title, author, bg }: { title: string; author: string; bg: string }) {
  const words = title.toUpperCase().split(" ");
  const chunks: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length + w.length > 9 && cur.length > 0) { chunks.push(cur.trim()); cur = w + " "; }
    else cur += w + " ";
  }
  if (cur.trim()) chunks.push(cur.trim());
  const isDark = ["#e63946","#1d3557","#1a2e4a","#6b2d6b","#0d3b5e","#1a3a2a","#3a1a6b","#0a2a4a","#8b1a3a"].includes(bg);
  const tc = isDark || bg === "#f48c1e" ? "#fff" : "#111";
  const sc = isDark || bg === "#f48c1e" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)";
  const fs = chunks.length > 3 ? "11px" : chunks.length === 3 ? "13px" : "16px";
  return (
    <div className="w-full h-full flex flex-col justify-between px-3 py-3" style={{ backgroundColor: bg }}>
      <p className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: sc }}>{author.split(" ")[0]}</p>
      <div className="flex-1 flex flex-col justify-center">
        {chunks.map((line, i) => (
          <p key={i} className="font-extrabold leading-tight text-center" style={{ color: tc, fontFamily: "Georgia, serif", fontSize: fs }}>{line}</p>
        ))}
      </div>
      <p className="text-[7px] font-bold uppercase tracking-widest text-center mt-1" style={{ color: sc }}>{author.toUpperCase()}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  // Guard: only members/admins can access cart
  useEffect(() => {
    if (!isLoggedIn || !user?.entitlements.canCheckout) {
      router.replace(isLoggedIn ? "/" : "/login");
    }
  }, [isLoggedIn, user, router]);

  const [items, setItems] = useState<CartBook[]>([
    { id: "n1", title: "Joy of Minimalism", author: "Daniel Reed", description: "Declutter your life to uncover peace, clarity, and joy.", format: "Paperback", categories: ["Non-fiction", "Self Help"], price: 149, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f0c040", qty: 1 },
    { id: "r3", title: "The Path to Success", author: "James Wright", description: "A practical guide to achieving goals with clarity and confidence.", format: "Paperback", categories: ["Non-fiction", "Self Help"], price: 359, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1d3557", qty: 1 },
  ]);

  // Address
  const [useSaved, setUseSaved] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [address, setAddress]     = useState("");
  const [email, setEmail]         = useState("");
  const [city, setCity]           = useState("");
  const [pin, setPin]             = useState("");
  const [phone, setPhone]         = useState("");
  const [state, setState]         = useState("");
  const [country, setCountry]     = useState("India");

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const selectedShipping = SHIPPING_OPTIONS.find(o => o.id === shippingMethod)!;
  const totalItems = useMemo(() => items.reduce((s, b) => s + b.qty, 0), [items]);
  const shippingFee = useMemo(() => calcShippingFee(selectedShipping, totalItems), [selectedShipping, totalItems]);
  const deliveryEstimate = useMemo(() => {
    const { daysMin, daysMax } = selectedShipping;
    if (daysMin === daysMax) return addBusinessDays(daysMin);
    const from = addBusinessDays(daysMin);
    const to   = addBusinessDays(daysMax);
    return `${from} – ${to}`;
  }, [selectedShipping]);

  // Gift points / coupon
  const [giftPoints]              = useState(200);  // available points
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [couponCode, setCouponCode]     = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Calculations
  const subtotal = items.reduce((s, b) => s + b.price * b.qty, 0);
  const tax = Math.round(subtotal * 0.12);
  const pointsDiscount = redeemPoints ? Math.min(giftPoints, subtotal) : 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const total = subtotal + tax + shippingFee - totalDiscount;

  const updateQty = (id: string, delta: number) =>
    setItems(prev => prev.map(b => b.id === id ? { ...b, qty: Math.max(1, b.qty + delta) } : b));

  const removeItem = (id: string) => setItems(prev => prev.filter(b => b.id !== id));

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "BOOK10") {
      setCouponDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
    }
  };

  // Pre-fill saved address
  const handleUseSaved = (checked: boolean) => {
    setUseSaved(checked);
    if (checked) {
      setFirstName("Charish"); setLastName("ma");
      setAddress("123 Book Street, Koramangala");
      setEmail("charish@email.com"); setCity("Bangalore");
      setPin("560034"); setPhone("9876543210");
      setState("Karnataka"); setCountry("India");
    } else {
      setFirstName(""); setLastName(""); setAddress("");
      setEmail(""); setCity(""); setPin("");
      setPhone(""); setState(""); setCountry("India");
    }
  };

  const inputCls = "w-full bg-[#2d2d3e] text-gray-200 text-xs rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 border-0";

  const crumbs = ["Home", "Non-Fiction", "Self Help", "Joy of Minimalism", "Checkout"];

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar cartCount={items.length} />

      <div className="flex flex-col px-4 sm:px-5 py-3 gap-3">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs flex-wrap">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-500" />}
              {i < crumbs.length - 1
                ? <Link href="/" className="text-blue-400 hover:underline">{c}</Link>
                : <span className="text-gray-300">{c}</span>}
              {i === crumbs.length - 1 && <ChevronRight className="w-3 h-3 text-gray-500" />}
            </span>
          ))}
        </nav>

        <h1 className="text-white font-bold text-base flex-shrink-0">Shopping Cart</h1>

        {/* ── Cart Items ── */}
        <div className="bg-[#1e1e2e] rounded-lg border border-[#2a2a3e] px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map(book => (
              <div key={book.id} className="flex gap-3 relative">
                <button onClick={() => removeItem(book.id)} className="absolute top-0 right-0 text-gray-600 hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
                {/* Cover */}
                <div className="flex-shrink-0 w-[100px] h-[140px] rounded overflow-hidden" style={{ backgroundColor: book.coverBg }}>
                  <BookCover title={book.title} author={book.author} bg={book.coverBg} />
                </div>
                {/* Info */}
                <div className="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white font-semibold text-xs leading-tight">{book.title}</h3>
                    <p className="text-xs">by <Link href={`/book/${book.id}`} className="text-blue-400 hover:underline">{book.author}</Link></p>
                    <p className="text-gray-400 text-[11px] leading-snug line-clamp-2">{book.description}</p>
                    <p className="text-gray-400 text-[11px]">{book.format}</p>
                    <div className="flex flex-wrap gap-0.5">
                      {book.categories.map((cat, i) => (
                        <span key={cat} className="text-[11px]">
                          <Link href="/" className="text-blue-400 hover:underline">{cat}</Link>
                          {i < book.categories.length - 1 && <span className="text-gray-500">, </span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">{book.currency}{book.price * book.qty}</p>
                    <p className="text-gray-400 text-[10px]">Delivery by <span className="font-bold text-gray-200">{book.deliveryDate}</span></p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-white text-xs font-medium w-3 text-center">{book.qty}</span>
                      <div className="flex items-center border-b border-[#3a3a52]">
                        <button onClick={() => updateQty(book.id, -1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <div className="w-px h-3 bg-[#3a3a52] mx-0.5" />
                        <button onClick={() => updateQty(book.id, 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Row: Address + Order Summary ── */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ── Address Form ── */}
          <div className="flex-1 bg-[#222230] rounded-lg px-4 sm:px-5 py-4 flex flex-col gap-3">
            <h2 className="text-white font-semibold text-base flex-shrink-0">Address</h2>

            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer w-fit flex-shrink-0">
              <input type="checkbox" checked={useSaved} onChange={e => handleUseSaved(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer rounded" />
              Use Saved Address
            </label>

            {/* Row 1: First Name / Last Name / Address */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-gray-400 text-xs mb-1.5 block">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-xs mb-1.5 block">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className={inputCls} />
              </div>
              <div className="flex-[2]">
                <label className="text-gray-400 text-xs mb-1.5 block">Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address Line 2" className={inputCls} />
              </div>
            </div>

            {/* Row 2: e-mail / City / Pin */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-[2]">
                <label className="text-gray-400 text-xs mb-1.5 block">e-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e-mail" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-xs mb-1.5 block">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-xs mb-1.5 block">Pin</label>
                <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/,"").slice(0,6))} placeholder="000000" className={inputCls} />
              </div>
            </div>

            {/* Row 3: Phone / State / Country */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Phone: +91 dropdown + number */}
              <div className="flex-[2]">
                <label className="text-gray-400 text-xs mb-1.5 block">Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative w-[72px] flex-shrink-0">
                    <select className="w-full h-full bg-[#2d2d3e] text-gray-200 text-xs rounded px-2 py-2 focus:outline-none appearance-none cursor-pointer border-0">
                      <option className="bg-[#2d2d3e]">+91</option>
                      <option className="bg-[#2d2d3e]">+1</option>
                      <option className="bg-[#2d2d3e]">+44</option>
                    </select>
                    <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                  <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/,"").slice(0,10))} placeholder="12345567890" className={inputCls} />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-xs mb-1.5 block">State</label>
                <input value={state} onChange={e => setState(e.target.value)} placeholder="State" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-xs mb-1.5 block">Country</label>
                <div className="relative">
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full bg-[#2d2d3e] text-gray-200 text-xs rounded px-3 py-2 focus:outline-none appearance-none cursor-pointer border-0 pr-7">
                    {["India","USA","UK","Australia","Canada"].map(c => <option key={c} className="bg-[#2d2d3e]">{c}</option>)}
                  </select>
                  <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Grand Total ── */}
          <div className="w-full lg:w-[460px] lg:flex-shrink-0 bg-[#222230] rounded-lg overflow-hidden flex flex-row">

            {/* Left: illustration panel */}
            <div className="w-[150px] flex-shrink-0 bg-gradient-to-b from-[#1a3a6a] via-[#1a3060] to-[#0d1a40] relative overflow-hidden flex flex-col items-center justify-center gap-3 p-3">
              {/* Books illustration */}
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Book stack top */}
                <div className="flex items-end gap-1.5 justify-center">
                  <div className="w-8 h-11 rounded-sm bg-orange-500 transform -rotate-6 shadow" />
                  <div className="w-7 h-14 rounded-sm bg-blue-400 shadow" />
                </div>
                {/* Open book bottom */}
                <div className="w-20 h-10 relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-l-sm bg-yellow-200 transform -skew-x-3 shadow" />
                  <div className="w-10 h-10 rounded-r-sm bg-amber-100 transform skew-x-3 shadow" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-amber-700 rounded" />
                </div>
              </div>
              {/* Decorative dots & lines */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400 opacity-70"
                  style={{ top: `${10 + (i * 15) % 80}%`, left: `${10 + (i * 23) % 75}%` }} />
              ))}
              <div className="absolute top-4 right-4 w-12 h-0.5 bg-orange-400 opacity-40 rotate-45" />
              <div className="absolute bottom-8 left-3 w-10 h-0.5 bg-blue-300 opacity-30 -rotate-12" />
            </div>

            {/* Right: totals content */}
            <div className="flex-1 flex flex-col justify-between p-4 gap-2 overflow-y-auto">
              <h2 className="text-white font-semibold text-base">Grand Total</h2>

              {/* ── Shipping method selector ── */}
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-400 text-[11px] font-medium uppercase tracking-widest">Shipping Method</p>
                {SHIPPING_OPTIONS.map(opt => {
                  const fee = calcShippingFee(opt, totalItems);
                  const isSelected = shippingMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setShippingMethod(opt.id)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-left transition-colors ${
                        isSelected
                          ? "border-[#5b4fcf] bg-[#5b4fcf]/10"
                          : "border-[#3a3a52] bg-[#2d2d3e] hover:border-[#5b4fcf]/50"
                      }`}
                    >
                      {isSelected
                        ? <CheckCircle2 className="w-4 h-4 text-[#5b4fcf] flex-shrink-0" />
                        : <span className="w-4 h-4 rounded-full border border-[#5a5a72] flex-shrink-0" />
                      }
                      <span className={`flex-shrink-0 ${isSelected ? "text-[#a99ef8]" : "text-gray-400"}`}>{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-white" : "text-gray-300"}`}>{opt.label}</p>
                        <p className="text-[10px] text-gray-500">{opt.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>
                          {fee === 0 ? "Free" : `₹${fee}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {/* Approximate delivery time */}
                <div className="flex items-center gap-1.5 mt-0.5 px-1">
                  <Truck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <p className="text-[11px] text-emerald-400 font-medium">
                    Est. delivery: <span className="font-bold">{deliveryEstimate}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Price ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                  <span className="text-gray-200">₹{subtotal}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax (12%)</span>
                  <span className="text-gray-200">₹{tax}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Delivery Charges</span>
                  <span className={shippingFee === 0 ? "text-emerald-400 font-medium" : "text-gray-200"}>
                    {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <input value={couponCode}
                  onChange={e => { setCouponCode(e.target.value); setCouponApplied(false); setCouponDiscount(0); }}
                  placeholder="Apply Coupon" disabled={couponApplied}
                  className="flex-1 bg-[#2d2d3e] text-gray-300 placeholder-gray-500 text-xs rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 border-0" />
                <button onClick={handleApplyCoupon} disabled={couponApplied || !couponCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded transition-colors whitespace-nowrap">
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {couponApplied && <p className="text-green-400 text-xs">BOOK10 applied! −₹{couponDiscount}</p>}

              {/* Gift points */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={redeemPoints} onChange={e => setRedeemPoints(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer" />
                  <Gift className="w-3.5 h-3.5 text-yellow-400" />
                  Redeem Gift Points
                </label>
                <span className="text-yellow-400 text-xs font-semibold">{giftPoints} pts</span>
              </div>
              {redeemPoints && <p className="text-green-400 text-xs">−₹{pointsDiscount} applied</p>}

              <div className="border-t border-[#3a3a52]" />

              {/* Discount */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Discount</span>
                <span className="text-gray-200">₹{totalDiscount || 100}</span>
              </div>

              <div className="border-t border-[#3a3a52]" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-sm">Total Amount</span>
                <span className="text-white font-bold text-lg">₹{total}</span>
              </div>

              {/* Pay Now */}
              <button onClick={() => router.push(`/payment?total=${total}`)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-colors text-sm">
                Pay Now <CreditCard className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
