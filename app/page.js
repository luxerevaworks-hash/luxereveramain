"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import UgcSection from "@/components/UgcSection";
import HomeReviews from "@/components/HomeReviews";
import { sampleProducts } from "@/lib/sampleProducts";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categoryImageOverrides, setCategoryImageOverrides] = useState({});
  const [banner, setBanner] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [ugc, setUgc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.bannerImage) {
            setBanner({ image: data.bannerImage, link: data.bannerLink || "" });
          }
          if (data.heroSlides?.length) setHeroSlides(data.heroSlides);
          if (data.categoryImages) setCategoryImageOverrides(data.categoryImages);
          if (data.ugc) setUgc(data.ugc);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStoreSettings();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "products"),
          where("featured", "==", true),
          limit(8)
        );
        const snap = await getDocs(q);
        const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeatured(
          products.length ? products : sampleProducts.filter((p) => p.featured)
        );
      } catch (err) {
        console.error(err);
        setFeatured(sampleProducts.filter((p) => p.featured));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <HeroSlider slides={heroSlides} />

      <section className="container-page py-14">
        <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl mb-10">
          Shop by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-8 md:gap-12">
          {CATEGORIES.map((cat) => {
            const image = categoryImageOverrides[cat.slug] || cat.image;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-shrink-0 flex-col items-center gap-2.5 sm:gap-3 group w-16 sm:w-32 md:w-44 lg:w-52"
              >
                <span className="relative block w-16 h-16 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden bg-black border border-gold/30 group-hover:border-gold transition-colors">
                  {image && (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 64px, (max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </span>
                <span className="text-brown-dark uppercase tracking-wide sm:tracking-widest2 text-[10px] sm:text-xs md:text-sm group-hover:text-rosewood transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {banner && (
        <section className="container-page py-6">
          <Link href={banner.link || "/products"} className="block relative aspect-[12/5] rounded-lg overflow-hidden border border-gold/30 bg-cream">
            <Image src={banner.image} alt="Promotion" fill className="object-contain" />
          </Link>
        </section>
      )}

      <section className="container-page py-12">
        <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl mb-8">
          Most Loved by Customers
        </h2>
        {loading ? (
          <p className="text-center text-brown/60">Loading products...</p>
        ) : featured.length === 0 ? (
          <p className="text-center text-brown/60">Products are coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link href="/products" className="btn-outline">
            View All Products
          </Link>
        </div>
      </section>

      <HomeReviews />
      <UgcSection ugc={ugc} />
    </div>
  );
}
