"use client";

import { useEffect, useState } from "react";
import { collectionGroup, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PRODUCT_REVIEWS } from "@/components/ProductReviews";
import { FiStar } from "react-icons/fi";

const PRODUCT_PAGE_REVIEWS = PRODUCT_REVIEWS.map((review, index) => ({ ...review, id: `product-review-${index}` }));

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} className="w-3.5 h-3.5" fill={n <= rating ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState(PRODUCT_PAGE_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collectionGroup(db, "reviews"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const storedReviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews([
          ...PRODUCT_PAGE_REVIEWS,
          ...storedReviews.filter((review) => !PRODUCT_PAGE_REVIEWS.some((productReview) => productReview.name === review.name)),
        ]);
      } catch (err) {
        console.error(err);
        setReviews(PRODUCT_PAGE_REVIEWS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="container-page py-14">
      <h1 className="text-center uppercase tracking-widest2 text-brown-dark text-xl mb-10">
        What Our Customers Say
      </h1>

      {loading ? (
        <p className="text-center text-brown/60">Loading reviews...</p>
      ) : (
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
              <p className="text-sm text-brown/80 mt-2 leading-relaxed">{r.text}</p>
              <p className="text-xs uppercase tracking-widest2 text-brown-dark mt-3">{r.name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
