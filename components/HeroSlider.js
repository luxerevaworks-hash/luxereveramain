"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DEFAULT_SLIDES = [
  {
    id: "hero-earrings",
    image: "/images/hero-earrings.webp",
    title: "Loved By\n1K+ Customers",
    ctaText: "Explore Now",
    ctaLink: "/products",
  },
  {
    id: "hero-necklaces",
    image: "/images/hero-necklaces.webp",
    title: "Loved By\n1K+ Customers",
    ctaText: "Explore Now",
    ctaLink: "/products",
  },
  {
    id: "hero-monsoon",
    image: "/images/hero-monsoon.webp",
    title: "Loved By\n1K+ Customers",
    ctaText: "Explore Now",
    ctaLink: "/products",
  },
];

const AUTOPLAY_MS = 5000;

export default function HeroSlider({ slides }) {
  const activeSlides = slides?.length ? slides : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % activeSlides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[index];

  return (
    <section className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[680px] overflow-hidden bg-black">
      {slide && (
        <img
          key={slide.id || index}
          src={slide.image}
          alt={slide.title || "Luxereva jewelry banner"}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/15" />

      <div className="container-page relative z-10 flex min-h-[420px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[680px] items-center py-10">
        <div className="max-w-xl text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight whitespace-pre-line">
            <span className="text-gold">{"\u2661"}</span> {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-4 text-white/80 text-base md:text-lg">{slide.subtitle}</p>
          )}
          <Link href={slide.ctaLink || "/products"} className="btn-primary inline-block mt-8">
            {slide.ctaText || "Explore Now"}
          </Link>
        </div>
      </div>

      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
          {activeSlides.map((s, i) => (
            <button
              key={s.id || i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-7 bg-gold" : "w-2 bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
