"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageIntro from "@/components/PageIntro";

const FALLBACK_POSTS = [
  {
    title: "How to build a simple evening ritual",
    excerpt: "A calm routine built from fragrance, body care, and a few minutes of attention.",
  },
  {
    title: "Choosing skincare that fits your day",
    excerpt: "A practical guide to lightweight formulas, travel pieces, and daily glow essentials.",
  },
  {
    title: "The Luxereva gifting edit",
    excerpt: "Thoughtful product combinations for birthdays, thank-you gifts, and festive moments.",
  },
];

export default function BlogsPage() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPosts(list.length ? list : FALLBACK_POSTS);
      } catch (err) {
        console.error(err);
        setPosts(FALLBACK_POSTS);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageIntro eyebrow="Journal" title="Blogs">
        Notes on beauty rituals, product care, gifting, and refined everyday
        living.
      </PageIntro>

      <section className="container-page py-12 grid md:grid-cols-3 gap-6">
        {(posts || []).map((post) => (
          <article key={post.id || post.title} className="bg-white border border-gold/30 rounded-lg overflow-hidden">
            {post.image && (
              <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest2 text-sage mb-4">
                Luxereva journal
              </p>
              <h2 className="text-xl font-light text-brown-dark">{post.title}</h2>
              <p className="mt-3 text-sm text-brown/75 leading-relaxed">{post.excerpt}</p>
              <Link
                href={post.id ? `/blogs/${post.id}` : "/products"}
                className="inline-block mt-5 text-sm text-rosewood font-semibold"
              >
                {post.id ? "Read more" : "Shop the edit"}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
