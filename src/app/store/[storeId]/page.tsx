"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store, BookOpen, ShieldCheck, Plus, ChevronRight, X, AlertCircle,
  CheckCircle2, Tag, Globe, Clock, Edit2, Trash2, FileText,
  ArrowLeft, ToggleLeft, ToggleRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Catalog {
  id: string;
  name: string;
  description: string;
  categories: string[];
  bookCount: number;
  visibility: "Public" | "Members Only" | "Admin Only";
  status: "Active" | "Draft";
  createdAt: string;
}

interface StorePolicy {
  id: string;
  type: PolicyType;
  title: string;
  description: string;
  effectiveFrom: string;
  status: "Active" | "Draft";
  createdAt: string;
}

type PolicyType =
  | "Return & Refund"
  | "Shipping"
  | "Privacy"
  | "Terms of Service"
  | "Membership"
  | "Pricing";

// ─── Seed data ────────────────────────────────────────────────────────────────
const STORE_NAMES: Record<string, string> = {
  "store-001": "Book Worm India",
  "store-002": "Book Worm US",
  "store-003": "Global eBook Hub",
};

const SEED_CATALOGS: Record<string, Catalog[]> = {
  "store-001": [
    { id: "cat-001", name: "Self-Help & Growth",     description: "Books on productivity, mindset and personal development.", categories: ["Self-help", "Biography"],      bookCount: 8,  visibility: "Public",       status: "Active", createdAt: "15 Jan 2024" },
    { id: "cat-002", name: "Fiction Favourites",      description: "Bestselling fiction titles across all sub-genres.",        categories: ["Mystery", "Romance", "Fantasy"], bookCount: 14, visibility: "Public",       status: "Active", createdAt: "20 Jan 2024" },
    { id: "cat-003", name: "Members Exclusive",       description: "Premium titles available only to registered members.",     categories: ["Science Fiction", "Drama"],    bookCount: 5,  visibility: "Members Only", status: "Active", createdAt: "10 Feb 2024" },
  ],
  "store-002": [
    { id: "cat-004", name: "American Classics",       description: "Timeless US titles loved by generations.",                categories: ["Biography", "History"],         bookCount: 6,  visibility: "Public",       status: "Active", createdAt: "22 Feb 2024" },
    { id: "cat-005", name: "Sci-Fi Universe",         description: "The best science fiction and speculative fiction.",        categories: ["Science Fiction", "Fantasy"],  bookCount: 9,  visibility: "Public",       status: "Draft",  createdAt: "01 Mar 2024" },
  ],
  "store-003": [],
};

const SEED_POLICIES: Record<string, StorePolicy[]> = {
  "store-001": [
    { id: "pol-001", type: "Return & Refund",  title: "7-Day Return Policy",          description: "Customers may return physical books within 7 days of delivery for a full refund, provided the item is unused and in original condition.",                    effectiveFrom: "01 Jan 2024", status: "Active", createdAt: "01 Jan 2024" },
    { id: "pol-002", type: "Shipping",         title: "Free Standard Shipping",        description: "Orders above ₹500 qualify for free standard shipping across India. Express and same-day options are available at additional cost.",                          effectiveFrom: "01 Jan 2024", status: "Active", createdAt: "01 Jan 2024" },
    { id: "pol-003", type: "Membership",       title: "Member Benefits Policy",        description: "Registered members receive early access to new launches, exclusive catalog access, and 10% off on every 5th order.",                                         effectiveFrom: "15 Jan 2024", status: "Active", createdAt: "15 Jan 2024" },
    { id: "pol-004", type: "Privacy",          title: "Data & Privacy Statement",      description: "We collect only necessary personal data for order fulfilment. No data is shared with third parties without explicit consent.",                               effectiveFrom: "01 Jan 2024", status: "Active", createdAt: "01 Jan 2024" },
  ],
  "store-002": [
    { id: "pol-005", type: "Return & Refund",  title: "30-Day Return Window",          description: "US customers can return any purchase within 30 days. Digital content is non-refundable once downloaded.",                                                    effectiveFrom: "20 Feb 2024", status: "Active", createdAt: "20 Feb 2024" },
    { id: "pol-006", type: "Shipping",         title: "US Domestic Shipping",          description: "Free shipping on orders above $25. International shipping available at flat rate $12.",                                                                       effectiveFrom: "20 Feb 2024", status: "Active", createdAt: "20 Feb 2024" },
    { id: "pol-007", type: "Terms of Service", title: "Platform Terms of Service",     description: "By using Book Worm US, you agree to our terms. Accounts found in violation of platform rules will be suspended without notice.",                             effectiveFrom: "20 Feb 2024", status: "Draft",  createdAt: "20 Feb 2024" },
  ],
  "store-003": [
    { id: "pol-008", type: "Pricing",          title: "eBook Pricing Guidelines",      description: "All eBook prices are set by publishers. Book Worm does not alter publisher-recommended prices. Regional pricing may apply.",                                 effectiveFrom: "TBD",         status: "Draft",  createdAt: "05 May 2024" },
  ],
};

// ─── Shared constants ─────────────────────────────────────────────────────────
const CATEGORIES = [
  "Self-help", "Biography", "Mystery", "Romance", "Science Fiction",
  "Fantasy", "Children's", "Young Adult", "History", "Science",
  "Philosophy", "Memoir", "Drama", "Poetry", "Travel", "Cooking",
];

const POLICY_TYPES: PolicyType[] = [
  "Return & Refund", "Shipping", "Privacy", "Terms of Service", "Membership", "Pricing",
];

const VISIBILITY_OPTIONS: Catalog["visibility"][] = ["Public", "Members Only", "Admin Only"];

const STATUS_BADGE = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Draft:  "bg-amber-500/15  text-amber-400  border-amber-500/30",
};

const POLICY_TYPE_ICON: Record<PolicyType, React.ElementType> = {
  "Return & Refund":  CheckCircle2,
  "Shipping":         Globe,
  "Privacy":          ShieldCheck,
  "Terms of Service": FileText,
  "Membership":       Tag,
  "Pricing":          Tag,
};

const POLICY_TYPE_COLOR: Record<PolicyType, string> = {
  "Return & Refund":  "text-emerald-400 bg-emerald-500/10",
  "Shipping":         "text-blue-400    bg-blue-500/10",
  "Privacy":          "text-purple-400  bg-purple-500/10",
  "Terms of Service": "text-amber-400   bg-amber-500/10",
  "Membership":       "text-pink-400    bg-pink-500/10",
  "Pricing":          "text-cyan-400    bg-cyan-500/10",
};

// ─── Create Catalog Modal ─────────────────────────────────────────────────────
function CreateCatalogModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Catalog) => void;
}) {
  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [selectedCats, setSelCats]  = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Catalog["visibility"]>("Public");
  const [status, setStatus]         = useState<Catalog["status"]>("Draft");
  const [error, setError]           = useState("");

  const toggleCat = (c: string) =>
    setSelCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSubmit = () => {
    if (!name.trim()) { setError("Catalog name is required."); return; }
    if (selectedCats.length === 0) { setError("Select at least one category."); return; }
    onCreate({
      id: "cat-" + Date.now(),
      name: name.trim(),
      description: description.trim(),
      categories: selectedCats,
      bookCount: 0,
      visibility,
      status,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e] sticky top-0 bg-[#1e1e2e]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-bold text-base">Create Catalog</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Catalog Name <span className="text-red-400">*</span></label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Summer Fiction Collection"
              className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500 border-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="What books does this catalog contain?"
              className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500 border-0 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-xs font-medium">
              Categories <span className="text-red-400">*</span>
              <span className="text-gray-600 font-normal ml-1">({selectedCats.length} selected)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => { toggleCat(c); setError(""); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCats.includes(c)
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/50"
                      : "bg-[#2d2d3e] text-gray-400 border-[#3a3a52] hover:border-purple-500/30"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">Visibility</label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as Catalog["visibility"])}
                className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 border-0 appearance-none cursor-pointer"
              >
                {VISIBILITY_OPTIONS.map(v => <option key={v} className="bg-[#2d2d3e]">{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">Status</label>
              <div className="flex gap-2 h-full">
                {(["Draft", "Active"] as Catalog["status"][]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
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
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2a3e]">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg border border-[#3a3a52] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Catalog
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Policy Modal ──────────────────────────────────────────────────────
function CreatePolicyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: StorePolicy) => void;
}) {
  const [type, setType]              = useState<PolicyType>("Return & Refund");
  const [title, setTitle]            = useState("");
  const [description, setDesc]       = useState("");
  const [effectiveFrom, setEffFrom]  = useState("");
  const [status, setStatus]          = useState<StorePolicy["status"]>("Draft");
  const [error, setError]            = useState("");

  const handleSubmit = () => {
    if (!title.trim())       { setError("Policy title is required."); return; }
    if (!description.trim()) { setError("Policy description is required."); return; }
    onCreate({
      id: "pol-" + Date.now(),
      type,
      title: title.trim(),
      description: description.trim(),
      effectiveFrom: effectiveFrom.trim() || "TBD",
      status,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#2a2a3e] rounded-2xl w-full max-w-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-bold text-base">Create Store Policy</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Policy Type</label>
            <div className="grid grid-cols-3 gap-2">
              {POLICY_TYPES.map(t => {
                const Icon = POLICY_TYPE_ICON[t];
                const colorCls = POLICY_TYPE_COLOR[t];
                const sel = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-lg border transition-colors text-left ${
                      sel
                        ? colorCls + " border-current/50"
                        : "bg-[#2d2d3e] text-gray-400 border-[#3a3a52] hover:border-[#5a5a72]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${sel ? "" : "text-gray-500"}`} />
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Policy Title <span className="text-red-400">*</span></label>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. 30-Day Return Window"
              className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 border-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium">Policy Description <span className="text-red-400">*</span></label>
            <textarea
              value={description}
              onChange={e => { setDesc(e.target.value); setError(""); }}
              rows={4}
              placeholder="Describe the full policy terms…"
              className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 border-0 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">Effective From</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={e => setEffFrom(e.target.value)}
                className="bg-[#2d2d3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 border-0 [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium">Status</label>
              <div className="flex gap-2 h-full">
                {(["Draft", "Active"] as StorePolicy["status"][]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
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
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2a3e]">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg border border-[#3a3a52] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Policy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Catalog Card ─────────────────────────────────────────────────────────────
function CatalogCard({ catalog, onDelete }: { catalog: Catalog; onDelete: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-[#18182a] border border-[#2a2a3e] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{catalog.name}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{catalog.bookCount} books · {catalog.visibility}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[catalog.status]}`}>
            {catalog.status}
          </span>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1 text-gray-600 hover:text-red-400 transition-colors rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {catalog.description && (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{catalog.description}</p>
      )}

      <div className="flex flex-wrap gap-1">
        {catalog.categories.map(c => (
          <span key={c} className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/30">
            {c}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-gray-600 text-[11px] pt-1 border-t border-[#2a2a3e]">
        <Clock className="w-3 h-3" />
        <span>Created {catalog.createdAt}</span>
      </div>

      {confirmDelete && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-red-300 text-xs flex-1">Delete this catalog?</p>
          <button onClick={() => onDelete(catalog.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded transition-colors">Yes</button>
          <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-200 border border-[#3a3a52] px-2.5 py-1 rounded transition-colors">No</button>
        </div>
      )}
    </div>
  );
}

// ─── Policy Card ──────────────────────────────────────────────────────────────
function PolicyCard({ policy, onToggleStatus, onDelete }: { policy: StorePolicy; onToggleStatus: (id: string) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = POLICY_TYPE_ICON[policy.type];
  const colorCls = POLICY_TYPE_COLOR[policy.type];

  return (
    <div className="bg-[#18182a] border border-[#2a2a3e] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">{policy.title}</p>
            <p className={`text-[11px] mt-0.5 ${colorCls.split(" ")[1]}`}>{policy.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[policy.status]}`}>
            {policy.status}
          </span>
          <button
            onClick={() => onToggleStatus(policy.id)}
            title={policy.status === "Active" ? "Set to Draft" : "Activate"}
            className="p-1 text-gray-600 hover:text-amber-400 transition-colors rounded"
          >
            {policy.status === "Active"
              ? <ToggleRight className="w-4 h-4 text-emerald-400" />
              : <ToggleLeft className="w-4 h-4" />
            }
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1 text-gray-600 hover:text-red-400 transition-colors rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition-colors w-fit"
      >
        <Edit2 className="w-3 h-3" />
        {expanded ? "Hide details" : "View policy text"}
      </button>

      {expanded && (
        <p className="text-gray-400 text-xs leading-relaxed bg-[#12122a] rounded-lg px-3 py-2.5">
          {policy.description}
        </p>
      )}

      <div className="flex items-center justify-between text-gray-600 text-[11px] pt-1 border-t border-[#2a2a3e]">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Effective: {policy.effectiveFrom}</span>
        </div>
        <span>Created {policy.createdAt}</span>
      </div>

      {confirmDelete && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-red-300 text-xs flex-1">Delete this policy?</p>
          <button onClick={() => onDelete(policy.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded transition-colors">Yes</button>
          <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-200 border border-[#3a3a52] px-2.5 py-1 rounded transition-colors">No</button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = use(params);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab]       = useState<"catalogs" | "policies">("catalogs");
  const [catalogs, setCatalogs]         = useState<Catalog[]>(SEED_CATALOGS[storeId] ?? []);
  const [policies, setPolicies]         = useState<StorePolicy[]>(SEED_POLICIES[storeId] ?? []);
  const [showCreateCatalog, setShowCC]  = useState(false);
  const [showCreatePolicy, setShowCP]   = useState(false);

  const storeName = STORE_NAMES[storeId] ?? "Store";

  // Admin-only guard
  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.replace(isLoggedIn ? "/" : "/login");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== "admin") return null;

  const handleAddCatalog = (c: Catalog) => setCatalogs(prev => [c, ...prev]);
  const handleDeleteCatalog = (id: string) => setCatalogs(prev => prev.filter(c => c.id !== id));

  const handleAddPolicy = (p: StorePolicy) => setPolicies(prev => [p, ...prev]);
  const handleDeletePolicy = (id: string) => setPolicies(prev => prev.filter(p => p.id !== id));
  const handleTogglePolicyStatus = (id: string) =>
    setPolicies(prev =>
      prev.map(p => p.id === id ? { ...p, status: p.status === "Active" ? "Draft" : "Active" } : p)
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <Navbar />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/store" className="hover:text-gray-300 transition-colors">Manage Stores</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">{storeName}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/store")}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">{storeName}</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {catalogs.length} catalog{catalogs.length !== 1 ? "s" : ""} · {policies.length} polic{policies.length !== 1 ? "ies" : "y"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "catalogs" && (
              <button
                onClick={() => setShowCC(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Catalog
              </button>
            )}
            {activeTab === "policies" && (
              <button
                onClick={() => setShowCP(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Policy
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-[#1e1e2e] border border-[#2a2a3e] rounded-xl p-1 gap-1 w-fit mb-6">
          <button
            onClick={() => setActiveTab("catalogs")}
            className={`flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "catalogs" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Catalogs
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "catalogs" ? "bg-white/20 text-white" : "bg-[#2a2a3e] text-gray-400"
            }`}>{catalogs.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "policies" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Policies
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "policies" ? "bg-white/20 text-white" : "bg-[#2a2a3e] text-gray-400"
            }`}>{policies.length}</span>
          </button>
        </div>

        {/* ── CATALOGS TAB ── */}
        {activeTab === "catalogs" && (
          <>
            {catalogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#2a2a3e] flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No catalogs yet</p>
                <p className="text-gray-600 text-sm mb-5">Create a catalog to organise books for this store.</p>
                <button
                  onClick={() => setShowCC(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                {catalogs.map(c => (
                  <CatalogCard key={c.id} catalog={c} onDelete={handleDeleteCatalog} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── POLICIES TAB ── */}
        {activeTab === "policies" && (
          <>
            {policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#2a2a3e] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No policies yet</p>
                <p className="text-gray-600 text-sm mb-5">Define return, shipping, privacy and other policies for this store.</p>
                <button
                  onClick={() => setShowCP(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Policy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                {policies.map(p => (
                  <PolicyCard
                    key={p.id}
                    policy={p}
                    onToggleStatus={handleTogglePolicyStatus}
                    onDelete={handleDeletePolicy}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateCatalog && (
        <CreateCatalogModal onClose={() => setShowCC(false)} onCreate={handleAddCatalog} />
      )}
      {showCreatePolicy && (
        <CreatePolicyModal onClose={() => setShowCP(false)} onCreate={handleAddPolicy} />
      )}
    </div>
  );
}
