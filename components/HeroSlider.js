"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const HERO_IMAGE_WEBP = "/images/hero-photo.webp";
const HERO_IMAGE_JPG = "/images/hero-photo.jpg";

const DEFAULT_SLIDE = {
  id: "default",
  image: HERO_IMAGE_JPG,
  imageWebp: HERO_IMAGE_WEBP,
  title: "Loved By\n1K+ Customers",
  subtitle: "",
  ctaText: "Explore Now",
  ctaLink: "/products",
};

const AUTOPLAY_MS = 5000;

export default function HeroSlider({ slides }) {
  const activeSlides = slides?.length ? slides : [DEFAULT_SLIDE];
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
    <section className="bg-cream">
      <div className="container-page py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-light text-brown-dark leading-tight whitespace-pre-line">
            <span className="text-rosewood">♡</span> {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-4 text-brown/70 text-base md:text-lg">{slide.subtitle}</p>
          )}
          <Link href={slide.ctaLink || "/products"} className="btn-primary inline-block mt-8">
            {slide.ctaText || "Explore Now"}
          </Link>
        </div>

        <div className="h-[420px] w-full max-w-sm mx-auto md:h-[560px] md:max-w-none rounded-2xl overflow-hidden bg-cream border border-gold/20 relative">
          <picture>
            {slide.imageWebp && <source srcSet={slide.imageWebp} type="image/webp" />}
            <img
              src={slide.image}
              alt={slide.title || "Luxereva jewelry"}
              className="block h-full w-full object-cover object-center"
            />
          </picture>

          {activeSlides.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {activeSlides.map((s, i) => (
                <button
                  key={s.id || i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-rosewood" : "w-2 bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
