"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { items, hydrated } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    async function load() {
      setLoading(true);
      try {
        const results = await Promise.all(
          items.map(async (item) => {
            const snap = await getDoc(doc(db, "products", item.id));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setProducts(results.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [items, hydrated]);

  if (!hydrated || loading) {
    return (
      <p className="container-page py-20 text-center text-brown/60">
        Loading wishlist…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-4">
          Your Wishlist is Empty
        </h1>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-8">
        My Wishlist
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
