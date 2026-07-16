"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, subtotal, isCartOpen, closeCart, removeItem, updateQty } = useCart();

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-[90] ${isCartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isCartOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/30 px-5 py-4">
          <div className="flex items-center gap-2 text-brown-dark">
            <FiShoppingBag className="h-5 w-5" />
            <h2 className="text-sm font-semibold uppercase tracking-widest2">Your Bag</h2>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 text-brown-dark hover:bg-gold/15">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <FiShoppingBag className="h-10 w-10 text-gold" />
            <p className="mt-4 text-brown/70">Your bag is empty.</p>
            <Link href="/products" onClick={closeCart} className="btn-primary mt-6">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 border-b border-gold/20 pb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2">
                      <p className="flex-1 text-sm font-medium leading-snug text-brown-dark">{item.name}</p>
                      <button type="button" onClick={() => removeItem(item.key)} aria-label={`Remove ${item.name}`} className="h-fit text-brown/50 hover:text-rosewood">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.variant?.name && <p className="mt-1 text-xs text-brown/60">{item.variant.name}</p>}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-gold/35 bg-white">
                        <button type="button" onClick={() => updateQty(item.key, item.qty - 1)} aria-label={`Decrease ${item.name} quantity`} className="p-1.5 text-brown-dark"><FiMinus className="h-3.5 w-3.5" /></button>
                        <span className="w-7 text-center text-sm text-brown-dark">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.key, item.qty + 1)} aria-label={`Increase ${item.name} quantity`} className="p-1.5 text-brown-dark"><FiPlus className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="text-sm font-semibold text-gold">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gold/30 bg-white px-5 py-5">
              <div className="mb-4 flex items-center justify-between text-brown-dark">
                <span className="text-sm uppercase tracking-widest2">Subtotal</span>
                <span className="font-semibold text-gold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-brown/60">Shipping and any gift-wrap charge are calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeCart} className="btn-outline justify-center px-3">View Bag</Link>
                <Link href="/checkout" onClick={closeCart} className="btn-primary justify-center px-3">Checkout</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
