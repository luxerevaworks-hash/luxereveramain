import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { orderShippedEmail } from "@/lib/emailTemplates";

export async function POST(req) {
  try {
    const { orderId, event } = await req.json();
    if (!orderId || event !== "shipped") {
      return NextResponse.json({ error: "Unsupported notification request" }, { status: 400 });
    }

    const snap = await getAdminDb().collection("orders").doc(orderId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = { id: snap.id, ...snap.data() };

    const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_SHIPPED;
    if (templateName && order.customer?.phone) {
      sendWhatsAppMessage({
        to: order.customer.phone,
        templateName,
        params: [order.customer.name || "Customer", order.id],
      }).catch((e) => console.error(e));
    }

    if (order.customer?.email) {
      const { subject, html } = orderShippedEmail(order);
      sendEmail({ to: order.customer.email, subject, html }).catch((e) => console.error(e));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
