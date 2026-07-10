"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiShoppingBag, FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import Logo from "@/components/Logo";
import RatingStars from "@/components/RatingStars";
import ProductBadges, { getDiscountPercent } from "@/components/ProductBadges";
import QuickViewModal from "@/components/QuickViewModal";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const soldOut = (product.stock ?? 0) <= 0;
  const inWishlist = isInWishlist?.(product.id);
  const discountPercent = getDiscountPercent(product);
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to bag`);
  }

  function handleQuickBuy(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    router.push("/checkout");
  }

  function handleWishlistToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(
      inWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`
    );
  }

  function handleQuickView(e) {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }

  return (
    <>
      <Link
        href={`/products/${product.id}`}
        className="group block bg-white rounded-lg overflow-hidden border border-gold/30 hover:shadow-lg transition-shadow"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-square bg-cream overflow-hidden">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  hovered && secondaryImage ? "opacity-0" : "opacity-100 group-hover:scale-105"
                }`}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={product.name}
                  fill
                  className={`object-cover absolute inset-0 transition-opacity duration-300 ${
                    hovered ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </>
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

          <ProductBadges product={product} className="absolute top-3 left-3 z-10" />

          <button
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1.5 shadow hover:scale-110 transition-transform"
          >
            {inWishlist ? (
              <FaHeart className="w-4 h-4 text-rosewood" />
            ) : (
              <FiHeart className="w-4 h-4 text-brown-dark" />
            )}
          </button>

          <div className="hidden sm:flex absolute inset-0 items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickView}
              className="bg-white/95 text-brown-dark rounded-full px-4 py-2 text-[11px] uppercase tracking-widest2 font-semibold flex items-center gap-1.5 shadow hover:bg-white"
            >
              <FiEye className="w-3.5 h-3.5" /> Quick View
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-widest2 text-sage mb-1">
            {product.category}
          </p>
          <h3 className="font-medium text-brown-dark leading-snug line-clamp-2">
            {product.name}
          </h3>

          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="mt-1.5"
          />

          <div className="mt-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-gold">
                {formatPrice(product.price)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-brown/40 line-through">
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

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={soldOut}
              className="flex-1 border border-brown-dark text-brown-dark hover:bg-brown-dark hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brown-dark rounded-full py-2 text-[10px] uppercase tracking-widest2 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FiShoppingBag className="w-3.5 h-3.5" /> Add to Bag
            </button>
            <button
              onClick={handleQuickBuy}
              disabled={soldOut}
              className="flex-1 bg-brown-dark text-cream hover:bg-brown disabled:opacity-30 rounded-full py-2 text-[10px] uppercase tracking-widest2 font-semibold transition-colors"
            >
              Quick Buy
            </button>
          </div>
        </div>
      </Link>

      {quickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickViewOpen(false)}
          onAddToCart={() => {
            addItem(product, 1);
            toast.success(`${product.name} added to bag`);
            setQuickViewOpen(false);
          }}
        />
      )}
    </>
  );
}
