"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  /** variation id + personalisation, so two engravings stay separate lines */
  key: string;
  productSlug: string;
  productName: string;
  variationId: string;
  sku: string;
  optionLabels: string[];
  unitPrice: number;
  image: string;
  quantity: number;
  personalisation?: string;
};

type CartState = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  toast: string | null;
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "glover-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore after mount so the server and first client render agree.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* corrupt or unavailable storage — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* quota or private mode — the prototype still works in memory */
    }
  }, [lines, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const add = useCallback((line: Omit<CartLine, "key">) => {
    const key = `${line.variationId}::${line.personalisation ?? ""}`;
    setLines((current) => {
      const existing = current.find((l) => l.key === key);
      if (existing) {
        return current.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l,
        );
      }
      return [...current, { ...line, key }];
    });
    setToast(`${line.productName} added`);
    setOpen(true);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.key !== key)
        : current.map((l) => (l.key === key ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((l) => l.key !== key));
  }, []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    return { lines, count, subtotal, open, toast, add, setQuantity, remove, setOpen };
  }, [lines, open, toast, add, setQuantity, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
