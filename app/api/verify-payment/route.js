import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/emailTemplates";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing payment details" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ success: false, error: "Razorpay secret is not configured" }, { status: 500 });
    }

    // 1. Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const pendingRef = adminDb.collection("pendingOrders").doc(razorpay_order_id);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const pendingOrder = pendingSnap.data();

    if (pendingOrder.status === "paid") {
      return NextResponse.json({ success: true, orderId: pendingOrder.orderId });
    }

    // 2. Save order to Firestore
    const orderRef = await adminDb.collection("orders").add({
      userId: pendingOrder.userId || null,
      userEmail: pendingOrder.userEmail || pendingOrder.customer?.email || null,
      customer: pendingOrder.customer,
      items: pendingOrder.items,
      giftWrap: !!pendingOrder.giftWrap,
      subtotal: pendingOrder.subtotal,
      total: pendingOrder.total,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentMethod: pendingOrder.paymentMethod || "prepaid",
      status: "paid",
      createdAt: FieldValue.serverTimestamp(),
    });

    const confirmedOrder = {
      id: orderRef.id,
      customer: pendingOrder.customer,
      items: pendingOrder.items,
      total: pendingOrder.total,
      paymentMethod: pendingOrder.paymentMethod || "prepaid",
    };
    sendOrderConfirmationWhatsApp(confirmedOrder).catch((e) => console.error(e));
    if (pendingOrder.customer?.email) {
      const { subject, html } = orderConfirmationEmail(confirmedOrder);
      sendEmail({ to: pendingOrder.customer.email, subject, html }).catch((e) => console.error(e));
    }

    // 3. Decrement stock for each purchased item (best-effort)
    for (const item of pendingOrder.items || []) {
      try {
        const productRef = adminDb.collection("products").doc(item.id);
        await productRef.update({
          stock: FieldValue.increment(-item.qty),
        });
      } catch (e) {
        console.error("Stock update failed for", item.id, e);
      }
    }

    await pendingRef.update({
      status: "paid",
      orderId: orderRef.id,
      paymentId: razorpay_payment_id,
      paidAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
