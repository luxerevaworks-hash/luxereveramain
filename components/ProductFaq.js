function buildFaqs(productName) {
  return [
    {
      question: `Will ${productName} lose its color or tarnish?`,
      answer:
        "Our products are crafted with quality plating to ensure durability. To maintain shine for longer, avoid contact with water, perfumes, and chemicals.",
    },
    {
      question: `Is ${productName} skin-friendly?`,
      answer:
        "Yes, our jewelry is made using skin-friendly materials designed for comfortable wear. However, individual skin sensitivities may vary.",
    },
    {
      question: "Is this piece suitable for daily wear?",
      answer:
        "Yes, our designs are made for both daily wear and special occasions. Proper care will help maintain their quality.",
    },
    {
      question: "What is the delivery timeline?",
      answer: "Orders are usually delivered within 3–7 business days, depending on your location.",
    },
    {
      question: "What is your exchange policy?",
      answer:
        "We offer exchanges for damaged, defective, or incorrect products. Please raise a request within 7 days of delivery.",
    },
    {
      question: "How do I claim the warranty?",
      answer:
        "This piece comes with a 1-year warranty on gold plating. Message us at info@luxereva.com or WhatsApp +91 84213 18199 with your order ID, and our team will take it from there.",
    },
  ];
}

export default function ProductFaq({ productName }) {
  const faqs = buildFaqs(productName);

  return (
    <section className="container-page mt-14">
      <p className="text-xs uppercase tracking-widest2 text-brown/50 mb-1">Know Before You Buy</p>
      <h2 className="text-2xl md:text-3xl font-light text-brown-dark mb-8">
        Frequently Asked <span className="italic text-rosewood">Questions</span>
      </h2>
      <div className="max-w-2xl space-y-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="group bg-white border border-gold/20 rounded-xl p-5">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-brown-dark font-medium">
              {faq.question}
              <span className="flex-shrink-0 text-gold text-lg leading-none transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-brown/75 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
