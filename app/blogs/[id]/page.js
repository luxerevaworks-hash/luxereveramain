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

  const blocks = (post.content || "").split(/\n+/).map((block) => block.trim()).filter(Boolean);
  const isHeading = (block) =>
    block.length < 90 &&
    !block.endsWith(".") &&
    !block.endsWith("?") &&
    !block.startsWith("-") &&
    !block.startsWith("•");
  const product = post.product;
  const productHref = product?.slug || product?.id ? `/products/${product.slug || product.id}` : null;

  return (
    <div className="bg-cream min-h-screen">
      {(post.image || post.images?.[0]) && (
        <div className="w-full max-h-[420px] overflow-hidden">
          <img src={post.image || post.images[0]} alt={post.title} className="w-full h-full object-cover" />
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
        <div className="mt-8 text-[15px] text-brown/80 leading-8">
          {blocks.map((block, index) => {
            const image = index === 3 ? post.images?.[1] : index === 10 ? post.images?.[2] : null;
            return (
              <div key={`${index}-${block.slice(0, 20)}`}>
                {isHeading(block) ? (
                  <h2 className="mt-10 mb-3 text-2xl font-light text-brown-dark leading-snug">{block}</h2>
                ) : block.startsWith("-") || block.startsWith("•") ? (
                  <p className="ml-4 mb-1 before:content-['•'] before:mr-3 before:text-gold">{block.replace(/^[-•]\s*/, "")}</p>
                ) : (
                  <p className="mb-5">{block}</p>
                )}
                {image && (
                  <img
                    src={image}
                    alt={`${post.title} detail`}
                    className="my-9 w-full rounded-lg border border-gold/20 object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
        {product && productHref && (
          <aside className="mt-12 rounded-lg border border-gold/30 bg-white p-5 sm:flex sm:items-center sm:gap-5">
            {product.image && <img src={product.image} alt="" className="mb-4 h-24 w-24 rounded-md object-cover sm:mb-0" />}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest2 text-sage">Featured piece</p>
              <h2 className="mt-1 text-xl font-light text-brown-dark">{product.name}</h2>
            </div>
            <Link href={productHref} className="btn-primary mt-4 inline-block text-center sm:mt-0">
              Shop this product
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}
