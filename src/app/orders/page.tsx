"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Package, RotateCcw, ChevronDown, Search, Truck, CheckCircle2, Clock, XCircle, ArrowLeftRight, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderBook {
  id: string;
  title: string;
  author: string;
  price: number;
  coverBg: string;
  format: string;
}

interface Order {
  orderId: string;
  date: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
  total: number;
  books: OrderBook[];
  address: string;
  paymentMethod: string;
}

type ReturnStatus = "Requested" | "Pickup Scheduled" | "In Transit" | "Refunded";

interface ReturnRequest {
  returnId: string;
  orderId: string;
  date: string;
  book: OrderBook;
  reason: string;
  status: ReturnStatus;
  trackingId: string;
  refundAmount: number;
}

// ─── Orders data ──────────────────────────────────────────────────────────────
const INITIAL_ORDERS: Order[] = [
  {
    orderId: "ORD-2024-001",
    date: "12 Jun 2024",
    status: "Delivered",
    total: 698,
    address: "123, MG Road, Bengaluru - 560001",
    paymentMethod: "Credit Card",
    books: [
      { id: "r1", title: "The Art of Focus",   author: "Arjun Patel",  price: 399, coverBg: "#f5f0e8", format: "Paperback" },
      { id: "b1", title: "The Midnight Hour",  author: "James Adams",  price: 299, coverBg: "#1a2e4a", format: "Paperback" },
    ],
  },
  {
    orderId: "ORD-2024-002",
    date: "28 May 2024",
    status: "Delivered",
    total: 259,
    address: "123, MG Road, Bengaluru - 560001",
    paymentMethod: "UPI",
    books: [
      { id: "r2", title: "The Art of Learning", author: "Raj Patel", price: 259, coverBg: "#e63946", format: "Paperback" },
    ],
  },
  {
    orderId: "ORD-2024-003",
    date: "10 May 2024",
    status: "Shipped",
    total: 648,
    address: "456, Park Street, Kolkata - 700016",
    paymentMethod: "Wallet",
    books: [
      { id: "b2", title: "Beneath the Stars",  author: "Jessica Martin", price: 499, coverBg: "#6b2d6b", format: "Hard Cover" },
      { id: "n1", title: "Joy of Minimalism",  author: "Daniel Reed",    price: 149, coverBg: "#f0c040", format: "Paperback"  },
    ],
  },
  {
    orderId: "ORD-2024-004",
    date: "02 Apr 2024",
    status: "Cancelled",
    total: 359,
    address: "789, Anna Salai, Chennai - 600002",
    paymentMethod: "Credit Card",
    books: [
      { id: "b3", title: "The Final Frontier", author: "Laura Mitchell", price: 359, coverBg: "#0d3b5e", format: "Paperback" },
    ],
  },
  {
    orderId: "ORD-2024-005",
    date: "15 Mar 2024",
    status: "Processing",
    total: 428,
    address: "21, Linking Road, Mumbai - 400050",
    paymentMethod: "UPI",
    books: [
      { id: "f1", title: "Dragon's Keep", author: "Lena Brooks", price: 429, coverBg: "#3a1a6b", format: "Hardcover" },
    ],
  },
];

// ─── Returns data ─────────────────────────────────────────────────────────────
const RETURNS: ReturnRequest[] = [
  {
    returnId:     "RTN-2024-001",
    orderId:      "ORD-2024-001",
    date:         "18 Jun 2024",
    book:         { id: "b1", title: "The Midnight Hour", author: "James Adams", price: 299, coverBg: "#1a2e4a", format: "Paperback" },
    reason:       "Damaged / defective item",
    status:       "Refunded",
    trackingId:   "RTN-847291",
    refundAmount: 299,
  },
  {
    returnId:     "RTN-2024-002",
    orderId:      "ORD-2024-002",
    date:         "03 Jun 2024",
    book:         { id: "r2", title: "The Art of Learning", author: "Raj Patel", price: 259, coverBg: "#e63946", format: "Paperback" },
    reason:       "Wrong item received",
    status:       "In Transit",
    trackingId:   "RTN-512038",
    refundAmount: 259,
  },
  {
    returnId:     "RTN-2024-003",
    orderId:      "ORD-2024-001",
    date:         "20 Jun 2024",
    book:         { id: "r1", title: "The Art of Focus", author: "Arjun Patel", price: 399, coverBg: "#f5f0e8", format: "Paperback" },
    reason:       "Changed my mind",
    status:       "Pickup Scheduled",
    trackingId:   "RTN-630174",
    refundAmount: 399,
  },
];

// ─── Mini Cover ───────────────────────────────────────────────────────────────
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
  return (
    <div className="w-full h-full flex flex-col justify-between px-2 py-2" style={{ backgroundColor: bg }}>
      <p className="text-[6px] font-semibold uppercase tracking-widest" style={{ color: sc }}>{author.split(" ")[0]}</p>
      <div className="flex-1 flex flex-col justify-center">
        {chunks.map((line, i) => (
          <p key={i} className="font-extrabold leading-none text-center" style={{ color: tc, fontFamily: "Georgia, serif", fontSize: chunks.length > 3 ? "8px" : "9px" }}>{line}</p>
        ))}
      </div>
      <p className="text-[5px] font-bold uppercase tracking-widest text-center" style={{ color: sc }}>{author.toUpperCase()}</p>
    </div>
  );
}

// ─── Order status badge ───────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG = {
  Delivered:  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  Shipped:    { icon: Truck,         color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"    },
  Processing: { icon: Clock,         color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"  },
  Cancelled:  { icon: XCircle,       color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20"    },
};

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
}

// ─── Return status badge ──────────────────────────────────────────────────────
const RETURN_STATUS_CONFIG: Record<ReturnStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Requested":         { icon: Clock,         color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"  },
  "Pickup Scheduled":  { icon: Truck,         color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"   },
  "In Transit":        { icon: ArrowLeftRight, color: "text-purple-400", bg: "bg-purple-400/10",  border: "border-purple-400/20" },
  "Refunded":          { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20"},
};

function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const cfg = RETURN_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
}

// ─── Return progress stepper ──────────────────────────────────────────────────
const RETURN_STEPS: ReturnStatus[] = ["Requested", "Pickup Scheduled", "In Transit", "Refunded"];

function ReturnStepper({ status }: { status: ReturnStatus }) {
  const current = RETURN_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 w-full mt-3">
      {RETURN_STEPS.map((step, i) => {
        const done    = i <= current;
        const active  = i === current;
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                done
                  ? active
                    ? "bg-[#5b4fcf] border-[#5b4fcf]"
                    : "bg-emerald-500 border-emerald-500"
                  : "bg-[#2a2a3e] border-[#3a3a52]"
              }`}>
                {done && !active && <CheckCircle2 className="w-3 h-3 text-white" />}
                {active && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <p className={`text-[9px] font-medium text-center whitespace-nowrap ${done ? "text-gray-300" : "text-gray-600"}`}>
                {step}
              </p>
            </div>
            {i < RETURN_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded ${i < current ? "bg-emerald-500" : "bg-[#2a2a3e]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Return Card ──────────────────────────────────────────────────────────────
function ReturnCard({ ret }: { ret: ReturnRequest }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 px-4 sm:px-5 py-4">
        {/* Book cover */}
        <div className="w-9 h-12 sm:w-10 sm:h-14 rounded overflow-hidden border border-[#2a2a3e] shrink-0">
          <BookCover title={ret.book.title} author={ret.book.author} bg={ret.book.coverBg} />
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm truncate">{ret.book.title}</span>
            <ReturnStatusBadge status={ret.status} />
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-gray-400 text-xs">{ret.returnId}</span>
            <span className="text-gray-500 text-xs hidden sm:inline">•</span>
            <span className="text-gray-400 text-xs hidden sm:inline">Requested {ret.date}</span>
            <span className="text-gray-500 text-xs hidden sm:inline">•</span>
            <span className="text-gray-400 text-xs hidden sm:inline">{ret.reason}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 sm:hidden flex-wrap">
            <span className="text-gray-400 text-xs">{ret.reason}</span>
          </div>
        </div>

        {/* Refund + expand */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            <p className="text-white font-bold text-sm sm:text-base">₹{ret.refundAmount}</p>
            <p className="text-gray-500 text-xs">Refund</p>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[#2a2a3e] px-4 sm:px-5 py-4 bg-[#18182a]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Book detail */}
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-3">Item Returned</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-12 rounded overflow-hidden border border-[#2a2a3e] shrink-0">
                  <BookCover title={ret.book.title} author={ret.book.author} bg={ret.book.coverBg} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm font-medium truncate">{ret.book.title}</p>
                  <p className="text-gray-500 text-xs">{ret.book.author} · {ret.book.format}</p>
                  <p className="text-gray-400 text-xs mt-0.5">From order <span className="text-blue-400">{ret.orderId}</span></p>
                </div>
                <p className="text-gray-300 text-sm font-semibold shrink-0">₹{ret.book.price}</p>
              </div>
            </div>

            {/* Tracking */}
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-3">Return Tracking</p>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Tracking ID</p>
                  <p className="text-white font-mono font-bold text-sm">{ret.trackingId}</p>
                </div>
              </div>
              {ret.status === "Refunded" && (
                <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Refund of ₹{ret.refundAmount} credited
                </p>
              )}
            </div>
          </div>

          {/* Progress stepper */}
          <div className="mt-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">Return Progress</p>
            <ReturnStepper status={ret.status} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onBuyAgain,
  onCancel,
}: {
  order: Order;
  onBuyAgain: (o: Order) => void;
  onCancel: (orderId: string) => void;
}) {
  const [expanded, setExpanded]         = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const canCancel = order.status === "Processing" || order.status === "Shipped";

  return (
    <div className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl overflow-hidden">
      {/* ── Card header ── */}
      <div className="flex items-start gap-3 px-4 sm:px-5 py-4">
        {/* Book covers */}
        <div className="flex -space-x-2 shrink-0">
          {order.books.slice(0, 3).map((b) => (
            <div key={b.id} className="w-9 h-12 sm:w-10 sm:h-14 rounded overflow-hidden border border-[#2a2a3e] shrink-0">
              <BookCover title={b.title} author={b.author} bg={b.coverBg} />
            </div>
          ))}
          {order.books.length > 3 && (
            <div className="w-9 h-12 sm:w-10 sm:h-14 rounded bg-[#2a2a3e] flex items-center justify-center text-xs text-gray-400 border border-[#3a3a4e]">
              +{order.books.length - 3}
            </div>
          )}
        </div>

        {/* Middle info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{order.orderId}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-gray-400 text-xs">{order.date}</span>
            <span className="text-gray-500 text-xs hidden sm:inline">•</span>
            <span className="text-gray-400 text-xs hidden sm:inline">{order.books.length} {order.books.length === 1 ? "book" : "books"}</span>
            <span className="text-gray-500 text-xs hidden sm:inline">•</span>
            <span className="text-gray-400 text-xs hidden sm:inline">{order.paymentMethod}</span>
          </div>
          {/* Mobile-only second line */}
          <div className="flex items-center gap-2 mt-0.5 sm:hidden flex-wrap">
            <span className="text-gray-400 text-xs">{order.books.length} {order.books.length === 1 ? "book" : "books"}</span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Right: amount + actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            <p className="text-white font-bold text-sm sm:text-base">₹{order.total}</p>
            <p className="text-gray-500 text-xs">Total</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {canCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-2 py-1 rounded-lg transition-colors"
              >
                <XCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            )}
            <button
              onClick={() => onBuyAgain(order)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 px-2 py-1 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Buy Again</span>
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Cancel confirmation strip ── */}
      {confirmCancel && (
        <div className="border-t border-red-500/20 bg-red-500/5 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-start gap-2 flex-1">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs">
              Cancel <span className="font-semibold text-red-200">{order.orderId}</span>? A full refund will be initiated to your original payment method.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => { onCancel(order.orderId); setConfirmCancel(false); setExpanded(false); }}
              className="flex-1 sm:flex-none text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Yes, Cancel
            </button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="flex-1 sm:flex-none text-xs text-gray-400 hover:text-gray-200 border border-[#3a3a52] px-3 py-1.5 rounded-lg transition-colors"
            >
              Keep Order
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-[#2a2a3e] px-4 sm:px-5 py-4 bg-[#18182a]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-3">Items Ordered</p>
              <div className="flex flex-col gap-3">
                {order.books.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <div className="w-9 h-12 rounded overflow-hidden border border-[#2a2a3e] shrink-0">
                      <BookCover title={b.title} author={b.author} bg={b.coverBg} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm font-medium truncate">{b.title}</p>
                      <p className="text-gray-500 text-xs">{b.author} · {b.format}</p>
                    </div>
                    <p className="text-gray-300 text-sm font-semibold shrink-0">₹{b.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-3">Delivery Details</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Delivered to</p>
                    <p className="text-gray-200 text-sm">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#2a2a3e] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      order.status === "Delivered" ? "w-full bg-emerald-500" :
                      order.status === "Shipped"   ? "w-3/4 bg-blue-500"    :
                      order.status === "Processing"? "w-1/4 bg-amber-500"   :
                      "w-full bg-red-500"
                    }`} />
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Buy Again Toast ──────────────────────────────────────────────────────────
function BuyAgainToast({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl shadow-2xl p-4 w-80">
      <div className="flex items-start justify-between mb-3">
        <p className="text-white font-semibold text-sm">Added to Cart</p>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-0.5 rounded">
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-3">
        {order.books.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <div className="w-7 h-10 rounded overflow-hidden shrink-0">
              <BookCover title={b.title} author={b.author} bg={b.coverBg} />
            </div>
            <p className="text-gray-300 text-xs truncate">{b.title}</p>
            <p className="text-gray-400 text-xs ml-auto shrink-0">₹{b.price}</p>
          </div>
        ))}
      </div>
      <Link
        href="/cart"
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        onClick={onClose}
      >
        Go to Cart →
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["All", "Delivered", "Shipped", "Processing", "Cancelled"] as const;
const RETURN_FILTERS: Array<ReturnStatus | "All"> = ["All", "Requested", "Pickup Scheduled", "In Transit", "Refunded"];

export default function OrdersPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [tab, setTab]               = useState<"orders" | "returns">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [returnFilter, setReturnFilter] = useState<string>("All");
  const [search, setSearch]         = useState("");
  const [toastOrder, setToastOrder] = useState<Order | null>(null);
  const [orders, setOrders]         = useState<Order[]>(INITIAL_ORDERS);

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => o.orderId === orderId ? { ...o, status: "Cancelled" as const } : o)
    );
  };

  useEffect(() => {
    if (!isLoggedIn || !user?.entitlements.canViewOrders) {
      router.replace(isLoggedIn ? "/" : "/login");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user?.entitlements.canViewOrders) return null;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.orderId.toLowerCase().includes(q) ||
        o.books.some(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    return true;
  });

  const filteredReturns = RETURNS.filter((r) => {
    if (returnFilter !== "All" && r.status !== returnFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.returnId.toLowerCase().includes(q) ||
        r.book.title.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar cartCount={2} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">{tab === "orders" ? "My Orders" : "My Returns"}</span>
        </div>

        {/* Page header + tab switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-white text-xl font-bold">Orders &amp; Returns</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {tab === "orders"
                ? `${orders.length} orders placed`
                : `${RETURNS.length} return request${RETURNS.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg p-0.5 gap-0.5 self-start sm:self-auto">
            <button
              onClick={() => { setTab("orders"); setSearch(""); setStatusFilter("All"); }}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md font-medium transition-colors ${
                tab === "orders" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" /> My Orders
            </button>
            <button
              onClick={() => { setTab("returns"); setSearch(""); setReturnFilter("All"); }}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md font-medium transition-colors ${
                tab === "returns" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Returns
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === "returns" ? "bg-white/20 text-white" : "bg-[#2a2a3e] text-gray-400"
              }`}>{RETURNS.length}</span>
            </button>
          </div>
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search orders or books…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#2d2d3e] text-gray-200 text-xs rounded px-3 py-2 pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 border-0"
                />
              </div>
              <div className="flex items-center bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg p-0.5 gap-0.5 overflow-x-auto">
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      statusFilter === s ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No orders found</p>
                <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
                <Link href="/" className="mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors">Browse books →</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-6">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onBuyAgain={o => setToastOrder(o)}
                    onCancel={handleCancelOrder}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── RETURNS TAB ── */}
        {tab === "returns" && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search returns…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#2d2d3e] text-gray-200 text-xs rounded px-3 py-2 pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 border-0"
                />
              </div>
              <div className="flex items-center bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg p-0.5 gap-0.5">
                {RETURN_FILTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => setReturnFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                      returnFilter === s ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredReturns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ArrowLeftRight className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No return requests found</p>
                <p className="text-gray-600 text-sm mt-1">
                  {returnFilter === "All" && !search
                    ? "You haven't initiated any returns yet."
                    : "Try adjusting your filters."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-6">
                {filteredReturns.map(ret => (
                  <ReturnCard key={ret.returnId} ret={ret} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toastOrder && <BuyAgainToast order={toastOrder} onClose={() => setToastOrder(null)} />}
    </div>
  );
}
