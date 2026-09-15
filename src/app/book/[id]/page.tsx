"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ShoppingCart, Bookmark, Star, ChevronRight, DollarSign, Languages } from "lucide-react";
import Navbar from "@/components/Navbar";

// ─── Book data ────────────────────────────────────────────────────────────────
const ALL_BOOKS = [
  { id: "r1", title: "The Art of Focus", author: "Arjun Patel", description: "Practical guide to mastering focus & boosting productivity every day.", longDescription: "In The Art of Focus, Arjun Patel guides you through practical strategies to declutter your mind, space, and schedule. Whether you're overwhelmed, over-committed, or just over it — this book offers a calm, mindful approach.", format: "Paperback", categories: ["Non-fiction", "Self Help"], brand: "Penguin", publisher: "ABC Publishers", price: 399, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f5f0e8", language: "English", rating: 4, sells: 198, authorBio: "Arjun Patel is a productivity coach and advocate for focused living. His work has helped thousands achieve clarity and peak performance." },
  { id: "r2", title: "The Art of Learning", author: "Raj Patel", description: "Master the mindset and methods for effective lifelong learning.", longDescription: "Raj Patel explores the science and art behind how humans learn best. This book distills decades of research into actionable strategies.", format: "Paperback", categories: ["Non-fiction", "Self Help"], brand: "HarperCollins", publisher: "HarperCollins", price: 259, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#e63946", language: "English", rating: 4, sells: 312, authorBio: "Raj Patel is an educator and cognitive scientist who has spent 20 years studying how people acquire new skills." },
  { id: "r3", title: "The Path to Success", author: "James Wright", description: "A practical guide to achieving goals with clarity and confidence.", longDescription: "James Wright maps out a comprehensive system for setting and achieving meaningful goals, grounded in psychology and real-world case studies.", format: "Paperback", categories: ["Non-fiction", "Self Help"], brand: "Random House", publisher: "Random House", price: 359, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1d3557", language: "English", rating: 4, sells: 276, authorBio: "James Wright is a business coach and bestselling author. He has mentored over 5,000 professionals across 40 countries." },
  { id: "b1", title: "The Midnight Hour", author: "James Adams", description: "Haunting tale of a man's journey & the shadows of a forgotten past.", longDescription: "A gripping literary thriller weaving memory, obsession and dark secrets.", format: "Paperback", categories: ["Fiction", "Mystery"], brand: "Penguin", publisher: "Penguin Books", price: 299, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1a2e4a", language: "English", rating: 4, sells: 421, authorBio: "James Adams is a crime novelist known for atmospheric psychological thrillers." },
  { id: "b2", title: "Beneath the Stars", author: "Jessica Martin", description: "A heartwarming tale, where two souls discover who you need.", longDescription: "A sweeping romance following two strangers whose lives intersect across three continents.", format: "Hard Cover", categories: ["Fiction", "Romance"], brand: "HarperCollins", publisher: "HarperCollins", price: 499, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#6b2d6b", language: "English", rating: 5, sells: 534, authorBio: "Jessica Martin is a New York Times bestselling romance author with over 2 million books sold worldwide." },
  { id: "b3", title: "The Final Frontier", author: "Laura Mitchell", description: "A mission to space secrets to change humanity forever.", longDescription: "A breathtaking science fiction epic about a near-future mission to the outer solar system.", format: "Paperback", categories: ["Fiction", "Science Fiction"], brand: "Random House", publisher: "Random House", price: 359, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#0d3b5e", language: "English", rating: 5, sells: 389, authorBio: "Laura Mitchell is a science fiction author and former NASA engineer." },
  { id: "n1", title: "Joy of Minimalism", author: "Daniel Reed", description: "Declutter your life to uncover peace, clarity, and joy.", longDescription: "Daniel Reed guides you through practical strategies to declutter your mind, space, and schedule. Whether you're overwhelmed, over-committed, or just over it — this book offers a calm, mindful approach to building a simpler life.", format: "Paperback", categories: ["Non-fiction", "Self Help"], brand: "Penguin", publisher: "ABC Publishers", price: 149, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f0c040", language: "English", rating: 4, sells: 145, authorBio: "Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco. He is the author of The Joy of Minimalism, an acclaimed guide to decluttering both physically and mentally. His other works include Less, But Better and The Focus Reset." },
  { id: "n2", title: "The Vanishing House", author: "Clara Nelson", description: "A chilling mystery unfolds within a house that disappears.", longDescription: "Clara Nelson blends supernatural horror with psychological mystery in this chilling debut.", format: "eBook", categories: ["Fiction", "Mystery"], brand: "Random House", publisher: "Random House", price: 99, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#1a3a2a", language: "English", rating: 4, sells: 203, authorBio: "Clara Nelson is a debut novelist whose love of Gothic fiction shines through every page." },
  { id: "n3", title: "The Lost Kitten", author: "Emily Parker", description: "A heartwarming tale of courage, friendship, and feline adventure.", longDescription: "A delightful story for young readers about a brave kitten who sets out on a big adventure.", format: "Hardcover", categories: ["Fiction", "Children's"], brand: "HarperCollins", publisher: "HarperCollins", price: 339, currency: "₹", deliveryDate: "Mon, 21 Jul", coverBg: "#f48c1e", language: "English", rating: 5, sells: 672, authorBio: "Emily Parker has written over 30 beloved children's books. She lives with her three cats in Edinburgh." },
];

// ─── Cover ────────────────────────────────────────────────────────────────────
function BookCover({ title, author, bg, large = false }: { title: string; author: string; bg: string; large?: boolean }) {
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
  const fs = large ? (chunks.length > 3 ? "13px" : chunks.length === 3 ? "15px" : "18px") : (chunks.length > 3 ? "9px" : chunks.length === 3 ? "10px" : "12px");
  return (
    <div className="w-full h-full flex flex-col justify-between px-2 py-2" style={{ backgroundColor: bg }}>
      <p className="font-semibold uppercase tracking-widest text-[7px]" style={{ color: sc }}>{author.split(" ")[0]}</p>
      <div className="flex-1 flex flex-col justify-center">
        {chunks.map((line, i) => <p key={i} className="font-extrabold leading-tight text-center" style={{ color: tc, fontFamily: "Georgia, serif", fontSize: fs }}>{line}</p>)}
      </div>
      <p className="font-bold uppercase tracking-widest text-center text-[6px]" style={{ color: sc }}>{author.toUpperCase()}</p>
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s}
          className={`w-3.5 h-3.5 transition-colors ${interactive ? "cursor-pointer" : "cursor-default"} ${(interactive ? (hov || rating) : rating) >= s ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
          onMouseEnter={() => interactive && setHov(s)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onChange?.(s)}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const book = ALL_BOOKS.find(b => b.id === id) ?? ALL_BOOKS[6];
  const related = ALL_BOOKS.filter(b => b.id !== book.id && b.categories.some(c => book.categories.includes(c))).slice(0, 3);

  const [cartCount, setCartCount] = useState(2);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews] = useState([
    { name: "John Smith", text: "The accordion component delivers large amounts of content in a small space through progressive disclosure. The user gets key details about the underlying content and can choose to expand that content within the constraints of the accordion.", rating: 5 },
  ]);
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddToCart = () => {
    setInCart(true);
    setCartCount(c => c + 1);
    setNotification(`"${book.title}" added to cart!`);
    setTimeout(() => setNotification(null), 2000);
  };

  const crumbs = ["Home", ...book.categories.slice(0, 2)];

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar cartCount={cartCount} />

      {notification && (
        <div className="fixed top-14 right-4 z-50 bg-green-700 text-white px-3 py-2 rounded shadow-lg flex items-center gap-2 text-xs">
          <ShoppingCart className="w-3.5 h-3.5" />{notification}
        </div>
      )}

      <div className="flex flex-col lg:flex-row flex-1 px-4 sm:px-5 pt-3 pb-6 gap-6">

        {/* ── LEFT + CENTRE ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs flex-wrap">
            {crumbs.map((c, i) => (
              <span key={c} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-500" />}
                {i < crumbs.length - 1
                  ? <Link href={i === 0 ? "/" : "/"} className="text-blue-400 hover:underline">{c}</Link>
                  : <span className="text-gray-300 font-medium">{c}</span>}
              </span>
            ))}
          </nav>

          {/* ── Top section: covers + info ── */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Front cover */}
            <div className="flex-shrink-0 w-[140px] sm:w-[170px] h-[196px] sm:h-[238px] rounded" style={{ backgroundColor: book.coverBg, overflow: "hidden" }}>
              <BookCover title={book.title} author={book.author} bg={book.coverBg} large />
            </div>

            {/* Back cover blurb — hide on small screens */}
            <div className="hidden sm:flex flex-shrink-0 w-[160px] lg:w-[170px] h-[238px] rounded bg-[#2a2a3e] border border-[#3a3a52] flex-col justify-between p-3" style={{ overflow: "hidden" }}>
              <p className="italic text-gray-400 text-[10px] text-center leading-snug">"A refreshing path to clarity in a cluttered world."</p>
              <div>
                <p className="font-semibold text-amber-400 text-[9px] text-center mb-1">Discover how less can truly be more.</p>
                <p className="text-gray-400 text-[9px] leading-snug line-clamp-5">{book.longDescription}</p>
              </div>
              <div>
                <p className="font-semibold text-amber-400 text-[9px] mb-0.5">About the Author</p>
                <p className="text-gray-400 text-[9px] leading-snug line-clamp-3">{book.authorBio}</p>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-[#3a3a52]">
                <div className="w-4 h-4 rounded-full bg-gray-600" />
                <div className="text-[8px] text-gray-500">
                  <p>ISBN 978-0-123456-78-9</p>
                  <div className="flex gap-px mt-0.5">{[...Array(20)].map((_, i) => <div key={i} className="w-px bg-gray-500" style={{ height: `${6 + (i % 3) * 3}px` }} />)}</div>
                </div>
              </div>
            </div>

            {/* Book info */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <h1 className="text-white font-bold text-base leading-tight">{book.title}</h1>
              <p className="text-[11px]">by <Link href="#" className="text-blue-400 hover:underline">{book.author}</Link></p>
              <p className="text-gray-400 text-[11px] leading-snug line-clamp-2">{book.description}</p>
              <p className="text-[11px] text-gray-400">Published by: <Link href="#" className="text-blue-400 hover:underline">{book.publisher}</Link></p>
              <p className="text-gray-300 text-[11px]">{book.format}</p>
              <div className="flex gap-2 flex-wrap">
                {book.categories.map(cat => <Link key={cat} href="/" className="text-blue-400 text-[11px] hover:underline">{cat}</Link>)}
              </div>
              <p className="text-white font-bold text-xl leading-tight">{book.currency}{book.price}</p>
              <p className="text-gray-400 text-[10px] -mt-1">Delivery by <span className="font-bold text-gray-200">{book.deliveryDate}</span></p>
              <div className="flex gap-2">
                <button onClick={handleAddToCart}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-semibold text-xs transition-colors ${inCart ? "bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                  <ShoppingCart className="w-3.5 h-3.5" />{inCart ? "In Cart" : "Add to Cart"}
                </button>
                <button onClick={() => setInWishlist(v => !v)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-semibold text-xs transition-colors border ${inWishlist ? "bg-blue-900/40 border-blue-500 text-blue-300" : "bg-[#2a2a3e] border-[#3a3a52] text-gray-300 hover:text-white"}`}>
                  <Bookmark className="w-3.5 h-3.5" />{inWishlist ? "Wishlisted" : "Add to Wishlist"}
                </button>
              </div>
              <div className="flex gap-5 pt-1 border-t border-[#2a2a3e]">
                <div>
                  <div className="flex items-center gap-1 text-gray-400"><Languages className="w-3 h-3" /><span className="text-[10px]">Language</span></div>
                  <Link href="#" className="text-blue-400 text-[11px] hover:underline">{book.language}</Link>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-400"><Star className="w-3 h-3" /><span className="text-[10px]">Rating</span></div>
                  <Stars rating={book.rating} />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-400"><DollarSign className="w-3 h-3" /><span className="text-[10px]">Sells</span></div>
                  <span className="text-white font-semibold text-[11px]">{book.sells} copies sold</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── About the Writer ── */}
          <div className="flex-shrink-0">
            <h2 className="text-white font-semibold text-sm mb-2">About the writer</h2>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                <span className="text-white text-base font-bold">{book.author[0]}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-0.5">{book.author}</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-3">{book.authorBio}</p>
              </div>
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="flex flex-col gap-3">
            <h2 className="text-white font-semibold text-sm mb-2">Reviews</h2>
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Write review */}
              <div className="flex flex-col gap-2 sm:w-[45%]">
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-[10px]">Leave Your Review</label>
                  <span className="text-gray-500 text-[10px]">{reviewText.length}/100</span>
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value.slice(0, 100))}
                  placeholder="Placeholder text"
                  className="flex-1 min-h-0 w-full bg-[#1e1e2e] border border-[#3a3a52] text-gray-300 placeholder-gray-600 text-xs rounded px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center justify-between">
                  <Stars rating={reviewRating} interactive onChange={setReviewRating} />
                  <button
                    disabled={!reviewText.trim() || reviewRating === 0}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors"
                  >
                    Submit <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Existing reviews */}
              <div className="flex-1 flex flex-col gap-2 sm:overflow-y-auto">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-[#1e1e2e] rounded-lg p-3 border border-[#2a2a3e]">
                    <p className="text-white font-semibold text-xs mb-1">{r.name}</p>
                    <p className="text-gray-400 text-[10px] leading-relaxed mb-1.5">{r.text}</p>
                    <Stars rating={r.rating} />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR — Related Reads ── */}
        <aside className="w-full lg:w-[240px] lg:flex-shrink-0 flex flex-col">
          <h2 className="text-white font-semibold text-sm mb-3">Related Reads</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:overflow-y-auto lg:flex-1 pr-1">
            {related.map(rb => (
              <Link key={rb.id} href={`/book/${rb.id}`} className="flex gap-2.5 group">
                <div className="flex-shrink-0 w-[72px] h-[100px] rounded overflow-hidden" style={{ backgroundColor: rb.coverBg }}>
                  <BookCover title={rb.title} author={rb.author} bg={rb.coverBg} />
                </div>
                <div className="flex flex-col justify-between py-0.5 min-w-0">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white font-semibold text-xs leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">{rb.title}</h3>
                    <p className="text-xs">by <span className="text-blue-400">{rb.author}</span></p>
                    <p className="text-gray-400 text-[10px] leading-snug line-clamp-2">{rb.description}</p>
                    <p className="text-gray-500 text-[10px]">{rb.format}</p>
                    <div className="flex flex-wrap gap-0.5">
                      {rb.categories.map((cat, i) => (
                        <span key={cat} className="text-[10px]">
                          <span className="text-blue-400">{cat}</span>
                          {i < rb.categories.length - 1 && <span className="text-gray-600">, </span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{rb.currency}{rb.price}</p>
                    <p className="text-gray-400 text-[10px]">Delivery by <span className="font-bold text-gray-200">{rb.deliveryDate}</span></p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}
