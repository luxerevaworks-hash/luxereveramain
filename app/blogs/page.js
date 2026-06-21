import Link from "next/link";
import PageIntro from "@/components/PageIntro";

const POSTS = [
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
  return (
    <div>
      <PageIntro eyebrow="Journal" title="Blogs">
        Notes on beauty rituals, product care, gifting, and refined everyday
        living.
      </PageIntro>

      <section className="container-page py-12 grid md:grid-cols-3 gap-6">
        {POSTS.map((post) => (
          <article key={post.title} className="bg-white border border-gold/30 rounded-lg p-6">
            <p className="text-xs uppercase tracking-widest2 text-sage mb-4">
              Luxereva journal
            </p>
            <h2 className="text-xl font-light text-brown-dark">{post.title}</h2>
            <p className="mt-3 text-sm text-brown/75 leading-relaxed">{post.excerpt}</p>
            <Link href="/products" className="inline-block mt-5 text-sm text-rosewood font-semibold">
              Shop the edit
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
