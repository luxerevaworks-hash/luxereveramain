"use client";

import { useEffect, useState } from "react";

const DEFAULT_SLIDES = [
  {
    id: "hero-earrings",
    image: "/images/hero-earrings-banner.webp",
    title: "Loved By\n1K+ Customers",
    ctaText: "Explore Now",
    ctaLink: "/products",
  },
  {
    id: "hero-necklaces",
    image: "/images/hero-necklaces-banner.webp",
    title: "Loved By\n1K+ Customers",
    ctaText: "Explore Now",
    ctaLink: "/products",
  },
  {
    id: "hero-monsoon",
    image: "/images/hero-monsoon-banner.webp",
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
    <section className="relative w-full overflow-hidden">
      {slide && (
        <img
          key={slide.id || index}
          src={slide.image}
          alt={slide.title || "Luxereva jewelry banner"}
          fetchPriority="high"
          className="block aspect-video w-full object-cover"
        />
      )}
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
