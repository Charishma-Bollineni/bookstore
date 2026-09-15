"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ShoppingCart, X, RotateCcw, Lock, TrendingUp, Shuffle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  format: string;
  categories: string[];
  brand: string;
  price: number;
  currency: string;
  deliveryDate: string;
  coverBg: string;
}

// ─── Cross-sell category map ─────────────────────────────────────────────────
// Maps a purchased category → complementary categories to suggest
const CROSS_SELL_MAP: Record<string, string[]> = {
  "Self-help":        ["Biography", "Science", "Philosophy"],
  "Biography":        ["Self-help", "History", "Memoir"],
  "Mystery":          ["Fantasy", "Science Fiction", "Romance"],
  "Romance":          ["Mystery", "Drama", "Young Adult"],
  "Science Fiction":  ["Fantasy", "Science", "Mystery"],
  "Fantasy":          ["Science Fiction", "Mystery", "Children's"],
  "Children's":       ["Young Adult", "Fantasy", "Comics & Graphic Novels"],
  "Young Adult":      ["Fantasy", "Romance", "Science Fiction"],
  "Science":          ["Science Fiction", "Philosophy", "Self-help"],
  "History":          ["Biography", "Memoir", "Philosophy"],
  "Philosophy":       ["Science", "Self-help", "Religion"],
};

// ─── All Books Data ─────────────────────────────────────────────────────────
const ALL_BOOKS: Book[] = [
  { id: "r1", title: "The Art of Focus",      author: "Arjun Patel",    description: "Practical guide to mastering focus & boosting productivity every day.", format: "Paperback",  categories: ["Self-help"],                   brand: "Penguin",       price: 399, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f5f0e8" },
  { id: "r2", title: "The Art of Learning",   author: "Raj Patel",      description: "Master the mindset and methods for effective lifelong learning.",         format: "Paperback",  categories: ["Self-help"],                   brand: "HarperCollins", price: 259, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#e63946" },
  { id: "r3", title: "The Path to Success",   author: "James Wright",   description: "A practical guide to achieving goals with clarity and confidence.",       format: "Paperback",  categories: ["Self-help", "Biography"],      brand: "Random House",  price: 359, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1d3557" },
  { id: "b1", title: "The Midnight Hour",     author: "James Adams",    description: "Haunting tale of a man's journey & the shadows of a forgotten past.",    format: "Paperback",  categories: ["Mystery"],                     brand: "Penguin",       price: 299, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1a2e4a" },
  { id: "b2", title: "Beneath the Stars",     author: "Jessica Martin", description: "A heartwarming tale, where two souls discover who you need.",            format: "Hard Cover", categories: ["Romance"],                     brand: "HarperCollins", price: 499, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#6b2d6b" },
  { id: "b3", title: "The Final Frontier",    author: "Laura Mitchell", description: "A mission to space secrets to change humanity forever.",                 format: "Paperback",  categories: ["Science Fiction"],             brand: "Random House",  price: 359, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#0d3b5e" },
  { id: "n1", title: "Joy of Minimalism",     author: "Daniel Reed",    description: "Declutter your life to uncover peace, clarity, and joy.",                format: "Paperback",  categories: ["Self-help"],                   brand: "Penguin",       price: 149, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f0c040" },
  { id: "n2", title: "The Vanishing House",   author: "Clara Nelson",   description: "A chilling mystery unfolds within a house that disappears.",             format: "eBook",      categories: ["Mystery", "Fantasy"],          brand: "Random House",  price: 99,  currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1a3a2a" },
  { id: "n3", title: "The Lost Kitten",       author: "Emily Parker",   description: "A heartwarming tale of courage, friendship, and feline adventure.",      format: "Hardcover",  categories: ["Children's"],                  brand: "HarperCollins", price: 339, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f48c1e" },
  { id: "f1", title: "Dragon's Keep",         author: "Lena Brooks",    description: "An epic fantasy saga of dragons, magic and destiny.",                    format: "Hardcover",  categories: ["Fantasy"],                     brand: "Penguin",       price: 429, currency: "₹", deliveryDate: "Tue, 22 Jul", coverBg: "#3a1a6b" },
  { id: "f2", title: "Star Dust",             author: "Marco Reyes",    description: "A breathtaking science fiction adventure across galaxies.",              format: "Paperback",  categories: ["Science Fiction"],             brand: "HarperCollins", price: 319, currency: "₹", deliveryDate: "Tue, 22 Jul", coverBg: "#0a2a4a" },
  { id: "f3", title: "Love in Paris",         author: "Sophie Blanc",   description: "A sweeping romance set against the backdrop of the city of light.",      format: "Paperback",  categories: ["Romance"],                     brand: "Random House",  price: 279, currency: "₹", deliveryDate: "Wed, 23 Jul", coverBg: "#8b1a3a" },
];

const ORDER_HISTORY: Array<{ orderId: string; date: string; books: Book[]; total: number }> = [
  { orderId: "ORD-2024-001", date: "12 Jun 2024", books: [ALL_BOOKS[0], ALL_BOOKS[3]], total: 698 },
  { orderId: "ORD-2024-002", date: "28 May 2024", books: [ALL_BOOKS[1]],              total: 259 },
  { orderId: "ORD-2024-003", date: "10 May 2024", books: [ALL_BOOKS[4], ALL_BOOKS[6]], total: 648 },
];

const SIDEBAR_CATEGORIES = [
  "All", "Romance", "Mystery", "Science Fiction", "Fantasy",
  "Historical", "Biography", "Self-help", "Memoir", "Travel",
  "Cooking", "Children's", "Young Adult", "Comics & Graphic Novels",
  "Poetry", "Drama", "Science", "Philosophy", "Religion", "Language Learning",
];

const BRANDS = ["All Brands", "Penguin", "HarperCollins", "Random House"];

// ─── Cover Component ────────────────────────────────────────────────────────
function BookCover({ title, author, bg }: { title: string; author: string; bg: string }) {
  const words = title.toUpperCase().split(" ");
  const chunks: string[] = [];
  let current = "";
  for (const w of words) {
    if (current.length + w.length > 9 && current.length > 0) { chunks.push(current.trim()); current = w + " "; }
    else { current += w + " "; }
  }
  if (current.trim()) chunks.push(current.trim());
  const isDark = ["#e63946", "#1d3557", "#1a2e4a", "#6b2d6b", "#0d3b5e", "#1a3a2a", "#3a1a6b", "#0a2a4a", "#8b1a3a"].includes(bg);
  const textColor = isDark || bg === "#f48c1e" ? "#fff" : "#111";
  const subColor  = isDark || bg === "#f48c1e" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)";
  return (
    <div className="w-full h-full flex flex-col justify-between px-2 py-3" style={{ backgroundColor: bg }}>
      <p className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: subColor }}>{author.split(" ")[0]}</p>
      <div className="flex-1 flex flex-col justify-center">
        {chunks.map((line, i) => (
          <p key={i} className="font-extrabold leading-none text-center" style={{ color: textColor, fontFamily: "Georgia, serif", fontSize: chunks.length > 3 ? "10px" : chunks.length === 3 ? "11px" : "13px" }}>{line}</p>
        ))}
      </div>
      <p className="text-[7px] font-bold uppercase tracking-widest text-center" style={{ color: subColor }}>{author.toUpperCase()}</p>
    </div>
  );
}

// ─── Book Card ───────────────────────────────────────────────────────────────
function BookCard({ book, canAddToCart }: { book: Book; canAddToCart: boolean }) {
  const router = useRouter();
  return (
    <div className="flex gap-3 cursor-pointer group" onClick={() => router.push(`/book/${book.id}`)}>
      <div className="flex-shrink-0 w-[115px] h-[160px] rounded-sm overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all relative" style={{ backgroundColor: book.coverBg }}>
        <BookCover title={book.title} author={book.author} bg={book.coverBg} />
        {!canAddToCart && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Lock className="w-5 h-5 text-white/70" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between py-0.5 min-w-0">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-blue-300 transition-colors">{book.title}</h3>
          <p className="text-sm text-blue-400 leading-none">by {book.author}</p>
          <p className="text-gray-400 text-xs leading-snug">{book.description}</p>
          <p className="text-gray-400 text-xs">{book.format}</p>
          <div className="flex flex-wrap items-center">
            {book.categories.map((cat, i) => (
              <span key={cat} className="text-xs">
                <span className="text-blue-400">{cat}</span>
                {i < book.categories.length - 1 && <span className="text-gray-500">, </span>}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-white font-bold text-lg leading-tight">{book.currency}{book.price}</p>
          <p className="text-gray-400 text-xs">Delivery by <span className="font-bold text-gray-200">{book.deliveryDate}</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── Order History Panel ─────────────────────────────────────────────────────
function OrderHistoryPanel({ onClose, onBuyAgain }: { onClose: () => void; onBuyAgain: (b: Book) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e1e2e] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-blue-400" /> Order History
        </h2>
        <div className="flex flex-col gap-5">
          {ORDER_HISTORY.map(order => (
            <div key={order.orderId} className="bg-[#12122a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">{order.orderId}</p>
                  <p className="text-gray-400 text-xs">Ordered on {order.date}</p>
                </div>
                <span className="text-white font-bold text-sm">₹{order.total}</span>
              </div>
              <div className="flex flex-col gap-3">
                {order.books.map(book => (
                  <div key={book.id} className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded flex-shrink-0 overflow-hidden" style={{ backgroundColor: book.coverBg }}>
                      <BookCover title={book.title} author={book.author} bg={book.coverBg} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{book.title}</p>
                      <p className="text-gray-400 text-xs">by {book.author}</p>
                      <p className="text-white text-xs font-bold mt-0.5">{book.currency}{book.price}</p>
                    </div>
                    <button
                      onClick={() => { onBuyAgain(book); onClose(); }}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3" /> Buy Again
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Book Section ────────────────────────────────────────────────────────────
const SECTION_BADGE: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  recommended: { label: "Recommended",  cls: "bg-blue-600/20 text-blue-300 border-blue-500/30",   Icon: RotateCcw   },
  upsell:      { label: "Upsell",       cls: "bg-amber-600/20 text-amber-300 border-amber-500/30", Icon: TrendingUp  },
  crosssell:   { label: "Cross-sell",   cls: "bg-purple-600/20 text-purple-300 border-purple-500/30", Icon: Shuffle },
};

function BookSection({
  title,
  books,
  canAddToCart,
  badge,
}: {
  title: string;
  books: Book[];
  canAddToCart: boolean;
  badge?: "recommended" | "upsell" | "crosssell";
}) {
  const badgeCfg = badge ? SECTION_BADGE[badge] : null;
  // Split title on " · " to show subtitle dimmed
  const [mainTitle, subtitle] = title.includes(" · ") ? title.split(" · ") : [title, undefined];

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-3">
        {badgeCfg && (
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeCfg.cls}`}>
            <badgeCfg.Icon className="w-2.5 h-2.5" />
            {badgeCfg.label}
          </span>
        )}
        <h2 className="text-white font-medium text-base leading-tight">
          {mainTitle}
          {subtitle && <span className="text-gray-500 font-normal text-sm"> · {subtitle}</span>}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {books.map(book => <BookCard key={book.id} book={book} canAddToCart={canAddToCart} />)}
      </div>
    </div>
  );
}

// ─── Guest banner ─────────────────────────────────────────────────────────────
function GuestBanner({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex items-center justify-between bg-[#2a1a4a] border border-[#5b4fcf]/40 rounded-lg px-4 py-2.5 mb-3 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-[#5b4fcf]" />
        <span className="text-gray-300 text-xs">You&apos;re browsing as a <span className="text-white font-semibold">Guest</span>. Sign in to add to cart, track orders &amp; get recommendations.</span>
      </div>
      <button onClick={onLogin} className="text-xs text-[#5b4fcf] hover:text-white font-semibold border border-[#5b4fcf]/50 hover:border-[#5b4fcf] px-3 py-1 rounded transition-colors whitespace-nowrap ml-4">
        Sign In
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBrand, setActiveBrand]       = useState("All Brands");
  const [searchQuery, setSearchQuery]       = useState("");
  const [sortBy, setSortBy]                 = useState("Relevance");
  const [formatFilter, setFormatFilter]     = useState("All");
  const [cartCount, setCartCount]           = useState(2);
  const [notification, setNotification]     = useState<string | null>(null);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  // Redirect to login if not authenticated at all
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const canAddToCart = user?.entitlements.canAddToCart ?? false;
  const canSeeRecommendations = user?.entitlements.canSeeRecommendations ?? false;
  const canViewOrders = user?.entitlements.canViewOrders ?? false;
  const isGuest = user?.role === "guest";

  // ── Filters ──────────────────────────────────────────────────────────────
  const categoryFiltered = ALL_BOOKS.filter(b =>
    activeCategory === "All" ? true : b.categories.includes(activeCategory)
  );
  const brandFiltered = categoryFiltered.filter(b =>
    activeBrand === "All Brands" ? true : b.brand === activeBrand
  );
  const filtered = brandFiltered.filter(b => {
    const matchesSearch = searchQuery === "" ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === "All" ? true : b.format.toLowerCase().includes(formatFilter.toLowerCase());
    return matchesSearch && matchesFormat;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  // ── Sections — entitlement-aware ──────────────────────────────────────────

  // Categories the user has actually purchased — drives recommendations, upsell & cross-sell
  const purchasedCategories: string[] = canSeeRecommendations
    ? [...new Set(ORDER_HISTORY.flatMap(o => o.books.flatMap(b => b.categories)))]
    : [];

  // Average spend per order — used as upsell threshold
  const avgOrderSpend = ORDER_HISTORY.length
    ? Math.round(ORDER_HISTORY.reduce((s, o) => s + o.total, 0) / ORDER_HISTORY.length)
    : 0;

  // Recommended — books in categories the user has ordered before (not yet repurchased)
  const purchasedIds = new Set(ORDER_HISTORY.flatMap(o => o.books.map(b => b.id)));
  const recommended = canSeeRecommendations
    ? sorted
        .filter(b => !purchasedIds.has(b.id) && b.categories.some(c => purchasedCategories.includes(c)))
        .slice(0, 3)
    : [];

  // Upsell — books priced above average order spend, in same categories as history
  const upsell = canSeeRecommendations
    ? sorted
        .filter(b =>
          !purchasedIds.has(b.id) &&
          b.price > avgOrderSpend / 2 &&
          b.categories.some(c => purchasedCategories.includes(c))
        )
        .sort((a, b) => b.price - a.price)
        .slice(0, 3)
    : [];

  // Cross-sell — books from complementary categories to what was purchased
  const crossSellCategories = [
    ...new Set(
      purchasedCategories.flatMap(c => CROSS_SELL_MAP[c] ?? [])
    ),
  ].filter(c => !purchasedCategories.includes(c));   // exclude already-owned categories

  const crossSell = canSeeRecommendations
    ? sorted
        .filter(b => !purchasedIds.has(b.id) && b.categories.some(c => crossSellCategories.includes(c)))
        .slice(0, 3)
    : [];

  const bestsellers = sorted.filter(b => ["Mystery", "Romance", "Science Fiction"].some(c => b.categories.includes(c))).slice(0, 3);
  const newLaunches = sorted.filter(b => b.categories.includes("Fantasy") || b.categories.includes("Children's") || b.id.startsWith("n")).slice(0, 3);

  const handleAddToCart = (book: Book) => {
    if (!canAddToCart) { router.push("/login"); return; }
    setCartCount(c => c + 1);
    setNotification(`"${book.title}" added to cart!`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar cartCount={canAddToCart ? cartCount : 0} />

      {showOrderHistory && canViewOrders && (
        <OrderHistoryPanel onClose={() => setShowOrderHistory(false)} onBuyAgain={handleAddToCart} />
      )}

      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-green-700 text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-sm">
          <ShoppingCart className="w-4 h-4" />{notification}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── LEFT SIDEBAR ── */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          flex flex-col w-52 md:w-48 flex-shrink-0
          bg-[#12122a] border-r border-[#2a2a3e] overflow-y-auto py-2
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          {SIDEBAR_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSidebarOpen(false); }}
              className={activeCategory === cat ? "sidebar-link-active text-left" : "sidebar-link text-left"}
            >
              {cat}
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Filter Bar */}
          <div className="bg-[#12122a] border-b border-[#2a2a3e] flex items-center gap-2 px-3 py-2 flex-wrap">
            {/* Mobile: categories button */}
            <button
              className="md:hidden flex items-center gap-1.5 bg-[#1e1e2e] text-gray-300 text-xs font-medium px-3 py-2 rounded border border-[#3a3a52] whitespace-nowrap"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <ChevronDown className="w-3.5 h-3.5" /> Categories
            </button>

            {/* Search */}
            <div className="flex-1 min-w-[120px] flex flex-col justify-center px-3 py-1.5 bg-[#1e1e2e] rounded">
              <span className="hidden sm:block text-gray-400 text-[11px] mb-0.5">Search you want to read here</span>
              <div className="flex items-center gap-2">
                <input type="search" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 text-sm focus:outline-none" />
                <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              </div>
            </div>

            {/* Brand */}
            <div className="hidden sm:flex w-36 flex-col justify-center px-3 py-1.5 bg-[#1e1e2e] rounded">
              <span className="text-gray-400 text-[11px] mb-0.5">Brand</span>
              <div className="flex items-center">
                <select value={activeBrand} onChange={e => setActiveBrand(e.target.value)} className="flex-1 bg-transparent text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer">
                  {BRANDS.map(b => <option key={b} className="bg-[#1e1e2e]">{b}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 pointer-events-none" />
              </div>
            </div>

            {/* Format */}
            <div className="hidden md:flex w-44 flex-col justify-center px-3 py-1.5 bg-[#1e1e2e] rounded">
              <span className="text-gray-400 text-[11px] mb-0.5">Format</span>
              <div className="flex items-center">
                <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} className="flex-1 bg-transparent text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer">
                  {["All", "Paperback", "Hardcover", "Hard Cover", "eBook"].map(f => <option key={f} className="bg-[#1e1e2e]">{f}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div className="hidden sm:flex w-40 flex-col justify-center px-3 py-1.5 bg-[#1e1e2e] rounded">
              <span className="text-gray-400 text-[11px] mb-0.5">Sort by</span>
              <div className="flex items-center">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 bg-transparent text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer">
                  {["Relevance", "Price: Low to High", "Price: High to Low"].map(s => <option key={s} className="bg-[#1e1e2e]">{s}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 pointer-events-none" />
              </div>
            </div>

            {canViewOrders && (
              <button onClick={() => setShowOrderHistory(true)}
                className="hidden sm:flex items-center gap-1.5 bg-[#1e1e2e] hover:bg-[#2a2a3e] text-gray-300 hover:text-white text-xs font-medium px-3 py-3 rounded transition-colors whitespace-nowrap border border-[#3a3a52]">
                <RotateCcw className="w-3.5 h-3.5" /> Order History
              </button>
            )}
          </div>

          {/* Active filters */}
          {(activeCategory !== "All" || activeBrand !== "All Brands" || searchQuery) && (
            <div className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-[#12122a] border-b border-[#2a2a3e] flex-wrap">
              <span className="text-gray-500 text-xs">Showing:</span>
              {activeCategory !== "All" && (
                <span className="flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded">
                  {activeCategory} <button onClick={() => setActiveCategory("All")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeBrand !== "All Brands" && (
                <span className="flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded">
                  {activeBrand} <button onClick={() => setActiveBrand("All Brands")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded">
                  &ldquo;{searchQuery}&rdquo; <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <span className="text-gray-500 text-xs ml-1">{sorted.length} result{sorted.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Book Sections */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 flex flex-col gap-6">
            {/* Guest banner */}
            {isGuest && <GuestBanner onLogin={() => router.push("/login")} />}

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-2 py-20">
                <Search className="w-10 h-10 opacity-30" />
                <p className="text-sm">No books found for your selection.</p>
                <button onClick={() => { setActiveCategory("All"); setActiveBrand("All Brands"); setSearchQuery(""); }} className="text-blue-400 text-xs hover:underline mt-1">Clear filters</button>
              </div>
            ) : (
              <>
                {/* ── Recommended — based on order history categories ── */}
                {canSeeRecommendations && recommended.length > 0 && (
                  <>
                    <BookSection
                      title={
                        activeCategory === "All"
                          ? `Recommended for You · Based on your ${purchasedCategories.slice(0, 2).join(" & ")} purchases`
                          : `Top ${activeCategory} Picks`
                      }
                      badge="recommended"
                      books={recommended}
                      canAddToCart={canAddToCart}
                    />
                    <div className="border-t border-[#2a2a3e]" />
                  </>
                )}

                {/* ── Upsell — premium editions in purchased categories ── */}
                {canSeeRecommendations && upsell.length > 0 && (
                  <>
                    <BookSection
                      title="Upgrade Your Library · Premium editions you might love"
                      badge="upsell"
                      books={upsell}
                      canAddToCart={canAddToCart}
                    />
                    <div className="border-t border-[#2a2a3e]" />
                  </>
                )}

                {/* ── Cross-sell — complementary categories ── */}
                {canSeeRecommendations && crossSell.length > 0 && (
                  <>
                    <BookSection
                      title={`Explore New Genres · Because you enjoyed ${purchasedCategories[0] ?? "these"}`}
                      badge="crosssell"
                      books={crossSell}
                      canAddToCart={canAddToCart}
                    />
                    <div className="border-t border-[#2a2a3e]" />
                  </>
                )}

                {bestsellers.length > 0 && (
                  <>
                    <BookSection
                      title="Bestsellers this Month"
                      books={bestsellers}
                      canAddToCart={canAddToCart}
                    />
                    <div className="border-t border-[#2a2a3e]" />
                  </>
                )}

                {newLaunches.length > 0 && (
                  <BookSection
                    title="New Launches"
                    books={newLaunches}
                    canAddToCart={canAddToCart}
                  />
                )}

                {activeCategory !== "All" && sorted.length > 0 &&
                  recommended.length === 0 && bestsellers.length === 0 && newLaunches.length === 0 && (
                  <BookSection
                    title={`${activeCategory} Books`}
                    books={sorted}
                    canAddToCart={canAddToCart}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
