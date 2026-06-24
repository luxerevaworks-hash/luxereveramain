import Link from "next/link";
import PageIntro from "@/components/PageIntro";

export default function AboutUsPage() {
  return (
    <div>
      <PageIntro eyebrow="Our story" title="We are Luxereva">
        Anti-tarnish jewelry, made to shine with you every day.
      </PageIntro>

      <section className="container-page py-12 max-w-3xl space-y-5 text-brown/80 leading-relaxed">
        <p>
          At Luxereva, we believe jewelry is more than an accessory — it is a reflection
          of confidence, elegance, and personal expression.
        </p>
        <p>
          Luxereva was created with a simple vision: to make premium anti-tarnish
          jewelry that combines luxury, durability, and everyday comfort. We wanted to
          offer pieces that look timeless, feel special, and stay beautiful for longer —
          without compromising on quality or affordability.
        </p>
        <p>
          Our journey began with the desire to build a brand that celebrates modern
          women who carry strength and grace in every part of life. Whether it&apos;s a
          casual day out, an important meeting, or a special celebration, we believe the
          right jewelry adds confidence to every moment.
        </p>
        <p>
          Each piece at Luxereva is carefully selected to reflect sophistication,
          minimal elegance, and lasting shine. Our anti-tarnish collection is designed
          for daily wear, giving you style that stays with you — effortlessly.
        </p>
        <p>
          Luxereva is proudly founded by Madan Mali, with the strong support and
          partnership of his Co-Founder, his aunty Nisha Bharat Mali, whose experience,
          trust, and shared vision became the foundation of this journey. Together, they
          built Luxereva with the belief that a brand should not only sell products, but
          also create emotional connection, trust, and long-term value for every
          customer.
        </p>
        <p className="font-medium text-brown-dark">
          More than just a jewelry brand, Luxereva is a promise of trust, quality, and
          timeless beauty.
        </p>
      </section>

      <section className="container-page pb-12">
        <div className="bg-brown-dark text-cream rounded-lg p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold mb-3">
              Shop the edit
            </p>
            <h2 className="text-2xl font-light">Shine everyday with Luxereva.</h2>
          </div>
          <Link href="/products" className="btn-primary">
            Shop All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
