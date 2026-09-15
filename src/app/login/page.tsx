"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, User, Users, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"registered" | "guest">("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Simulate async check
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error ?? "Login failed.");
      }
    }, 400);
  };

  const handleGuest = () => {
    loginAsGuest();
    router.push("/");
  };

  const inputCls =
    "w-full bg-[#1e1e30] border border-[#3a3a52] text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b4fcf]/60 focus:border-[#5b4fcf] placeholder-gray-600 transition-colors";

  return (
    <div className="min-h-screen flex flex-col bg-[#12122a]">
      {/* Top bar */}
      <header className="h-14 flex items-center px-4 sm:px-6 border-b border-[#2a2a3e]">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold text-base tracking-wide">Book Worm</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-2xl">

            {/* Tab switcher */}
            <div className="flex">
              <button
                onClick={() => { setTab("registered"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  tab === "registered"
                    ? "text-white border-[#5b4fcf] bg-[#5b4fcf]/10"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <User className="w-4 h-4" /> Registered User
              </button>
              <button
                onClick={() => { setTab("guest"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  tab === "guest"
                    ? "text-white border-[#5b4fcf] bg-[#5b4fcf]/10"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <Users className="w-4 h-4" /> Guest User
              </button>
            </div>

            <div className="px-5 sm:px-8 py-6 sm:py-8">

              {/* Registered login form */}
              {tab === "registered" && (
                <>
                  <div className="mb-6">
                    <h1 className="text-white font-bold text-xl">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to access your orders, wishlist &amp; more.</p>
                  </div>

                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`${inputCls} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-[#5b4fcf] hover:bg-[#4a3fbf] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-1"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      {loading ? "Signing in…" : "Sign In"}
                    </button>
                  </form>

                  {/* Demo credentials hint */}
                  <div className="mt-6 bg-[#12122a] border border-[#2a2a3e] rounded-xl p-4">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-3">Demo accounts</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Admin",  email: "admin@bookworm.com",  pw: "admin123",  role: "admin"  },
                        { label: "Member", email: "member@bookworm.com", pw: "member123", role: "member" },
                      ].map(acc => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => { setEmail(acc.email); setPassword(acc.pw); setError(""); }}
                          className="flex items-center gap-3 text-left hover:bg-[#1e1e30] rounded-lg px-3 py-2 transition-colors group"
                        >
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            acc.role === "admin"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>{acc.role}</span>
                          <span className="text-gray-400 text-xs group-hover:text-gray-200 transition-colors">{acc.email}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Guest panel */}
              {tab === "guest" && (
                <>
                  <div className="mb-6">
                    <h1 className="text-white font-bold text-xl">Continue as Guest</h1>
                    <p className="text-gray-500 text-sm mt-1">Browse our catalog without an account.</p>
                  </div>

                  {/* What guests can/can't do */}
                  <div className="flex flex-col gap-3 mb-8">
                    {[
                      { label: "Browse the full catalog",            allowed: true  },
                      { label: "Browse by category &amp; brand",     allowed: true  },
                      { label: "Add to cart &amp; checkout",         allowed: false },
                      { label: "View order history",                 allowed: false },
                      { label: "Redeem gift points &amp; coupons",   allowed: false },
                      { label: "Personalised recommendations",       allowed: false },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                          item.allowed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {item.allowed ? "✓" : "✗"}
                        </span>
                        <span
                          className="text-gray-400 text-sm"
                          dangerouslySetInnerHTML={{ __html: item.label }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGuest}
                    className="w-full flex items-center justify-center gap-2 bg-[#2a2a3e] hover:bg-[#3a3a52] border border-[#3a3a52] hover:border-[#5b4fcf] text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                  >
                    <Users className="w-4 h-4" /> Continue as Guest
                  </button>

                  <p className="text-center text-gray-600 text-xs mt-4">
                    Want full access?{" "}
                    <button onClick={() => setTab("registered")} className="text-blue-400 hover:underline">
                      Sign in instead
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
