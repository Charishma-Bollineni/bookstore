"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, ShoppingCart, Search, Trash2, BookOpen, SlidersHorizontal, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WishlistBook {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  originalPrice?: number;
  coverBg: string;
  format: string;
  categories: string[];
  rating: number;
  addedDate: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_WISHLIST: WishlistBook[] = [
  {
    id: "r1", title: "The Art of Focus", author: "Arjun Patel",
    description: "Practical guide to mastering focus & boosting productivity every day.",
    price: 399, originalPrice: 499, coverBg: "#f5f0e8", format: "Paperback",
    categories: ["Self-help"], rating: 4.5, addedDate: "15 Jun 2024",
  },
  {
    id: "b2", title: "Beneath the Stars", author: "Jessica Martin",
    description: "A heartwarming tale where two souls discover who they need.",
    price: 499, coverBg: "#6b2d6b", format: "Hard Cover",
    categories: ["Romance"], rating: 4.8, addedDate: "10 Jun 2024",
  },
  {
    id: "b3", title: "The Final Frontier", author: "Laura Mitchell",
    description: "A mission to space with secrets to change humanity forever.",
    price: 359, originalPrice: 420, coverBg: "#0d3b5e", format: "Paperback",
    categories: ["Science Fiction"], rating: 4.3, addedDate: "02 Jun 2024",
  },
  {
    id: "f1", title: "Dragon's Keep", author: "Lena Brooks",
    description: "An epic fantasy saga of dragons, magic and destiny.",
    price: 429, coverBg: "#3a1a6b", format: "Hardcover",
    categories: ["Fantasy"], rating: 4.7, addedDate: "28 May 2024",
  },
  {
    id: "n2", title: "The Vanishing House", author: "Clara Nelson",
    description: "A chilling mystery unfolds within a house that disappears.",
    price: 99, originalPrice: 150, coverBg: "#1a3a2a", format: "eBook",
    categories: ["Mystery", "Fantasy"], rating: 4.1, addedDate: "20 May 2024",
  },
  {
    id: "r3", title: "The Path to Success", author: "James Wright",
    description: "A practical guide to achieving goals with clarity and confidence.",
    price: 359, coverBg: "#1d3557", format: "Paperback",
    categories: ["Self-help", "Biography"], rating: 4.4, addedDate: "12 May 2024",
  },
];

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
  return (
    <div className="w-full h-full flex flex-col justify-between px-2 py-2" style={{ backgroundColor: bg }}>
      <p className="text-[7px] font-semibold uppercase tracking-widest" style={{ color: sc }}>{author.split(" ")[0]}</p>
      <div className="flex-1 flex flex-col justify-center">
        {chunks.map((line, i) => (
          <p key={i} className="font-extrabold leading-none text-center"
            style={{ color: tc, fontFamily: "Georgia, serif", fontSize: chunks.length > 3 ? "9px" : "11px" }}>{line}</p>
        ))}
      </div>
      <p className="text-[6px] font-bold uppercase tracking-widest text-center" style={{ color: sc }}>{author.toUpperCase()}</p>
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-600"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-gray-500 text-xs ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Wishlist Card ────────────────────────────────────────────────────────────
function WishlistCard({
  book,
  onRemove,
  onAddToCart,
  canAddToCart,
}: {
  book: WishlistBook;
  onRemove: (id: string) => void;
  onAddToCart: (book: WishlistBook) => void;
  canAddToCart: boolean;
}) {
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    onAddToCart(book);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : null;

  return (
    <div className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 hover:border-[#3a3a4e] transition-colors">
      {/* Cover */}
      <Link href={`/book/${book.id}`} className="shrink-0">
        <div className="w-[60px] sm:w-[72px] h-[84px] sm:h-[100px] rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
          <BookCover title={book.title} author={book.author} bg={book.coverBg} />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Title row + remove button (always visible on touch) */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/book/${book.id}`}>
              <h3 className="text-white font-semibold text-sm hover:text-blue-300 transition-colors leading-tight">{book.title}</h3>
            </Link>
            <p className="text-gray-400 text-xs mt-0.5">{book.author}</p>
          </div>
          {/* Always visible on mobile, hover-visible on desktop */}
          <button
            onClick={() => onRemove(book.id)}
            className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors shrink-0 sm:opacity-0 sm:group-hover:opacity-100"
            title="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2">{book.description}</p>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Stars rating={book.rating} />
          <span className="text-gray-600 text-xs">•</span>
          <span className="text-gray-500 text-xs">{book.format}</span>
          {book.categories.map((c) => (
            <span key={c} className="text-xs text-blue-400/80 bg-blue-500/10 px-1.5 py-0.5 rounded-full">{c}</span>
          ))}
        </div>

        {/* Price + action row — stacks on very small screens */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between mt-1 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base">₹{book.price}</span>
            {book.originalPrice && (
              <>
                <span className="text-gray-500 text-xs line-through">₹{book.originalPrice}</span>
                <span className="text-emerald-400 text-xs font-medium">{discount}% off</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/book/${book.id}`}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 border border-[#2a2a3e] hover:border-[#3a3a4e] px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">Details</span>
            </Link>
            {canAddToCart ? (
              <button
                onClick={handleAddToCart}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  addedToCart ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <ShoppingCart className="w-3 h-3" />
                {addedToCart ? "Added!" : "Add to Cart"}
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(book)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-[#2a2a3e] hover:bg-[#3a3a52] border border-[#3a3a52] text-gray-400 whitespace-nowrap"
              >
                <Lock className="w-3 h-3" />
                Sign In
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-[10px]">Added on {book.addedDate}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const SORT_OPTIONS = ["Date Added", "Price: Low to High", "Price: High to Low", "Rating"];

export default function WishlistPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<WishlistBook[]>(INITIAL_WISHLIST);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Date Added");
  const [cartCount, setCartCount] = useState(2);
  const [toast, setToast] = useState<string | null>(null);

  // Guard: only members/admins can view wishlist
  useEffect(() => {
    if (!isLoggedIn || !user?.entitlements.canViewWishlist) {
      router.replace(isLoggedIn ? "/" : "/login");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user?.entitlements.canViewWishlist) return null;

  const canAddToCart = user?.entitlements.canAddToCart ?? false;

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const addToCart = (book: WishlistBook) => {
    if (!canAddToCart) { router.push("/login"); return; }
    setCartCount((c) => c + 1);
    setToast(book.title);
    setTimeout(() => setToast(null), 2500);
  };

  const addAllToCart = () => {
    if (!canAddToCart) { router.push("/login"); return; }
    setCartCount((c) => c + books.length);
    setToast("All items");
    setTimeout(() => setToast(null), 2500);
  };

  const sorted = [...books]
    .filter((b) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Rating") return b.rating - a.rating;
      return 0; // Date Added — keep original order
    });

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar cartCount={cartCount} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">My Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-white text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              My Wishlist
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">{books.length} {books.length === 1 ? "book" : "books"} saved</p>
          </div>
          {books.length > 0 && (
            canAddToCart ? (
              <button
                onClick={addAllToCart}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 bg-[#2a2a3e] hover:bg-[#3a3a52] border border-[#3a3a52] text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden xs:inline">Sign in to Add to Cart</span>
                <span className="xs:hidden">Sign In</span>
              </button>
            )
          )}
        </div>

        {books.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-14 h-14 text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium text-lg">Your wishlist is empty</p>
            <p className="text-gray-600 text-sm mt-1">Save books you love to find them easily later</p>
            <Link href="/" className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search wishlist…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#2d2d3e] text-gray-200 text-xs rounded px-3 py-2 pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 border-0"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#2d2d3e] text-gray-200 text-xs rounded px-3 py-2 pl-8 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 border-0 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              {search && (
                <p className="text-gray-500 text-xs">
                  {sorted.length} result{sorted.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Cards */}
            {sorted.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No books match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-6">
                {sorted.map((book) => (
                  <WishlistCard
                    key={book.id}
                    book={book}
                    onRemove={removeBook}
                    onAddToCart={addToCart}
                    canAddToCart={canAddToCart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 border border-emerald-600/40 text-emerald-300 text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>"{toast}" added to cart</span>
        </div>
      )}
    </div>
  );
}
