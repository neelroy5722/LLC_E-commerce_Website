"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  size: string;
  height: string;
  wood: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  ready: boolean;
}

const STORAGE_KEY = "aptbed_cart_v1";

export function cartKey(i: { size: string; height: string; wood: string }): string {
  return `${i.size}-${i.height}-${i.wood}`;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist on change (after hydration, so we don't clobber storage with []).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((a, i) => a + i.qty, 0);
    return {
      items,
      count,
      ready,
      add: (item, qty = 1) =>
        setItems((prev) => {
          const key = cartKey(item);
          const existing = prev.find((p) => cartKey(p) === key);
          if (existing) {
            return prev.map((p) => (cartKey(p) === key ? { ...p, qty: p.qty + qty } : p));
          }
          return [...prev, { ...item, qty }];
        }),
      setQty: (key, qty) =>
        setItems((prev) =>
          prev
            .map((p) => (cartKey(p) === key ? { ...p, qty: Math.max(0, qty) } : p))
            .filter((p) => p.qty > 0)
        ),
      remove: (key) => setItems((prev) => prev.filter((p) => cartKey(p) !== key)),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

function isCartItem(x: unknown): x is CartItem {
  return (
    !!x &&
    typeof x === "object" &&
    typeof (x as CartItem).size === "string" &&
    typeof (x as CartItem).height === "string" &&
    typeof (x as CartItem).wood === "string" &&
    typeof (x as CartItem).qty === "number"
  );
}
