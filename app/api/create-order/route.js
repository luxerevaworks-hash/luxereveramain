import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { sampleProducts } from "@/lib/sampleProducts";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/emailTemplates";

const GIFT_WRAP_FEE = 12000;

async function buildServerCart(items = [], giftWrap = false) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const adminDb = getAdminDb();
  const serverItems = [];

  for (const item of items) {
    const productId = String(item?.id || "");
    const qty = Number(item?.qty || 0);

    if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      throw new Error("Invalid cart item");
    }

    const productSnap = await adminDb.collection("products").doc(productId).get();
    const product = productSnap.exists
      ? { id: productSnap.id, ...productSnap.data() }
      : sampleProducts.find((p) => p.id === productId);

    if (!product) {
      throw new Error("A product in your cart is no longer available");
    }

    if (typeof product.stock === "number" && product.stock < qty) {
      throw new Error(`${product.name} has only ${product.stock} left in stock`);
    }

    serverItems.push({
      key: String(item?.key || `${productId}-default`),
      id: productId,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || "",
      variant: item?.variant || null,
      qty,
    });
  }

  const subtotal = serverItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + (giftWrap ? GIFT_WRAP_FEE : 0);

  if (!Number.isInteger(total) || total <= 0) {
    throw new Error("Invalid order total");
  }

  return { items: serverItems, subtotal, total };
}

export async function POST(req) {
  try {
    const { userId, customer, items, giftWrap, paymentMethod } = await req.json();

    if (paymentMethod === "cod") {
      const serverCart = await buildServerCart(items, !!giftWrap);
      const adminDb = getAdminDb();

      const orderRef = await adminDb.collection("orders").add({
        userId: userId || null,
        userEmail: customer?.email || null,
        customer,
        items: serverCart.items,
        giftWrap: !!giftWrap,
        subtotal: serverCart.subtotal,
        total: serverCart.total,
        paymentMethod: "cod",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

      for (const item of serverCart.items) {
        try {
          await adminDb.collection("products").doc(item.id).update({
            stock: FieldValue.increment(-item.qty),
          });
        } catch (e) {
          console.error("Stock update failed for", item.id, e);
        }
      }

      const order = { id: orderRef.id, customer, items: serverCart.items, total: serverCart.total, paymentMethod: "cod" };
      sendOrderConfirmationWhatsApp(order).catch((e) => console.error(e));
      if (customer?.email) {
        const { subject, html } = orderConfirmationEmail(order);
        sendEmail({ to: customer.email, subject, html }).catch((e) => console.error(e));
      }

      return NextResponse.json({ success: true, orderId: orderRef.id });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay keys are not configured" }, { status: 500 });
    }

    const serverCart = await buildServerCart(items, !!giftWrap);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: serverCart.total,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId || "guest",
        source: "luxereva_checkout",
      },
    });

    await getAdminDb().collection("pendingOrders").doc(order.id).set({
      razorpayOrderId: order.id,
      userId: userId || null,
      userEmail: customer?.email || null,
      customer,
      items: serverCart.items,
      giftWrap: !!giftWrap,
      subtotal: serverCart.subtotal,
      total: serverCart.total,
      paymentMethod: "prepaid",
      status: "created",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
