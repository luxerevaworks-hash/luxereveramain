// Best-effort WhatsApp sender via Meta's WhatsApp Cloud API.
// Never throws — a notification failure must not break checkout/order flows.
// No-ops quietly if the required env vars aren't configured yet.
export async function sendWhatsAppMessage({ to, templateName, params = [] }) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v19.0";

  if (!phoneNumberId || !accessToken || !to || !templateName) return { skipped: true };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: params.length
              ? [{ type: "body", parameters: params.map((text) => ({ type: "text", text: String(text) })) }]
              : [],
          },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp send failed:", data);
      return { skipped: false, success: false, error: data };
    }
    return { skipped: false, success: true, data };
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return { skipped: false, success: false, error: err.message };
  }
}

export async function sendOrderConfirmationWhatsApp(order) {
  const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION;
  if (!templateName || !order?.customer?.phone) return;
  return sendWhatsAppMessage({
    to: order.customer.phone,
    templateName,
    params: [order.customer.name || "Customer", order.id || "", String(order.total ?? "")],
  });
}
