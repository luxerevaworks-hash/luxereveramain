"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageIntro from "@/components/PageIntro";

export default function BlogsPage() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setPosts([]);
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

      {posts === null ? (
        <p className="container-page py-12 text-center text-brown/60">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="container-page py-20 text-center text-brown/60">
          No journal posts yet — check back soon.
        </p>
      ) : (
        <section className="container-page py-12 grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white border border-gold/30 rounded-lg overflow-hidden">
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
                  href={`/blogs/${post.id}`}
                  className="inline-block mt-5 text-sm text-rosewood font-semibold"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
