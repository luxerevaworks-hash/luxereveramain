import PageIntro from "@/components/PageIntro";

const FAQS = [
  ["How do I place an order?", "Open the shop, add products to your bag, and continue to checkout."],
  ["Can I track my order?", "Yes. Sign in and visit the account page to see your order activity."],
  ["What payment options are available?", "The checkout flow supports online payment through the configured Razorpay setup."],
  ["How do I ask about a product?", "Use the contact page with the product name and your question."],
  ["Do you offer gifting?", "Gift-ready ritual edits can be created from products in the shop."],
];

export default function FaqPage() {
  return (
    <div>
      <PageIntro eyebrow="Help center" title="FAQ">
        Quick answers for shopping, products, checkout, and support.
      </PageIntro>

      <section className="container-page py-12 space-y-4">
        {FAQS.map(([question, answer]) => (
          <details
            key={question}
            className="bg-white border border-gold/30 rounded-lg p-5"
          >
            <summary className="cursor-pointer text-brown-dark font-medium">
              {question}
            </summary>
            <p className="mt-3 text-sm text-brown/75 leading-relaxed">{answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
