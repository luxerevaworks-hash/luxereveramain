"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { sampleProducts } from "@/lib/sampleProducts";

const CATEGORIES = [
  { name: "Necklaces", slug: "necklaces" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Rings", slug: "rings" },
];

const HERO_IMAGE_WEBP = "/images/hero-photo.webp";
const HERO_IMAGE_JPG = "/images/hero-photo.jpg";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [banner, setBanner] = useState(null);
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
      <section className="bg-cream">
        <div className="container-page py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-light text-brown-dark leading-tight">
              <span className="text-rosewood">♡</span> Loved By
              <br />
              1K+ Customers
            </h1>
            <Link href="/products" className="btn-primary inline-block mt-8">
              Explore Now
            </Link>
          </div>
          <div className="h-[420px] w-full max-w-sm mx-auto md:h-[560px] md:max-w-none rounded-2xl overflow-hidden bg-cream border border-gold/20">
            <picture>
              <source srcSet={HERO_IMAGE_WEBP} type="image/webp" />
              <img
                src={HERO_IMAGE_JPG}
                alt="Luxereva jewelry"
                className="block h-full w-full object-cover object-center"
              />
            </picture>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl mb-10">
          Shop by Category
        </h2>
        <div className="flex justify-center gap-4 sm:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 sm:gap-3 group w-16 sm:w-32 md:w-40"
            >
              <span className="relative block w-16 h-16 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-cream border border-gold/30 group-hover:border-gold transition-colors">
                {categoryImages[cat.slug] ? (
                  <Image
                    src={categoryImages[cat.slug]}
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
          ))}
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
    </div>
  );
}
