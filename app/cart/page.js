"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { FiTrash2 } from "react-icons/fi";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, hydrated } = useCart();

  if (!hydrated) {
    return <p className="container-page py-20 text-center text-brown/60">Loading bag…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-4">
          Your Bag is Empty
        </h1>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-8">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex gap-4 bg-white border border-gold/30 rounded-xl p-4"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-brown-dark">{item.name}</h3>
                {item.variant && (
                  <p className="text-xs text-brown/60">{item.variant.name}</p>
                )}
                <p className="text-gold font-semibold mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-rosewood hover:text-brown-dark"
                  aria-label="Remove item"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gold rounded-full overflow-hidden">
                  <button
                    onClick={() => updateQty(item.key, item.qty - 1)}
                    className="w-8 h-8 text-brown-dark hover:bg-gold/20"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.key, item.qty + 1)}
                    className="w-8 h-8 text-brown-dark hover:bg-gold/20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-gold/30 rounded-xl p-6 h-fit">
          <h2 className="uppercase tracking-widest2 text-sm text-brown-dark mb-4">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-brown/70">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-brown/70">Shipping</span>
            <span className="text-sage">Calculated at checkout</span>
          </div>
          <div className="border-t border-gold/30 pt-4 flex justify-between font-semibold text-brown-dark mb-6">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
