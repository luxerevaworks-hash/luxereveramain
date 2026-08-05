import PageIntro from "@/components/PageIntro";

export const metadata = { title: "Refund & Returns Policy", description: "Luxereva return, exchange and refund policy." };

export default function RefundReturnsPolicyPage() {
  return <div><PageIntro eyebrow="Support" title="Refund & Returns Policy">Please read this policy before placing an order.</PageIntro><section className="container-page py-12 max-w-3xl space-y-7 text-sm text-brown/75 leading-relaxed"><div><h2 className="text-brown-dark font-medium mb-2">Returns and refunds</h2><p>Luxereva does not offer returns or refunds. Please review the product description, images and dimensions carefully before ordering.</p></div><div><h2 className="text-brown-dark font-medium mb-2">Exchanges</h2><p>Where an exchange is offered for an eligible item, it is subject to review and the product being unused and in its original condition. Contact us promptly if there is an issue with your order.</p></div><div><h2 className="text-brown-dark font-medium mb-2">Damaged or incorrect orders</h2><p>Contact <a className="text-rosewood" href="mailto:info@luxereva.com">info@luxereva.com</a> with your order number and clear photos as soon as possible, so we can review the issue.</p></div></section></div>;
}
