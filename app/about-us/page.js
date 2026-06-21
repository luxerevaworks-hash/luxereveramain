import Link from "next/link";
import PageIntro from "@/components/PageIntro";

export default function AboutUsPage() {
  return (
    <div>
      <PageIntro eyebrow="Our story" title="About Luxereva">
        Luxereva curates premium beauty, fragrance, and lifestyle essentials for
        refined everyday rituals.
      </PageIntro>

      <section className="container-page py-12 grid md:grid-cols-3 gap-6">
        {[
          ["Curated quality", "Every product is chosen for feel, finish, and daily usefulness."],
          ["Quiet luxury", "Clean design, polished formulas, and thoughtful details lead the experience."],
          ["Easy rituals", "The shop is built around simple routines that feel elevated without effort."],
        ].map(([title, copy]) => (
          <div key={title} className="bg-white border border-gold/30 rounded-lg p-6">
            <h2 className="text-lg font-medium text-brown-dark">{title}</h2>
            <p className="mt-3 text-sm text-brown/75 leading-relaxed">{copy}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-12">
        <div className="bg-brown-dark text-cream rounded-lg p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold mb-3">
              Shop the edit
            </p>
            <h2 className="text-2xl font-light">Find your next ritual essential.</h2>
          </div>
          <Link href="/products" className="btn-primary">
            Shop All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
