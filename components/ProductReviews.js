"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";

const INITIAL_REVIEWS_SHOWN = 4;

export const PRODUCT_REVIEWS = [
  {
    name: "Priya Sharma",
    rating: 5,
    text: "I honestly didn't expect this quality at this price. The finish looks premium and I've been wearing it daily with no fading at all. Totally worth it.",
  },
  {
    name: "Ananya Verma",
    rating: 5,
    text: "Packaging was so beautiful and classy, it felt like I received a luxury gift. The jewelry itself is super elegant. Will definitely order again.",
  },
  {
    name: "Neha Patel",
    rating: 4.5,
    text: "I got so many compliments wearing this ring. It looks exactly like real gold and feels perfect for everyday jewelry.",
  },
  {
    name: "Riya Mehta",
    rating: 5,
    text: "Delivery was quick and the product quality is amazing. Perfect for daily wear and doesn't irritate my skin. Highly recommended.",
  },
  {
    name: "Kavya Nair",
    rating: 4,
    text: "I was a bit unsure before ordering, but I'm so happy I did. The design is minimal yet premium. Great value for money.",
  },
  {
    name: "Sneha Kulkarni",
    rating: 5,
    text: "I'm really impressed with the quality and shine of the jewelry. It goes perfectly with both traditional and western outfits.",
  },
  {
    name: "Aditi Rao",
    rating: 4.5,
    text: "The necklace looks delicate but still feels sturdy. I wore it for a family function and everyone asked where I bought it from.",
  },
  {
    name: "Meera Iyer",
    rating: 4,
    text: "Beautiful design and nice finishing. I wish the delivery updates were a little faster, but the product made up for it.",
  },
  {
    name: "Simran Kaur",
    rating: 5,
    text: "Bought this as a gift and she absolutely loved it. The box, the shine, the whole presentation felt very premium.",
  },
];

function RatingStars({ rating }) {
  return (
    <div className="flex gap-2" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, rating - star + 1)) * 100;

        return (
          <span key={star} className="relative inline-block text-3xl text-gold/25">
            <FaStar />
            <span
              className="absolute inset-0 overflow-hidden text-gold"
              style={{ width: `${fill}%` }}
            >
              <FaStar />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function ProductReviews() {
  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? PRODUCT_REVIEWS : PRODUCT_REVIEWS.slice(0, INITIAL_REVIEWS_SHOWN);

  return (
    <section className="bg-cream py-14 md:py-20">
      <div className="container-page">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest2 text-gold mb-3">
            Customer reviews
          </p>
          <h2 className="text-3xl md:text-5xl font-light text-brown-dark">
            Loved by Luxereva customers
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {visibleReviews.map((review) => (
            <article
              key={review.name}
              className="min-h-[230px] w-[280px] sm:w-[320px] flex-shrink-0 snap-start rounded-lg bg-white p-6 md:p-8"
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className="h-14 w-14 rounded-full bg-black" />
                <p className="text-base md:text-lg font-medium text-brown-dark">
                  {review.name}
                </p>
                <RatingStars rating={review.rating} />
              </div>
              <p className="mt-8 text-sm md:text-base leading-relaxed text-brown/75">
                "{review.text}"
              </p>
            </article>
          ))}
        </div>

        {PRODUCT_REVIEWS.length > INITIAL_REVIEWS_SHOWN && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="btn-outline inline-block"
            >
              {showAll ? "Show Less" : "View More Reviews"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
