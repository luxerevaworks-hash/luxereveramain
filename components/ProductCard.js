"use client";

import Link from "next/link";
import Image from "next/image";
import { FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  function handleAdd(e) {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to bag`);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden border border-gold/30 hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-square bg-cream overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="text-center px-4">
              <Logo className="mx-auto w-36 h-auto text-brown-dark" />
              <p className="mt-3 text-xs uppercase tracking-widest2 text-brown/50">
                Luxereva
              </p>
            </div>
          </div>
        )}
        {product.stock <= 0 && (
          <span className="absolute top-3 left-3 bg-rosewood text-cream text-[10px] uppercase tracking-widest2 px-2 py-1 rounded">
            Sold Out
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest2 text-sage mb-1">
          {product.category}
        </p>
        <h3 className="font-medium text-brown-dark leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-gold">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="text-brown-dark hover:text-rosewood disabled:opacity-30 transition-colors"
            aria-label="Add to bag"
          >
            <FiShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
