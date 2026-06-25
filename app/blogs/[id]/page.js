"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "blogs", id));
        setPost(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (err) {
        console.error(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-brown/60">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-brown/60 mb-4">Blog post not found.</p>
        <Link href="/blogs" className="btn-outline">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      {post.image && (
        <div className="w-full max-h-[420px] overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="container-page py-12 max-w-2xl mx-auto">
        <Link href="/blogs" className="text-xs uppercase tracking-widest2 text-rosewood">
          ← Back to Blogs
        </Link>
        <p className="text-xs uppercase tracking-widest2 text-sage mt-6 mb-2">
          Luxereva journal
        </p>
        <h1 className="text-3xl md:text-4xl font-light text-brown-dark leading-snug">
          {post.title}
        </h1>
        <div className="mt-6 text-sm text-brown/80 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </div>
  );
}
