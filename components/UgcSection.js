"use client";

import { useEffect } from "react";
import Image from "next/image";

const DEFAULT_TITLE = "The Luxereva's Lookbook";
const DEFAULT_SUBTITLE =
  "Discover how our community styles their favorite Luxereva pieces.";
const INSTAGRAM_PROFILE = "https://www.instagram.com/luxereva/";
const DEFAULT_ITEMS = [
  {
    id: "review-reel-1",
    image: "/images/hero-earrings.webp",
    link: "https://www.instagram.com/reel/DaLF9EGTm6T/?igsh=MWFvNjl2aXBtZGwyNg==",
    caption: "Review reel",
  },
  {
    id: "review-reel-2",
    image: "/images/hero-necklaces.webp",
    link: "https://www.instagram.com/reel/DZ6_01qgvW1/?igsh=eXRjNmx5ZGZjOTlq",
    caption: "Customer styling reel",
  },
  {
    id: "review-reel-3",
    image: "/images/hero-monsoon.webp",
    link: "https://www.instagram.com/reel/DaNi97aPmuh/?igsh=MTJjc2l1ZzUyanZwbg==",
    caption: "Loved by customers",
  },
  {
    id: "review-reel-4",
    image: "/images/Necklace.webp",
    link: "https://www.instagram.com/reel/DYpZIDOywJf/?igsh=MmgzMWpzcm9jdTl4",
    caption: "Everyday Luxereva look",
  },
  {
    id: "review-reel-5",
    image: "/images/hero-photo.webp",
    link: "https://www.instagram.com/reel/DaS9dVeMVih/?igsh=MWhnOXU2dGJoYXBtYw==",
    caption: "Styled by our community",
  },
];

const INSTAGRAM_POST_PATTERN = /instagram\.com\/(reel|p)\//;

function processInstagramEmbeds() {
  if (typeof window === "undefined") return;
  if (window.instgrm?.Embeds) {
    window.instgrm.Embeds.process();
    return;
  }
  if (document.getElementById("instagram-embed-script")) return;
  const script = document.createElement("script");
  script.id = "instagram-embed-script";
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.onload = () => window.instgrm?.Embeds?.process();
  document.body.appendChild(script);
}

export default function UgcSection({ ugc }) {
  const customItems = (ugc?.items || []).filter((item) => item.image);
  const items = customItems.length ? customItems : DEFAULT_ITEMS;

  useEffect(() => {
    processInstagramEmbeds();
  }, [items]);

  const Tile = ({ item }) => {
    if (INSTAGRAM_POST_PATTERN.test(item.link || "")) {
      return (
        <div className="flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={item.link}
            data-instgrm-version="14"
            style={{ margin: 0 }}
          >
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.caption || "View this reel on Instagram"}
            </a>
          </blockquote>
        </div>
      );
    }

    return (
      <div className="relative aspect-[9/12] rounded-lg overflow-hidden bg-cream border border-gold/20 group">
        <Image
          src={item.image}
          alt={item.caption || "Customer styled Luxereva piece"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white text-sm">
          ▶
        </span>
        {item.caption && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[11px] px-3 py-2 line-clamp-1">
            {item.caption}
          </span>
        )}
      </div>
    );
  };

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container-page">
      <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl">
        {ugc?.title || DEFAULT_TITLE}
      </h2>
      <p className="text-center text-brown/60 mt-3 max-w-md mx-auto">
        - {ugc?.subtitle || DEFAULT_SUBTITLE} -
      </p>

      <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-10 mt-10">
        {items.map((item) => {
          const isReel = INSTAGRAM_POST_PATTERN.test(item.link || "");
          return (
            <div
              key={item.id}
              className={isReel ? "w-full min-w-[326px] max-w-[400px]" : "w-[45%] sm:w-[30%] md:w-[22%] max-w-[260px]"}
            >
              {isReel ? (
                <Tile item={item} />
              ) : item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <Tile item={item} />
                </a>
              ) : (
                <Tile item={item} />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-8">
        <a
          href={INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline inline-block"
        >
          View More On Instagram
        </a>
      </div>
      </div>
    </section>
  );
}
