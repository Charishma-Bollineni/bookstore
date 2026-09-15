"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, BookMarked, LogOut, LogIn, ChevronDown, Store, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  cartCount?: number;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin:  { label: "Admin",  cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  member: { label: "Member", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30"   },
  guest:  { label: "Guest",  cls: "bg-gray-500/20 text-gray-400 border-gray-500/30"   },
};

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [dropOpen, setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    setMobileOpen(false);
    logout();
    router.push("/login");
  };

  const canViewProtected = user?.role === "admin" || user?.role === "member";

  return (
    <header className="bg-[#12122a] border-b border-[#2a2a3e] sticky top-0 z-50">
      <div className="flex items-center h-14 px-4 gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 border-r border-[#2a2a3e] pr-4 mr-1 shrink-0">
          <BookMarked className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold text-base tracking-wide">Book Worm</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {canViewProtected && (
            <>
              <Link href="/orders"  className="text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/5 transition-colors whitespace-nowrap">My Orders</Link>
              <Link href="/wishlist" className="text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/5 transition-colors whitespace-nowrap">My Wishlist</Link>
              <Link href="/writers"  className="text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/5 transition-colors whitespace-nowrap">My Writers</Link>
              {user?.role === "admin" && (
                <Link href="/store" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm px-3 py-1.5 rounded hover:bg-amber-500/10 transition-colors border border-amber-500/20 hover:border-amber-400/40 ml-1 whitespace-nowrap">
                  <Store className="w-3.5 h-3.5" /> Manage Store
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex-1 md:hidden" />

        {/* Cart */}
        {canViewProtected && (
          <Link href="/cart" className="relative p-2 text-gray-300 hover:text-white rounded hover:bg-white/5 transition-colors" aria-label="Cart">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        )}

        {/* User menu / login — desktop */}
        {isLoggedIn ? (
          <div className="relative hidden md:block" ref={dropRef}>
            <button onClick={() => setDropOpen(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#5b4fcf] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user!.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-white text-xs font-medium">{user!.name}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wide border rounded px-1 mt-0.5 ${ROLE_BADGE[user!.role].cls}`}>
                  {ROLE_BADGE[user!.role].label}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
            </button>
            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl shadow-2xl py-1 z-50">
                <div className="px-4 py-3 border-b border-[#2a2a3e]">
                  <p className="text-white text-sm font-semibold truncate">{user!.name}</p>
                  {user!.email && <p className="text-gray-500 text-xs truncate mt-0.5">{user!.email}</p>}
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wide border rounded px-1.5 py-0.5 mt-1.5 ${ROLE_BADGE[user!.role].cls}`}>
                    {ROLE_BADGE[user!.role].label}
                  </span>
                </div>
                <div className="px-4 py-2 border-b border-[#2a2a3e]">
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-1.5">Access</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: "Browse Catalog",  val: user!.entitlements.canBrowseCatalog    },
                      { label: "Cart & Checkout", val: user!.entitlements.canCheckout         },
                      { label: "Order History",   val: user!.entitlements.canViewOrders       },
                      { label: "Gift Points",     val: user!.entitlements.canRedeemGiftPoints },
                    ].map(e => (
                      <div key={e.label} className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">{e.label}</span>
                        <span className={`text-[10px] font-bold ${e.val ? "text-emerald-400" : "text-red-400"}`}>{e.val ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="hidden md:flex items-center gap-1.5 text-sm text-gray-300 hover:text-white border border-[#3a3a52] hover:border-[#5b4fcf] px-3 py-1.5 rounded-lg transition-colors">
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#12122a] border-t border-[#2a2a3e] px-4 py-3 flex flex-col gap-1">
          {canViewProtected && (
            <>
              <Link href="/orders"   onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white text-sm px-3 py-2.5 rounded hover:bg-white/5 transition-colors">My Orders</Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white text-sm px-3 py-2.5 rounded hover:bg-white/5 transition-colors">My Wishlist</Link>
              <Link href="/writers"  onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white text-sm px-3 py-2.5 rounded hover:bg-white/5 transition-colors">My Writers</Link>
              {user?.role === "admin" && (
                <Link href="/store" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-amber-400 text-sm px-3 py-2.5 rounded hover:bg-amber-500/10 transition-colors">
                  <Store className="w-4 h-4" /> Manage Store
                </Link>
              )}
            </>
          )}
          <div className="border-t border-[#2a2a3e] mt-1 pt-2">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/10 rounded transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
