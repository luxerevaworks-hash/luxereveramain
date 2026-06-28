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
  const [categoryImages, setCategoryImages] = useState({});
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

  useEffect(() => {
    async function loadCategoryImages() {
      const images = {};
      await Promise.all(
        CATEGORIES.map(async (cat) => {
          try {
            const q = query(
              collection(db, "products"),
              where("category", "==", cat.slug),
              limit(1)
            );
            const snap = await getDocs(q);
            const product = snap.docs[0]?.data();
            if (product?.images?.[0]) images[cat.slug] = product.images[0];
          } catch (err) {
            console.error(err);
          }
        })
      );
      setCategoryImages(images);
    }
    loadCategoryImages();
  }, []);

  return (
    <div>
      <HeroSlider slides={heroSlides} />

      <section className="container-page py-14">
        <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl mb-10">
          Shop by Category
        </h2>
        <div className="flex justify-center gap-4 sm:gap-8">
          {CATEGORIES.map((cat) => {
            const image = categoryImageOverrides[cat.slug] || categoryImages[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2.5 sm:gap-3 group w-16 sm:w-32 md:w-40"
              >
                <span className="relative block w-16 h-16 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-cream border border-gold/30 group-hover:border-gold transition-colors">
                  {image ? (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-brown-dark/40 text-xs uppercase">
                      {cat.name[0]}
                    </span>
                  )}
                </span>
                <span className="text-brown-dark uppercase tracking-wide sm:tracking-widest2 text-[10px] sm:text-xs group-hover:text-rosewood transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {banner && (
        <section className="container-page py-6">
          <Link href={banner.link || "/products"} className="block relative aspect-[2/1] rounded-lg overflow-hidden border border-gold/30">
            <Image src={banner.image} alt="Promotion" fill className="object-cover" />
          </Link>
        </section>
      )}

      <section className="container-page py-12">
        <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl mb-8">
          Featured Products
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
