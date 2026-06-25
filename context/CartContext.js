"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "luxereva_cart";
export const GIFT_WRAP_FEE = 12000; // ₹120 in paise

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [giftWrap, setGiftWrap] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          setItems(parsed.items || []);
          setGiftWrap(!!parsed.giftWrap);
        }
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist cart to localStorage on change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, giftWrap }));
  }, [items, giftWrap, hydrated]);

  function addItem(product, qty = 1, variant = null) {
    setItems((prev) => {
      const key = `${product.id}-${variant?.id || "default"}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          variant: variant || null,
          qty,
        },
      ];
    });
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateQty(key, qty) {
    if (qty < 1) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    subtotal,
    itemCount,
    hydrated,
    giftWrap,
    setGiftWrap,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
