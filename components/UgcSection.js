"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FiMaximize2, FiPause, FiPlay } from "react-icons/fi";

const DEFAULT_TITLE = "Loved By Thousands";
const DEFAULT_SUBTITLE =
  "Real customer videos, unboxings, and first impressions from the Luxereva community.";
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

export default function UgcSection({ ugc }) {
  const customItems = (ugc?.items || []).filter(
    (item) => item.image || item.video || item.link
  );
  const items = customItems.length ? customItems : DEFAULT_ITEMS;

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container-page">
        <h2 className="text-center font-serif text-3xl sm:text-4xl font-semibold text-brown-dark">
          {ugc?.title || DEFAULT_TITLE}
        </h2>
        <p className="text-center text-brown/60 mt-3 max-w-2xl mx-auto text-[11px] uppercase tracking-[0.22em] font-semibold">
          {ugc?.subtitle || DEFAULT_SUBTITLE}
        </p>

        <div className="mt-10 flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map((item) => (
            <ReelCard
              key={item.id}
              item={item}
            />
          ))}
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

function ReelCard({ item }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  function togglePlayback() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }

  return (
    <article className="shrink-0 snap-start w-[185px] sm:w-[215px] md:w-[235px]">
      <div className="relative aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-black border border-gold/20 shadow-sm">
        {item.video ? (
          <video
            ref={videoRef}
            src={item.video}
            poster={item.image || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <Image
            src={item.image}
            alt={item.caption || "Customer styled Luxereva piece"}
            fill
            className="object-cover"
          />
        )}

        {item.video && (
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause customer video" : "Play customer video"}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          >
            {isPlaying ? <FiPause className="h-3.5 w-3.5" /> : <FiPlay className="h-3.5 w-3.5" />}
          </button>
        )}
        <FiMaximize2 className="absolute top-4 left-4 h-3.5 w-3.5 text-white/80" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pb-4 pt-16">
          {item.caption && (
            <p className="text-white text-xs font-semibold uppercase tracking-wider leading-snug line-clamp-2">
              {item.caption}
            </p>
          )}
          <p className="text-white/80 text-xs mt-2">Customer video</p>
        </div>
      </div>
    </article>
  );
}
