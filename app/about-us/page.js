import Link from "next/link";
import PageIntro from "@/components/PageIntro";

const PHILOSOPHY = [
  ["Elegance Without Excess", "We believe true luxury doesn't need to be loud. Our designs are sophisticated, timeless and effortlessly elegant—allowing the woman wearing them to remain the focus."],
  ["Made for Real Life", "Beautiful jewellery should fit into real lives. From a morning at work to an evening out, from everyday routines to celebrations, our pieces move with you and complement your personal style."],
  ["Quality You Can Feel", "Premium isn't only about how jewellery looks. It's about how it feels, how thoughtfully it is made and how confidently you can wear it. We pay attention to materials, finishing, comfort and presentation."],
  ["Timeless Over Temporary", "Trends come and go. Personal style stays. We believe in creating pieces that continue to feel beautiful long after the moment has passed."],
  ["Jewellery With Meaning", "The most valuable piece is connected to a memory, milestone, feeling or a moment when you felt like yourself. We want Luxereva jewellery to become part of those moments."],
  ["Worth Wearing, Worth Keeping", "We create pieces you genuinely want to reach for again and again—because luxury isn't about having more; it's about choosing better."],
];

export default function AboutUsPage() {
  return (
    <div>
      <PageIntro eyebrow="Our story" title="Why Luxereva Exists">
        Because everyday moments deserve a little luxury.
      </PageIntro>

      <section className="container-page max-w-3xl py-12 space-y-5 text-brown/80 leading-relaxed">
        <p>Jewellery has always been more than something we wear. It can mark a beginning, complete an outfit, celebrate a milestone, or simply remind us to feel good about ourselves on an ordinary day.</p>
        <p>But beautiful jewellery should not be reserved only for special occasions. Luxereva exists to bring the feeling of luxury into everyday life.</p>
        <p>We create thoughtfully designed jewellery for the modern woman who wants to look elegant without overthinking it—pieces that move effortlessly from everyday routines to important moments, from workdays to dinners, from quiet mornings to celebrations.</p>
        <p className="text-lg font-medium text-brown-dark">Premium design. Thoughtful quality. Effortless elegance.</p>
        <p>Every Luxereva piece is chosen and created with attention to the details that matter: design, finish, comfort and its ability to become a natural part of your personal style. We believe the right piece should become your piece—something you reach for again and again, something that feels like you.</p>
        <p>Our vision is to make premium-looking jewellery more accessible, wearable and meaningful in everyday life. You do not need a special occasion to feel special. Every day is enough of a reason.</p>
      </section>

      <section className="bg-white border-y border-gold/25">
        <div className="container-page py-14">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest2 text-gold mb-3">Our brand philosophy</p>
            <h2 className="text-3xl font-light text-brown-dark">Luxury should feel effortless.</h2>
            <p className="mt-5 text-sm leading-7 text-brown/75">Jewellery is meant to be lived in: refined enough for special moments, yet effortless enough for every day.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {PHILOSOPHY.map(([title, text], index) => (
              <article key={title} className="border border-gold/25 rounded-lg p-6 bg-cream/40">
                <p className="text-xs tracking-widest2 text-gold">0{index + 1}</p>
                <h3 className="mt-3 text-lg font-medium text-brown-dark">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-brown/75">{text}</p>
              </article>
            ))}
          </div>
          <p className="max-w-2xl mx-auto mt-10 text-center text-brown/80 leading-relaxed">We believe every woman deserves to feel elegant—not only on special occasions, but on ordinary days too. That&apos;s the idea behind every Luxereva piece: everyday elegance, thoughtfully made, effortlessly yours.</p>
        </div>
      </section>

      <section className="container-page max-w-4xl py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest2 text-gold mb-3">Meet the founders</p>
          <h2 className="text-3xl font-light text-brown-dark">A vision shaped by two perspectives.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <article className="bg-white border border-gold/30 rounded-lg p-7 sm:p-8">
            <p className="text-xs uppercase tracking-widest2 text-gold">Co-founder &amp; the face behind Luxereva</p>
            <h3 className="mt-3 text-2xl font-light text-brown-dark">Nisha Bharat Mali</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-brown/75">
              <p>Luxereva was born from a simple belief: everyday jewellery should feel special.</p>
              <p>For Nisha, jewellery has always represented more than an accessory. It is a reflection of confidence, individuality and the little moments that make every woman feel beautiful.</p>
              <p>Her appreciation for elegance, timeless design and thoughtful details became the heart behind Luxereva&apos;s brand vision: jewellery that looks luxurious, feels effortless and fits beautifully into everyday life.</p>
              <p>As Co-founder and the public face of Luxereva, Nisha represents elegance without excess, luxury without compromise and jewellery designed to become part of life&apos;s everyday moments.</p>
            </div>
            <p className="mt-6 border-l-2 border-gold pl-4 italic text-brown-dark">“Jewellery should not simply complete an outfit. It should make you feel complete.”</p>
          </article>
          <article className="bg-brown-dark text-cream rounded-lg p-7 sm:p-8">
            <p className="text-xs uppercase tracking-widest2 text-gold">Founder</p>
            <h3 className="mt-3 text-2xl font-light">Madan Mali</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-cream/75">
              <p>Behind Luxereva&apos;s entrepreneurial and strategic direction is Madan Mali, the Founder of the brand.</p>
              <p>With a vision to build Luxereva into a modern premium jewellery house, Madan leads the brand&apos;s business development, digital growth, operations and long-term strategy.</p>
              <p>While Nisha represents the heart and public identity of Luxereva, Madan works behind the scenes to build the systems, partnerships and vision that help the brand move forward.</p>
            </div>
          </article>
        </div>
        <div className="mt-8 text-center max-w-2xl mx-auto text-brown/80 leading-relaxed">
          <h3 className="text-xl font-light text-brown-dark">Two Perspectives. One Vision.</h3>
          <p className="mt-3">Nisha brings elegance, emotion and the customer perspective. Madan brings entrepreneurial vision, strategy and growth direction. Together, they are building Luxereva to create jewellery that makes every woman feel effortlessly elegant, every day.</p>
        </div>
      </section>

      <section className="container-page pb-14">
        <div className="bg-brown-dark text-cream rounded-lg p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold mb-3">Jewellery made for your everyday moments</p>
            <h2 className="text-2xl font-light">Find the pieces worth wearing.</h2>
          </div>
          <Link href="/products" className="btn-light">Shop All Products</Link>
        </div>
      </section>
    </div>
  );
}
