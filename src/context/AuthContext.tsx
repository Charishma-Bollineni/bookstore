"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ─── Role & Entitlement definitions ──────────────────────────────────────────
export type Role = "admin" | "member" | "guest";

export interface Entitlement {
  canBrowseCatalog: boolean;
  canAddToCart: boolean;
  canCheckout: boolean;
  canViewOrders: boolean;
  canViewWishlist: boolean;
  canViewWriters: boolean;
  canManageStore: boolean;       // admin only
  canSeeRecommendations: boolean;
  canRedeemGiftPoints: boolean;
}

const ENTITLEMENTS: Record<Role, Entitlement> = {
  admin: {
    canBrowseCatalog: true,
    canAddToCart: true,
    canCheckout: true,
    canViewOrders: true,
    canViewWishlist: true,
    canViewWriters: true,
    canManageStore: true,
    canSeeRecommendations: true,
    canRedeemGiftPoints: true,
  },
  member: {
    canBrowseCatalog: true,
    canAddToCart: true,
    canCheckout: true,
    canViewOrders: true,
    canViewWishlist: true,
    canViewWriters: true,
    canManageStore: false,
    canSeeRecommendations: true,
    canRedeemGiftPoints: true,
  },
  guest: {
    canBrowseCatalog: true,
    canAddToCart: false,
    canCheckout: false,
    canViewOrders: false,
    canViewWishlist: false,
    canViewWriters: false,
    canManageStore: false,
    canSeeRecommendations: false,
    canRedeemGiftPoints: false,
  },
};

// ─── User type ────────────────────────────────────────────────────────────────
export interface User {
  name: string;
  email: string;
  role: Role;
  entitlements: Entitlement;
}

// ─── Mock registered users ────────────────────────────────────────────────────
const REGISTERED_USERS: Array<{ email: string; password: string; name: string; role: Role }> = [
  { email: "admin@bookworm.com",   password: "admin123",  name: "Admin User",    role: "admin"  },
  { email: "member@bookworm.com",  password: "member123", name: "Charish Member", role: "member" },
  { email: "user@bookworm.com",    password: "user123",   name: "Book Lover",    role: "member" },
];

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const found = REGISTERED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: "Invalid email or password." };
    setUser({
      name: found.name,
      email: found.email,
      role: found.role,
      entitlements: ENTITLEMENTS[found.role],
    });
    return { success: true };
  }, []);

  const loginAsGuest = useCallback(() => {
    setUser({
      name: "Guest",
      email: "",
      role: "guest",
      entitlements: ENTITLEMENTS.guest,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
