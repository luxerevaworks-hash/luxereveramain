import PageIntro from "@/components/PageIntro";

const FAQ_CATEGORIES = [
  {
    category: "Product Care & Quality",
    items: [
      {
        question: "Will the jewelry lose its color or tarnish?",
        answer:
          "Our products are crafted with quality plating to ensure durability. To maintain shine for longer, avoid contact with water, perfumes, and chemicals.",
      },
      {
        question: "Are Luxereva products skin-friendly?",
        answer:
          "Yes, our jewelry is made using skin-friendly materials designed for comfortable wear. However, individual skin sensitivities may vary.",
      },
      {
        question: "How should I take care of my jewelry?",
        list: [
          "Keep away from water and perfumes",
          "Store in a dry place",
          "Use a soft cloth to clean after use",
        ],
      },
      {
        question: "Are your products suitable for daily wear?",
        answer:
          "Yes, our designs are made for both daily wear and special occasions. Proper care will help maintain their quality.",
      },
    ],
  },
  {
    category: "Orders & Delivery",
    items: [
      {
        question: "How long does delivery take?",
        answer: "Orders are usually delivered within 3–7 business days, depending on your location.",
      },
      {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive tracking details via SMS, Email or WhatsApp.",
      },
      {
        question: "Do you offer Cash on Delivery (COD)?",
        answer: "Yes, we offer Cash on Delivery (COD) across all locations in India.",
      },
      {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled only before they are shipped. Once shipped, cancellation is not possible.",
      },
    ],
  },
  {
    category: "Returns & Exchange",
    items: [
      {
        question: "What is your exchange policy?",
        answer:
          "We offer exchanges for damaged, defective, or incorrect products. Please raise a request within 7 days of delivery.",
      },
      {
        question: "Do you offer returns or refunds?",
        answer: "We do not offer any returns or refunds under any circumstances.",
      },
    ],
  },
  {
    category: "Contact & Support",
    items: [
      {
        question: "How can I contact Luxereva?",
        node: (
          <>
            You can reach us at{" "}
            <a href="mailto:info@luxereva.com" className="text-rosewood underline">
              info@luxereva.com
            </a>{" "}
            for any queries or support, or WhatsApp{" "}
            <a
              href="https://wa.me/918421318199"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rosewood underline"
            >
              +91 84213 18199
            </a>
            .
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageIntro eyebrow="Help center" title="FAQ">
        Quick answers for shopping, products, checkout, and support.
      </PageIntro>

      <section className="container-page py-12 space-y-10">
        {FAQ_CATEGORIES.map(({ category, items }) => (
          <div key={category}>
            <p className="text-xs uppercase tracking-widest2 text-rosewood font-semibold mb-4">
              {category}
            </p>
            <div className="space-y-4">
              {items.map(({ question, answer, list, node }) => (
                <details
                  key={question}
                  className="bg-white border border-gold/30 rounded-lg p-5"
                >
                  <summary className="cursor-pointer text-brown-dark font-medium">
                    {question}
                  </summary>
                  {list ? (
                    <ul className="mt-3 text-sm text-brown/75 leading-relaxed list-disc pl-5 space-y-1">
                      {list.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-brown/75 leading-relaxed">{node || answer}</p>
                  )}
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
