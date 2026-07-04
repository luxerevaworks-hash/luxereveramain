const POINTS = [
  {
    icon: "🌹",
    title: "Go with a rose?",
    body: "It's sweet, but feels too basic. You want it to feel special.",
  },
  {
    icon: "👗",
    title: "Let me get her dress?",
    body: "Wrong size. Wrong fit. Returns turn into awkward chats.",
  },
  {
    icon: "🧴",
    title: "Skincare or fragrance?",
    body: "So many options. You're not sure what she'll love.",
  },
  {
    icon: "🎁",
    title: "Want something amazing without overspending?",
    body: "You want it to feel premium, personal, and worth it— without stretching your budget.",
  },
];

export default function GiftingPainPoints() {
  return (
    <section className="bg-[#f2e7dd] py-14 md:py-20">
      <div className="container-page max-w-4xl">
        <p className="text-sm uppercase tracking-widest2 text-rosewood font-semibold mb-4">
          We get it
        </p>
        <h2 className="text-4xl md:text-6xl font-light leading-tight text-brown-dark mb-3">
          Gifting the right thing{" "}
          <span className="italic text-rosewood">isn't easy</span>
        </h2>
        <p className="text-brown/70 text-base md:text-lg mb-8">
          Finding the perfect gift is stressful.
        </p>

        <div className="space-y-5">
          {POINTS.map((point) => (
            <div
              key={point.title}
              className="flex items-center gap-5 bg-white rounded-lg p-4 sm:p-6 shadow-sm"
            >
              <span className="flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center rounded-lg bg-cream text-4xl sm:text-5xl">
                {point.icon}
              </span>
              <div>
                <h3 className="text-xl md:text-3xl font-light text-brown-dark">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm md:text-lg leading-relaxed text-brown/65">
                  {point.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
