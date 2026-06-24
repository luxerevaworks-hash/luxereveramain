import PageIntro from "@/components/PageIntro";

const SECTIONS = [
  {
    title: "1. General",
    body: "Luxereva provides artificial jewelry and related products. By placing an order, you confirm that all information provided is accurate.",
  },
  {
    title: "2. Product Information",
    body: "The company strives for accuracy in displaying product details, colors, and images, though slight variations may occur.",
  },
  {
    title: "3. Pricing",
    body: "All prices are listed in INR. We reserve the right to change pricing without prior notice.",
  },
  {
    title: "4. Orders",
    list: [
      "Orders are confirmed upon placement on the website.",
      "The company reserves the right to cancel orders due to stock issues or suspicious activity.",
    ],
  },
  {
    title: "5. Intellectual Property",
    body: "All content (images, logos, designs) belongs to Luxereva and cannot be used without permission.",
  },
  {
    title: "6. Changes to Terms",
    body: "We may update these terms anytime. Continued use of the website means acceptance of the changes.",
  },
];

export default function TermsPage() {
  return (
    <div>
      <PageIntro eyebrow="Legal" title="Terms &amp; Conditions">
        Please read these terms carefully before using Luxereva.
      </PageIntro>

      <section className="container-page py-12 max-w-3xl space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="text-brown-dark font-medium mb-2">{s.title}</h2>
            {s.body && (
              <p className="text-sm text-brown/75 leading-relaxed">{s.body}</p>
            )}
            {s.list && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-brown/75 leading-relaxed">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div>
          <h2 className="text-brown-dark font-medium mb-2">Contact Information</h2>
          <p className="text-sm text-brown/75 leading-relaxed">
            For inquiries, customers may reach the company at{" "}
            <a href="mailto:info@luxereva.com" className="text-rosewood">info@luxereva.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
