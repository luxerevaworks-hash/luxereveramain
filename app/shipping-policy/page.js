import PageIntro from "@/components/PageIntro";

export const metadata = { title: "Shipping Policy", description: "Luxereva shipping and delivery information." };

export default function ShippingPolicyPage() {
  return <div><PageIntro eyebrow="Support" title="Shipping Policy">Delivery information for Luxereva orders.</PageIntro><section className="container-page py-12 max-w-3xl space-y-7 text-sm text-brown/75 leading-relaxed"><div><h2 className="text-brown-dark font-medium mb-2">Order processing</h2><p>Orders are prepared after payment confirmation. Processing and delivery estimates shown at checkout are estimates and may vary by delivery location and carrier conditions.</p></div><div><h2 className="text-brown-dark font-medium mb-2">Shipping charges and tracking</h2><p>Any applicable shipping charge is shown before you place your order. When tracking is available, it will be shared using the contact details supplied with the order.</p></div><div><h2 className="text-brown-dark font-medium mb-2">Help with delivery</h2><p>For an order or delivery query, contact <a className="text-rosewood" href="mailto:info@luxereva.com">info@luxereva.com</a> with your order details.</p></div></section></div>;
}
