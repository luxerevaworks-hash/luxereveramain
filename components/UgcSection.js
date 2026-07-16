"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FiMaximize2, FiPause, FiPlay, FiX } from "react-icons/fi";

const INSTAGRAM_PROFILE = "https://www.instagram.com/luxereva/";
const DEFAULT_ITEMS = [
  {
    id: "review-reel-1",
    video: "/videos/luxereva-reel-1.mp4",
    caption: "Review reel",
  },
  {
    id: "review-reel-2",
    video: "/videos/luxereva-reel-2.mp4",
    caption: "Customer styling reel",
  },
  {
    id: "review-reel-3",
    video: "/videos/luxereva-reel-3.mp4",
    caption: "Loved by customers",
  },
  {
    id: "review-reel-4",
    video: "/videos/luxereva-reel-4.mp4",
    caption: "Everyday Luxereva look",
  },
];

export default function UgcSection({ ugc }) {
  // Use configured reels when available; loading the defaults as well can make
  // too many videos start at once on mobile and leave some of them blank.
  const customItems = (ugc?.items || []).filter((item) => item.video || item.image);
  const items = customItems.length ? customItems : DEFAULT_ITEMS;
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="bg-cream/40 border-y border-gold/20 py-10 md:py-14">
      <div className="container-page">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map((item) => (
            <ReelCard
              key={item.id}
              item={item}
              onOpen={() => setActiveVideo(item)}
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
      {activeVideo && <ReelModal item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}

function ReelCard({ item, onOpen }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);

  function togglePlayback(event) {
    event.stopPropagation();
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
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${item.caption || "Luxereva video"}`}
        className="relative block w-full aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-brown-dark border border-gold/30 shadow-sm text-left"
      >
        {item.video && !failed ? (
          <video
            ref={videoRef}
            src={item.video}
            poster={item.image || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            className="absolute inset-0 h-full w-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setFailed(true)}
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.caption || "Customer styled Luxereva piece"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brown-dark to-rosewood px-6 text-center">
            <p className="text-xs uppercase tracking-widest2 text-cream/90">Video temporarily unavailable</p>
          </div>
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
      </button>
      {item.video && !failed && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause customer video" : "Play customer video"}
          className="relative -mt-11 mr-3 ml-auto z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brown-dark/75 text-cream backdrop-blur-sm"
        >
          {isPlaying ? <FiPause className="h-3.5 w-3.5" /> : <FiPlay className="h-3.5 w-3.5" />}
        </button>
      )}
    </article>
  );
}

function ReelModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 px-4 py-6">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
      >
        <FiX className="h-5 w-5" />
      </button>
      <div className="w-full max-w-[430px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-2xl">
          {item.video ? <video src={item.video} poster={item.image || undefined} controls autoPlay muted playsInline className="h-full w-full object-cover" /> : <Image src={item.image} alt={item.caption || "Customer styled Luxereva piece"} fill className="object-cover" />}
        </div>
        {item.caption && (
          <p className="mt-4 text-center text-sm font-semibold uppercase tracking-wider text-white">
            {item.caption}
          </p>
        )}
      </div>
    </div>
  );
}
