"use client";

import Image from "next/image";
import Link from "next/link";
import { FiX, FiShoppingBag } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import RatingStars from "@/components/RatingStars";
import ProductBadges, { getDiscountPercent } from "@/components/ProductBadges";

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const soldOut = (product.stock ?? 0) <= 0;
  const discountPercent = getDiscountPercent(product);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full grid sm:grid-cols-2 overflow-hidden relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1.5 text-brown-dark hover:text-rosewood shadow"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="relative aspect-square bg-cream">
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
          <ProductBadges product={product} className="absolute top-3 left-3" />
        </div>

        <div className="p-6 flex flex-col">
          <p className="text-xs uppercase tracking-widest2 text-sage mb-1">
            {product.category}
          </p>
          <h3 className="text-lg font-medium text-brown-dark leading-snug">
            {product.name}
          </h3>

          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="mt-2"
          />

          <div className="mt-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-gold text-lg">
                {formatPrice(product.price)}
              </span>
              {discountPercent > 0 && (
                <span className="text-sm text-brown/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <p className="text-[11px] text-emerald-700 mt-0.5">
                You save {formatPrice(product.originalPrice - product.price)}
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-brown/70 mt-4 line-clamp-4">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-5 flex flex-col gap-2">
            <button
              onClick={onAddToCart}
              disabled={soldOut}
              className="btn-primary disabled:opacity-30"
            >
              <FiShoppingBag className="w-4 h-4 mr-2" />
              {soldOut ? "Sold Out" : "Add to Bag"}
            </button>
            <Link
              href={`/products/${product.id}`}
              onClick={onClose}
              className="btn-outline text-center"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
