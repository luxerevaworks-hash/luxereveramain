"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { productCategories, sampleProducts } from "@/lib/sampleProducts";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <p className="container-page py-20 text-center text-brown/60">
          Loading...
        </p>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [search, setSearch] = useState(searchParam);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllProducts(products.length ? products : sampleProducts);
      } catch (err) {
        console.error(err);
        setAllProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = allProducts.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <section className="bg-white border-b border-gold/30">
        <div className="container-page py-12 flex flex-col md:flex-row gap-6 md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold mb-3">
              Luxereva shop
            </p>
            <h1 className="text-3xl md:text-5xl font-light text-brown-dark capitalize">
              {activeCategory === "all" ? "All Products" : activeCategory}
            </h1>
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field sm:max-w-xs"
          />
          <div className="flex gap-2 flex-wrap">
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest2 border transition-colors ${
                  activeCategory === cat
                    ? "bg-brown text-cream border-brown"
                    : "border-gold text-brown-dark hover:bg-gold/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-brown/60 py-12">
            Loading products...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-brown/60 py-12">
            No products found. Add products from the Admin Panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
