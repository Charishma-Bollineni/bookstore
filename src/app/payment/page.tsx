"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Wallet, Gift, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Method = "credit" | "debit" | "upi" | "wallet" | "gift";

const METHODS: { id: Method; label: string; icon: React.ReactNode }[] = [
  { id: "credit", label: "Credit Card",  icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: "debit",  label: "Debit card",   icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: "upi",    label: "UPI",          icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "wallet", label: "Wallet",       icon: <Wallet className="w-3.5 h-3.5" /> },
  { id: "gift",   label: "Gift Points",  icon: <Gift className="w-3.5 h-3.5" /> },
];

// ─── Mock balances ────────────────────────────────────────────────────────────
const WALLET_BALANCES: Record<string, number> = {
  "Paytm Wallet":   1250,
  "PhonePe Wallet": 800,
  "Amazon Pay":     450,
  "Mobikwik":       320,
};
const GIFT_POINTS_BALANCE = 350;   // 1 pt = ₹1

// ─── Gateway steps ────────────────────────────────────────────────────────────
const GATEWAY_STEPS = [
  { label: "Connecting to gateway",     icon: <Loader2 className="w-4 h-4 animate-spin" />,  ms: 1200 },
  { label: "Authorizing payment",       icon: <ShieldCheck className="w-4 h-4" />,            ms: 1400 },
  { label: "Confirming transaction",    icon: <CheckCircle2 className="w-4 h-4" />,           ms: 900  },
];

function genTxnId() {
  return "TXN" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ─── Background SVG ───────────────────────────────────────────────────────────
function BooksBg() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1366 768" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1260" cy="-30" r="190" fill="#1a6a7a" opacity="0.55" />
      <circle cx="1366" cy="90" r="100" fill="#e07830" opacity="0.85" />
      <circle cx="1210" cy="-40" r="140" fill="none" stroke="#1e8a9a" strokeWidth="2" opacity="0.4" />
      <circle cx="120" cy="680" r="160" fill="#1a6a7a" opacity="0.4" />
      <g transform="translate(160,200) rotate(-18)">
        <rect x="0" y="8" width="120" height="160" rx="4" fill="#e8dcc8" />
        <rect x="0" y="8" width="14" height="160" rx="3" fill="#c87830" />
        <rect x="14" y="0" width="106" height="168" rx="4" fill="#e07830" />
        <rect x="30" y="40" width="60" height="45" rx="3" fill="#b03020" />
        <rect x="25" y="98" width="70" height="4" rx="2" fill="#c86820" opacity="0.6" />
        <rect x="25" y="108" width="50" height="4" rx="2" fill="#c86820" opacity="0.4" />
      </g>
      <g transform="translate(1050,20) rotate(6)">
        <rect x="0" y="0" width="14" height="200" rx="3" fill="#0e5a6a" />
        <rect x="14" y="0" width="100" height="200" rx="4" fill="#1a8a9a" />
        <rect x="24" y="30" width="70" height="8" rx="2" fill="#0e7a8a" opacity="0.5" />
        <rect x="24" y="46" width="50" height="5" rx="2" fill="#0e7a8a" opacity="0.35" />
      </g>
      <g transform="translate(80,580)">
        <rect x="0" y="60" width="200" height="38" rx="5" fill="#1a8a9a" />
        <rect x="0" y="60" width="18" height="38" rx="4" fill="#0e6a7a" />
        <rect x="8" y="30" width="185" height="35" rx="5" fill="#1a4a6a" />
        <rect x="8" y="30" width="15" height="35" rx="4" fill="#0e3a5a" />
        <rect x="12" y="2" width="175" height="32" rx="5" fill="#d4a830" />
        <rect x="12" y="2" width="14" height="32" rx="4" fill="#b08820" />
      </g>
      <g transform="translate(820,620) rotate(-5)">
        <path d="M0,0 C0,-8 80,-12 100,-6 L100,120 C80,126 0,130 0,120 Z" fill="#e8dcc8" />
        <path d="M100,-6 C120,-12 200,-8 200,0 L200,120 C200,130 120,126 100,120 Z" fill="#f0e4d0" />
        <rect x="96" y="-8" width="8" height="136" rx="2" fill="#c8a870" opacity="0.5" />
        <line x1="18" y1="30" x2="85" y2="28" stroke="#c8b898" strokeWidth="2" />
        <line x1="18" y1="44" x2="85" y2="42" stroke="#c8b898" strokeWidth="2" />
        <line x1="18" y1="58" x2="75" y2="56" stroke="#c8b898" strokeWidth="2" />
        <line x1="115" y1="30" x2="182" y2="28" stroke="#c8b898" strokeWidth="2" />
        <line x1="115" y1="44" x2="182" y2="42" stroke="#c8b898" strokeWidth="2" />
        <line x1="115" y1="58" x2="172" y2="56" stroke="#c8b898" strokeWidth="2" />
      </g>
      {[[640,115,12,"#d4a830"],[820,280,9,"#d4a830"],[950,600,10,"#d4a830"],[430,490,8,"#d4a830"],[1200,420,9,"#e07830"],[290,350,7,"#d4a830"]].map(([x,y,s,c],i) => (
        <rect key={i} x={Number(x)-Number(s)/2} y={Number(y)-Number(s)/2} width={s} height={s} fill={String(c)} opacity="0.85" transform={`rotate(45 ${x} ${y})`} />
      ))}
      <rect x="330" y="358" width="12" height="12" fill="#b03020" opacity="0.9" />
      <rect x="1220" y="330" width="10" height="10" fill="#3a8a3a" opacity="0.85" />
      <rect x="700" y="600" width="11" height="11" fill="#d4a830" opacity="0.8" />
      <path d="M50,310 Q120,280 180,330 Q230,370 280,340" stroke="#c87830" strokeWidth="2.5" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M900,440 Q970,400 1040,460 Q1100,510 1160,470" stroke="#c87830" strokeWidth="2.5" fill="none" opacity="0.45" strokeLinecap="round"/>
      <path d="M600,680 Q660,650 720,675 Q780,700 840,670" stroke="#1a8a9a" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
    </svg>
  );
}

const fieldCls = "w-full bg-[#3a3a4a] text-gray-200 text-sm rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5b4fcf] placeholder-gray-500 border border-transparent focus:border-[#5b4fcf]/40";

// ─── Gateway Processing Screen ────────────────────────────────────────────────
function GatewayScreen({ onDone, onFail }: { onDone: (txnId: string) => void; onFail: () => void }) {
  const [step, setStep] = useState(0);          // 0-2 active steps
  const [done, setDone] = useState<boolean[]>([]); // completed steps
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Simulate a 5% random gateway failure
    const willFail = Math.random() < 0.05;
    let elapsed = 0;
    const total = GATEWAY_STEPS.reduce((s, g) => s + g.ms, 0);

    const run = async () => {
      for (let i = 0; i < GATEWAY_STEPS.length; i++) {
        setStep(i);
        const ms = GATEWAY_STEPS[i].ms;
        // Animate progress bar smoothly within each step
        const startPct = (elapsed / total) * 100;
        const endPct   = ((elapsed + ms) / total) * 100;
        const ticks    = 20;
        for (let t = 0; t <= ticks; t++) {
          await new Promise(r => setTimeout(r, ms / ticks));
          setProgress(startPct + (endPct - startPct) * (t / ticks));
        }
        elapsed += ms;
        setDone(prev => [...prev, true]);
        // Inject failure at last step if decided
        if (willFail && i === GATEWAY_STEPS.length - 1) {
          setFailed(true);
          setTimeout(onFail, 1200);
          return;
        }
      }
      setProgress(100);
      onDone(genTxnId());
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div className="bg-[#2a2a38] rounded-lg w-[480px] shadow-2xl flex flex-col items-center gap-5 py-12 px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-white font-bold text-lg">Payment Failed</h2>
        <p className="text-gray-400 text-sm">The gateway declined your transaction. Please try again or use a different payment method.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a38] rounded-lg w-[480px] shadow-2xl flex flex-col items-center gap-6 py-12 px-8">
      {/* Gateway logo strip */}
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-[#5b4fcf]" />
        <span className="text-white font-semibold text-sm">Secure Payment Gateway</span>
        <span className="text-[10px] text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">SSL</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#3a3a4a] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-[#5b4fcf] rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-400 text-xs">{Math.round(progress)}% complete</p>

      {/* Steps */}
      <div className="w-full flex flex-col gap-3">
        {GATEWAY_STEPS.map((s, i) => {
          const isDone    = i < step || done.length > i;
          const isActive  = i === step && done.length <= i;
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
              isDone  ? "border-emerald-500/30 bg-emerald-500/5"  :
              isActive? "border-[#5b4fcf]/50 bg-[#5b4fcf]/10"    :
              "border-[#3a3a4a] bg-[#3a3a4a]/30"
            }`}>
              <span className={isDone ? "text-emerald-400" : isActive ? "text-[#a99ef8]" : "text-gray-600"}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
              </span>
              <span className={`text-sm font-medium ${isDone ? "text-emerald-300" : isActive ? "text-white" : "text-gray-600"}`}>
                {s.label}
              </span>
              {isActive && <Loader2 className="w-3.5 h-3.5 text-[#a99ef8] animate-spin ml-auto" />}
              {isDone    && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
            </div>
          );
        })}
      </div>

      <p className="text-gray-600 text-[11px] flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" /> 256-bit encrypted · PCI-DSS compliant
      </p>
    </div>
  );
}

// ─── Payment Confirmation Receipt ─────────────────────────────────────────────
function ConfirmationScreen({
  txnId, total, method, onContinue,
}: {
  txnId: string; total: number; method: string; onContinue: () => void;
}) {
  const now = new Date().toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const rows = [
    { label: "Transaction ID",   value: txnId, mono: true },
    { label: "Amount Paid",      value: `₹${total}` },
    { label: "Payment Method",   value: method },
    { label: "Date & Time",      value: now },
    { label: "Status",           value: "Successful" },
  ];

  return (
    <div className="bg-[#2a2a38] rounded-lg w-[480px] shadow-2xl flex flex-col items-center gap-5 py-10 px-8">
      {/* Check */}
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <div className="text-center">
        <h2 className="text-white font-bold text-xl">Payment Confirmed!</h2>
        <p className="text-gray-400 text-sm mt-1">Your transaction was processed successfully.</p>
      </div>

      {/* Receipt */}
      <div className="w-full bg-[#1e1e2e] border border-[#3a3a4a] rounded-xl overflow-hidden">
        <div className="bg-[#5b4fcf]/10 border-b border-[#3a3a4a] px-4 py-2 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#a99ef8]" />
          <span className="text-[#a99ef8] text-xs font-semibold uppercase tracking-widest">Payment Receipt</span>
        </div>
        <div className="divide-y divide-[#2a2a3e]">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-gray-500 text-xs">{r.label}</span>
              <span className={`text-sm font-medium ${r.label === "Status" ? "text-emerald-400" : "text-gray-200"} ${r.mono ? "font-mono" : ""}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Refund policy note */}
      <div className="w-full flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3">
        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-300/80 text-xs">
          Refunds are processed within <span className="font-semibold text-amber-300">5–7 business days</span> to the original payment method if a return is initiated within 7 days of delivery.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 bg-[#5b4fcf] hover:bg-[#4a3fbf] text-white font-semibold py-3 rounded-lg transition-colors text-sm"
      >
        View Order <CheckCircle2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Payment Panel ────────────────────────────────────────────────────────────
function PaymentPanel({
  total, onGatewayStart,
}: {
  total: number;
  onGatewayStart: (method: string, finalAmount: number) => void;
}) {
  const [method, setMethod] = useState<Method>("credit");

  // Card
  const [cardNo, setCardNo] = useState("");
  const [nameOn, setNameOn] = useState("");
  const [cvv,    setCvv]    = useState("");
  const [expiry, setExpiry] = useState("");

  // Debit
  const [dCardNo, setDCardNo] = useState("");
  const [dName,   setDName]   = useState("");
  const [dCvv,    setDCvv]    = useState("");
  const [dExpiry, setDExpiry] = useState("");

  // UPI
  const [upiId, setUpiId] = useState("");

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const walletBal = selectedWallet ? WALLET_BALANCES[selectedWallet] : 0;
  const walletPay = selectedWallet ? Math.min(walletBal, total) : 0;
  const walletInsufficient = selectedWallet !== null && walletBal < total;

  // Gift Points
  const [useAllPoints, setUseAllPoints]     = useState(false);
  const giftDiscount = useAllPoints ? Math.min(GIFT_POINTS_BALANCE, total) : 0;
  const giftRemaining = total - giftDiscount;

  const formatCardNo = (v: string) =>
    v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1-").replace(/-$/,"");
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g,"").slice(0,6);
    return d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d;
  };

  const canPay = (): boolean => {
    if (method === "credit") return cardNo.replace(/-/g,"").length === 16 && !!nameOn && cvv.length === 3 && expiry.length >= 6;
    if (method === "debit")  return dCardNo.replace(/-/g,"").length === 16 && !!dName && dCvv.length === 3 && dExpiry.length >= 6;
    if (method === "upi")    return upiId.includes("@");
    if (method === "wallet") return selectedWallet !== null && !walletInsufficient;
    if (method === "gift")   return giftDiscount > 0;
    return false;
  };

  const getFinalAmount = (): number => {
    if (method === "wallet") return total - walletPay;
    if (method === "gift")   return giftRemaining;
    return total;
  };

  const getMethodLabel = (): string => {
    if (method === "credit") return "Credit Card";
    if (method === "debit")  return "Debit Card";
    if (method === "upi")    return `UPI (${upiId})`;
    if (method === "wallet") return selectedWallet ?? "Wallet";
    if (method === "gift")   return "Gift Points";
    return "Unknown";
  };

  const handlePay = () => {
    if (!canPay()) return;
    onGatewayStart(getMethodLabel(), getFinalAmount());
  };

  return (
    <div className="bg-[#2a2a38] rounded-lg overflow-hidden w-full max-w-[560px] shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-7 pt-5 pb-4 gap-1">
        <h2 className="text-white font-semibold text-lg sm:text-xl">Complete Payment</h2>
        <span className="text-white font-bold text-base sm:text-xl">Payable Amount: ₹{total}</span>
      </div>

      <div className="flex flex-col sm:flex-row border-t border-[#3a3a4a]">
        {/* Method nav — horizontal scroll on mobile, vertical sidebar on sm+ */}
        <div className="sm:w-[155px] sm:flex-shrink-0 sm:border-r border-b sm:border-b-0 border-[#3a3a4a] flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible py-1 sm:py-2">
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`relative shrink-0 text-left px-4 sm:px-5 py-3 sm:py-[14px] text-sm transition-colors whitespace-nowrap ${
                method === m.id ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {/* Active indicator: bottom border on mobile, left border on desktop */}
              {method === m.id && (
                <>
                  <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#5b4fcf] rounded-t sm:hidden" />
                  <span className="hidden sm:block absolute left-0 top-2 bottom-2 w-[3px] bg-[#5b4fcf] rounded-r" />
                </>
              )}
              {m.label}
            </button>
          ))}
        </div>

        {/* Form area */}
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">

          {/* ── Credit Card ── */}
          {method === "credit" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">Card Number</label>
                  <input value={cardNo} onChange={e => setCardNo(formatCardNo(e.target.value))} placeholder="XXXX-XXXX-XXXX-XXXX" className={fieldCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">Name on Card</label>
                  <input value={nameOn} onChange={e => setNameOn(e.target.value)} placeholder="Name" className={fieldCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">CVV</label>
                  <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="XXX" type="password" className={fieldCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">Date of Expiry</label>
                  <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YYYY" className={fieldCls} />
                </div>
              </div>
            </>
          )}

          {/* ── Debit Card ── */}
          {method === "debit" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">Card Number</label>
                  <input value={dCardNo} onChange={e => setDCardNo(formatCardNo(e.target.value))} placeholder="XXXX-XXXX-XXXX-XXXX" className={fieldCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">Name on Card</label>
                  <input value={dName} onChange={e => setDName(e.target.value)} placeholder="Name" className={fieldCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">CVV</label>
                  <input value={dCvv} onChange={e => setDCvv(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="XXX" type="password" className={fieldCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs">Date of Expiry</label>
                  <input value={dExpiry} onChange={e => setDExpiry(formatExpiry(e.target.value))} placeholder="MM/YYYY" className={fieldCls} />
                </div>
              </div>
            </>
          )}

          {/* ── UPI ── */}
          {method === "upi" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs">UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className={fieldCls} />
              <p className="text-gray-500 text-[11px]">Enter your UPI ID linked to your bank account.</p>
            </div>
          )}

          {/* ── Wallet ── */}
          {method === "wallet" && (
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-xs">Select Wallet</p>
              {Object.entries(WALLET_BALANCES).map(([name, bal]) => {
                const sel = selectedWallet === name;
                const sufficient = bal >= total;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedWallet(name)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors border ${
                      sel
                        ? "border-[#5b4fcf] bg-[#5b4fcf]/10"
                        : "bg-[#3a3a4a] border-transparent hover:border-[#5a5a6a]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className={`w-4 h-4 ${sel ? "text-[#a99ef8]" : "text-gray-500"}`} />
                      <span className={sel ? "text-white font-semibold" : "text-gray-300"}>{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${sufficient ? "text-emerald-400" : "text-red-400"}`}>
                        ₹{bal}
                      </span>
                      {!sufficient && <span className="text-[10px] text-red-400 border border-red-400/30 px-1 rounded">Low</span>}
                    </div>
                  </button>
                );
              })}
              {selectedWallet && !walletInsufficient && (
                <div className="mt-1 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 text-xs">
                  <span className="text-emerald-300">Wallet balance used</span>
                  <span className="text-emerald-400 font-bold">−₹{walletPay}</span>
                </div>
              )}
              {walletInsufficient && (
                <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Insufficient balance. Choose another wallet or method.
                </p>
              )}
            </div>
          )}

          {/* ── Gift Points ── */}
          {method === "gift" && (
            <div className="flex flex-col gap-3">
              {/* Balance card */}
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-300 font-bold text-xl">{GIFT_POINTS_BALANCE} pts</p>
                    <p className="text-amber-400/70 text-xs">Available gift points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-300 font-bold text-sm">≡ ₹{GIFT_POINTS_BALANCE}</p>
                  <p className="text-amber-400/70 text-xs">1 pt = ₹1</p>
                </div>
              </div>

              {/* Toggle full redemption */}
              <label className="flex items-center gap-3 cursor-pointer bg-[#3a3a4a] rounded-lg px-4 py-3">
                <input
                  type="checkbox"
                  checked={useAllPoints}
                  onChange={e => setUseAllPoints(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-gray-200 text-sm font-medium">Redeem all {GIFT_POINTS_BALANCE} points</p>
                  <p className="text-gray-500 text-xs">
                    {GIFT_POINTS_BALANCE >= total
                      ? `Covers full amount (₹${total})`
                      : `Covers ₹${GIFT_POINTS_BALANCE} of ₹${total}`}
                  </p>
                </div>
                {useAllPoints && (
                  <span className="text-amber-400 font-bold text-sm">−₹{giftDiscount}</span>
                )}
              </label>

              {useAllPoints && giftRemaining > 0 && (
                <div className="flex items-center justify-between bg-[#3a3a4a] rounded-lg px-4 py-3 text-xs">
                  <span className="text-gray-400">Remaining amount to pay</span>
                  <span className="text-white font-bold">₹{giftRemaining}</span>
                </div>
              )}
              {useAllPoints && giftRemaining === 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-emerald-300 text-xs font-medium">Full amount covered by gift points. No additional payment needed.</p>
                </div>
              )}
            </div>
          )}

          {/* Pay Now */}
          <div className="flex justify-end mt-auto pt-2">
            <button
              onClick={handlePay}
              disabled={!canPay()}
              className="flex items-center gap-2 bg-[#5b4fcf] hover:bg-[#4a3fbf] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-2.5 rounded transition-colors text-sm"
            >
              Pay Now
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Stage = "form" | "gateway" | "confirmed";

export default function PaymentPage() {
  const { user, isLoggedIn } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const totalParam   = searchParams.get("total");
  const total        = totalParam ? parseInt(totalParam, 10) : 580;

  const [stage,     setStage]     = useState<Stage>("form");
  const [txnId,     setTxnId]     = useState("");
  const [paidWith,  setPaidWith]  = useState("");
  const [paidAmount, setPaidAmount] = useState(total);

  useEffect(() => {
    if (!isLoggedIn || !user?.entitlements.canCheckout) {
      router.replace(isLoggedIn ? "/" : "/login");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user?.entitlements.canCheckout) return null;

  const handleGatewayStart = (method: string, amount: number) => {
    setPaidWith(method);
    setPaidAmount(amount);
    setStage("gateway");
  };

  const handleGatewayDone = (id: string) => {
    setTxnId(id);
    setStage("confirmed");
  };

  const handleGatewayFail = () => {
    // Return to form after a brief pause so user can retry
    setTimeout(() => setStage("form"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a4a6a]">
      <Navbar cartCount={2} />

      <div className="flex-1 relative flex items-center justify-center py-8 px-4">
        <BooksBg />

        <div className="relative z-10 w-full flex justify-center">
          {stage === "form" && (
            <PaymentPanel total={total} onGatewayStart={handleGatewayStart} />
          )}
          {stage === "gateway" && (
            <GatewayScreen onDone={handleGatewayDone} onFail={handleGatewayFail} />
          )}
          {stage === "confirmed" && (
            <ConfirmationScreen
              txnId={txnId}
              total={paidAmount}
              method={paidWith}
              onContinue={() => router.push("/order-confirmed")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
