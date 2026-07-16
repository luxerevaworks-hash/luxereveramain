"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collectionGroup, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PRODUCT_REVIEWS } from "@/components/ProductReviews";
import { FiStar } from "react-icons/fi";

const FEATURED_REVIEWS = PRODUCT_REVIEWS.map((review, index) => ({
  ...review,
  id: `product-review-${index}`,
}));

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
        const q = query(collectionGroup(db, "reviews"), orderBy("createdAt", "desc"));
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
      <div className="text-center mt-8">
        <Link href="/reviews" className="btn-outline inline-block">
          View More Reviews
        </Link>
      </div>
    </section>
  );
}
