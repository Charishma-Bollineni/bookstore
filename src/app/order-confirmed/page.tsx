"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, Package } from "lucide-react";
import Navbar from "@/components/Navbar";

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
      {[
        [640,115,12,"#d4a830"],[820,280,9,"#d4a830"],[950,600,10,"#d4a830"],
        [430,490,8,"#d4a830"],[1200,420,9,"#e07830"],[290,350,7,"#d4a830"],
      ].map(([x,y,s,c],i) => (
        <rect key={i}
          x={Number(x)-Number(s)/2} y={Number(y)-Number(s)/2}
          width={s} height={s} fill={String(c)} opacity="0.85"
          transform={`rotate(45 ${x} ${y})`}
        />
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

// ─── Book cover ───────────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const ORDERED_BOOKS = [
  { id: "n1", title: "Joy of Minimalism",   author: "Daniel Reed",  description: "Declutter your life to uncover peace, clarity, and joy.",                format: "Paperback", categories: ["Non-fiction", "Self Help"], price: 149, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f0c040" },
  { id: "r3", title: "The Path to Success", author: "James Wright", description: "A practical guide to achieving goals with clarity and confidence.", format: "Paperback", categories: ["Non-fiction", "Self Help"], price: 359, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1d3557" },
];

const RETURN_REASONS = [
  "Damaged / defective item",
  "Wrong item received",
  "Item not as described",
  "Changed my mind",
  "Duplicate order",
  "Other",
];

// ─── Return Shipment Panel ────────────────────────────────────────────────────
function ReturnShipmentPanel() {
  const [open, setOpen]             = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [reason, setReason]         = useState("");
  const [notes, setNotes]           = useState("");
  const [submitted, setSubmitted]   = useState(false);

  const canSubmit = selectedBook !== null && reason !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedBook(null);
    setReason("");
    setNotes("");
    setOpen(false);
  };

  return (
    <div className="w-full border border-[#3a3a52] rounded-lg overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#1e1e2e] hover:bg-[#252535] transition-colors"
      >
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span className="text-gray-200 text-sm font-medium">Return Shipment</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="bg-[#18182a] px-4 py-4 flex flex-col gap-4">
          {submitted ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-semibold text-sm">Return Request Submitted!</p>
              <p className="text-gray-400 text-xs max-w-xs">
                A return label will be emailed to you within <span className="text-gray-200 font-medium">24 hours</span>.
                Pack the item securely and drop it off at any courier partner.
              </p>
              <div className="flex items-center gap-2 bg-[#2a2a38] border border-[#3a3a52] rounded-lg px-4 py-3 text-xs text-gray-300 w-full justify-center gap-3">
                <Package className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Tracking ID: <span className="text-white font-mono font-bold">RTN-{Date.now().toString().slice(-6)}</span></span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 mt-1"
              >
                Initiate another return
              </button>
            </div>
          ) : (
            <>
              {/* Step 1 — select book */}
              <div>
                <p className="text-gray-400 text-[11px] uppercase tracking-widest mb-2">Select item to return</p>
                <div className="flex flex-col gap-2">
                  {ORDERED_BOOKS.map(book => (
                    <button
                      key={book.id}
                      onClick={() => setSelectedBook(book.id)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border text-left transition-colors ${
                        selectedBook === book.id
                          ? "border-amber-500/60 bg-amber-500/10"
                          : "border-[#3a3a52] bg-[#2a2a38] hover:border-amber-500/30"
                      }`}
                    >
                      <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0">
                        <BookCover title={book.title} author={book.author} bg={book.coverBg} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{book.title}</p>
                        <p className="text-gray-400 text-[11px]">by {book.author}</p>
                        <p className="text-gray-400 text-[11px]">{book.currency}{book.price} · {book.format}</p>
                      </div>
                      {selectedBook === book.id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — reason */}
              <div>
                <p className="text-gray-400 text-[11px] uppercase tracking-widest mb-2">Reason for return</p>
                <div className="flex flex-wrap gap-2">
                  {RETURN_REASONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        reason === r
                          ? "border-amber-500 bg-amber-500/15 text-amber-300"
                          : "border-[#3a3a52] text-gray-400 hover:border-amber-500/40 hover:text-gray-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 — optional notes */}
              <div>
                <p className="text-gray-400 text-[11px] uppercase tracking-widest mb-2">Additional notes <span className="normal-case text-gray-600">(optional)</span></p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe the issue…"
                  className="w-full bg-[#2a2a38] border border-[#3a3a52] text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500/60 placeholder-gray-600 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Initiate Return
              </button>

              <p className="text-gray-600 text-[10px] text-center">
                Returns accepted within 7 days of delivery. Free return pickup included.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1a4a6a]">
      <Navbar cartCount={0} />

      <div className="flex-1 relative flex items-center justify-center py-8 px-4">
        <BooksBg />

        {/* Confirmation panel */}
        <div className="relative z-10 bg-[#2a2a38] rounded-lg shadow-2xl w-full max-w-[580px] px-5 sm:px-8 py-8 flex flex-col items-center gap-6">

          {/* Green check icon */}
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Heading */}
          <p className="text-white text-base text-center leading-snug">
            Your purchase of the<br />following reads is successful
          </p>

          {/* Book cards — two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            {ORDERED_BOOKS.map((book) => (
              <div key={book.id} className="flex gap-3">
                <div className="flex-shrink-0 w-[90px] h-[130px] rounded overflow-hidden">
                  <BookCover title={book.title} author={book.author} bg={book.coverBg} />
                </div>
                <div className="flex flex-col gap-1 min-w-0 py-0.5">
                  <h3 className="text-white font-semibold text-sm leading-tight">{book.title}</h3>
                  <p className="text-gray-400 text-xs">
                    by <Link href={`/book/${book.id}`} className="text-blue-400 hover:underline">{book.author}</Link>
                  </p>
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
                  <p className="text-white font-bold text-sm mt-0.5">{book.currency}{book.price}</p>
                  <p className="text-gray-400 text-[11px]">
                    Delivery by <span className="text-gray-200 font-semibold">{book.deliveryDate}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Return Shipment ── */}
          <div className="w-full">
            <ReturnShipmentPanel />
          </div>

          {/* Continue Shopping button */}
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#5b4fcf] hover:bg-[#4a3fbf] text-white font-semibold px-8 py-2.5 rounded transition-colors text-sm"
          >
            Continue your Shopping
            <BookOpen className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
