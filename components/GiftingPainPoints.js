const POINTS = [
  {
    emoji: "💐",
    title: "“I'll just send flowers”",
    body: "They die in 2 days. She expected more from you.",
  },
  {
    emoji: "👗",
    title: "“Let me buy clothes”",
    body: "Wrong size. Wrong color. Awkward exchange conversation.",
  },
  {
    emoji: "🧴",
    title: "“Perfume? Skincare?”",
    body: "She already has 14 moisturizers. What are you really adding?",
  },
  {
    emoji: "💸",
    title: "“Something nice under budget”",
    body: "Premium feel, personal touch, without burning a hole in your pocket.",
  },
];

export default function GiftingPainPoints() {
  return (
    <section className="container-page py-12">
      <p className="text-xs uppercase tracking-widest2 text-rosewood font-semibold mb-2">
        We get it
      </p>
      <h2 className="text-2xl md:text-3xl font-light text-brown-dark mb-8">
        Finding the perfect gift is <span className="italic text-rosewood">stressful</span>
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
        {POINTS.map((p) => (
          <div key={p.title} className="flex gap-4 bg-white border border-gold/20 rounded-xl p-4">
            <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-cream flex items-center justify-center text-2xl">
              {p.emoji}
            </span>
            <div>
              <p className="font-medium text-brown-dark">{p.title}</p>
              <p className="text-sm text-brown/60 mt-1 leading-relaxed">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
