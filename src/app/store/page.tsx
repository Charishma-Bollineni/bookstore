"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store, Plus, ChevronRight, BookOpen, ShieldCheck,
  Globe, Clock, CheckCircle2, X, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StoreRecord {
  id: string;
  name: string;
  description: string;
  region: string;
  currency: string;
  status: "Active" | "Draft" | "Archived";
  catalogCount: number;
  policyCount: number;
  createdAt: string;
}

const STATUS_BADGE: Record<StoreRecord["status"], string> = {
  Active:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Draft:    "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Archived: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const REGIONS = ["India", "USA", "UK", "Australia", "Canada", "Singapore", "UAE"];
const CURRENCIES = ["₹ INR", "$ USD", "£ GBP", "A$ AUD", "CA$ CAD", "S$ SGD", "AED"];

const INITIAL_STORES: StoreRecord[] = [
  {
    id: "store-001",
    name: "Book Worm India",
    description: "Primary storefront for the Indian subcontinent market.",
    region: "India",
    currency: "₹ INR",
    status: "Active",
    catalogCount: 3,
    policyCount: 4,
    createdAt: "12 Jan 2024",
  },
  {
    id: "store-002",
    name: "Book Worm US",
    description: "North American flagship store with premium titles.",
    region: "USA",
    currency: "$ USD",
    status: "Active",
    catalogCount: 2,
    policyCount: 3,
    createdAt: "20 Feb 2024",
  },
  {
    id: "store-003",
    name: "Global eBook Hub",
    description: "Digital-only eBook marketplace — coming soon.",
    region: "Singapore",
    currency: "S$ SGD",
    status: "Draft",
    catalogCount: 0,
    policyCount: 1,
    createdAt: "05 May 2024",
  },
];

// ─── Create Store Modal ───────────────────────────────────────────────────────
function CreateStoreModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (s: StoreRecord) => void;
}) {
  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [region, setRegion]       = useState("India");
  const [currency, setCurrency]   = useState("₹ INR");
  const [status, setStatus]       = useState<StoreRecord["status"]>("Draft");
  const [error, setError]         = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("Store name is required."); return; }
    const newStore: StoreRecord = {
      id: "store-" + Date.now(),
      name: name.trim(),
      description: description.trim(),
      region,
      currency,
      status,
      catalogCount: 0,
      policyCount: 0,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
    onCreate(newStore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-bold text-base">Create New Store</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Store Name <span className="text-red-400">*</span></label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Book Worm Europe"
              className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 border-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="Brief description of this store…"
              className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 border-0 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">Region</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 border-0 appearance-none cursor-pointer"
              >
                {REGIONS.map(r => <option key={r} className="bg-[#2d2d3e]">{r}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 border-0 appearance-none cursor-pointer"
              >
                {CURRENCIES.map(c => <option key={c} className="bg-[#2d2d3e]">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Initial Status</label>
            <div className="flex gap-3">
              {(["Draft", "Active"] as StoreRecord["status"][]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    status === s
                      ? STATUS_BADGE[s] + " border-current"
                      : "bg-[#2d2d3e] text-gray-400 border-[#3a3a52] hover:border-[#5a5a72]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2a3e]">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg border border-[#3a3a52] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Store
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Store Card ───────────────────────────────────────────────────────────────
function StoreCard({ store }: { store: StoreRecord }) {
  return (
    <Link
      href={`/store/${store.id}`}
      className="group bg-[#1e1e2e] border border-[#2a2a3e] hover:border-blue-500/40 rounded-xl p-5 flex flex-col gap-3 transition-all"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">{store.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{store.region} · {store.currency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[store.status]}`}>
            {store.status}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>

      {/* Description */}
      {store.description && (
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{store.description}</p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-1 border-t border-[#2a2a3e]">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-gray-400 text-xs">{store.catalogCount} catalog{store.catalogCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-400 text-xs">{store.policyCount} polic{store.policyCount !== 1 ? "ies" : "y"}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock className="w-3 h-3 text-gray-600" />
          <span className="text-gray-600 text-[11px]">Created {store.createdAt}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StorePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [stores, setStores]         = useState<StoreRecord[]>(INITIAL_STORES);
  const [showCreate, setShowCreate] = useState(false);

  // Admin-only guard
  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.replace(isLoggedIn ? "/" : "/login");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== "admin") return null;

  const handleCreate = (s: StoreRecord) => setStores(prev => [s, ...prev]);

  const activeCount   = stores.filter(s => s.status === "Active").length;
  const draftCount    = stores.filter(s => s.status === "Draft").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">Manage Stores</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-xl font-bold">Manage Stores</h1>
            <p className="text-gray-400 text-xs mt-1">
              {stores.length} store{stores.length !== 1 ? "s" : ""} total
              {activeCount > 0 && <span className="ml-2 text-emerald-400">· {activeCount} active</span>}
              {draftCount > 0  && <span className="ml-2 text-amber-400">· {draftCount} draft</span>}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Store
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Stores",  value: stores.length,   icon: Store,       color: "text-blue-400",    bg: "bg-blue-500/10"   },
            { label: "Total Catalogs", value: stores.reduce((s, x) => s + x.catalogCount, 0), icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Total Policies", value: stores.reduce((s, x) => s + x.policyCount,  0), icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl px-5 py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-white font-bold text-xl leading-tight">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Store grid */}
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#2a2a3e] flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium mb-1">No stores yet</p>
            <p className="text-gray-600 text-sm mb-5">Create your first store to get started.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {stores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateStoreModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
