"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collectionGroup, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FiStar } from "react-icons/fi";

const HOME_REVIEWS_LIMIT = 8;
const FEATURED_REVIEWS = [
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    rating: 5,
    text: "I honestly didn't expect this quality at this price. The finish looks premium and I've been wearing it daily with no fading at all. Totally worth it.",
  },
  {
    id: "ananya-verma",
    name: "Ananya Verma",
    rating: 5,
    text: "Packaging was so beautiful and classy, it felt like I received a luxury gift. The jewelry itself is super elegant. Will definitely order again.",
  },
  {
    id: "neha-patel",
    name: "Neha Patel",
    rating: 5,
    text: "I got so many compliments wearing this ring. It looks exactly like real gold and feels perfect for everyday wear.",
  },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} className="w-3.5 h-3.5" fill={n <= rating ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function HomeReviews() {
  const [reviews, setReviews] = useState(FEATURED_REVIEWS);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collectionGroup(db, "reviews"), orderBy("createdAt", "desc"), limit(HOME_REVIEWS_LIMIT));
        const snap = await getDocs(q);
        const loadedReviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (loadedReviews.length) {
          setReviews([
            ...FEATURED_REVIEWS,
            ...loadedReviews.filter((review) => !FEATURED_REVIEWS.some((featured) => featured.name === review.name)),
          ]);
        }
      } catch (err) {
        // Likely a missing composite index for the collection-group query — hide section.
        console.error(err);
        setReviews(FEATURED_REVIEWS);
      }
    }
    load();
  }, []);

  return (
    <section className="container-page py-12 md:py-14">
      <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl">
        Customer Reviews
      </h2>
      <p className="text-center text-brown/60 mt-2 mb-8 text-xs uppercase tracking-widest2">Loved by Luxereva customers</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-gold/20 rounded-xl p-4">
            {r.photo && (
              <img
                src={r.photo}
                alt={r.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <Stars rating={r.rating || 5} />
              <p className="text-sm text-brown/80 mt-2 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
            <p className="text-xs uppercase tracking-widest2 text-brown-dark mt-3">{r.name}</p>
          </div>
        ))}
      </div>
      {reviews.length > FEATURED_REVIEWS.length && (
        <div className="text-center mt-8">
          <Link href="/reviews" className="btn-outline inline-block">
            View More Reviews
          </Link>
        </div>
      )}
    </section>
  );
}
