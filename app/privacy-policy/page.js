import PageIntro from "@/components/PageIntro";

export const metadata = { title: "Privacy Policy", description: "How Luxereva handles customer information." };

export default function PrivacyPolicyPage() {
  return <div><PageIntro eyebrow="Legal" title="Privacy Policy">How we collect and use information when you shop with Luxereva.</PageIntro><section className="container-page py-12 max-w-3xl space-y-7 text-sm text-brown/75 leading-relaxed"><div><h2 className="text-brown-dark font-medium mb-2">Information we collect</h2><p>We collect the contact, delivery and payment information needed to process your order and provide customer support. Payment card details are processed by our payment provider and are not stored by Luxereva.</p></div><div><h2 className="text-brown-dark font-medium mb-2">How we use it</h2><p>We use this information to fulfil orders, communicate about an order, prevent fraud and improve our store. We do not sell personal information.</p></div><div><h2 className="text-brown-dark font-medium mb-2">Contact</h2><p>For privacy requests, email <a className="text-rosewood" href="mailto:info@luxereva.com">info@luxereva.com</a>.</p></div></section></div>;
}
