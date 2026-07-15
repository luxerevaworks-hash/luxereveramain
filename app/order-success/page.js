"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";
import { GIFT_WRAP_FEE } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { fbqTrack } from "@/components/MetaPixel";
import { formatPrice } from "@/lib/utils";

const SUCCESS_STORAGE_KEY = "luxereva_last_order";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const orderId = searchParams.get("order_id") || "";

  useEffect(() => {
    try {
      const savedOrder = JSON.parse(sessionStorage.getItem(SUCCESS_STORAGE_KEY) || "null");
      if (savedOrder?.orderId === orderId) setOrder(savedOrder);
    } catch {
      setOrder(null);
    }
  }, [orderId]);

  const purchasePayload = useMemo(() => {
    if (!order?.items?.length) return null;

    return {
      value: order.total / 100,
      currency: "INR",
      content_type: "product",
      content_ids: order.items.map((item) => item.id),
      contents: order.items.map((item) => ({
        id: item.id,
        quantity: item.qty,
        item_price: item.price / 100,
      })),
      num_items: order.items.reduce((sum, item) => sum + item.qty, 0),
      order_id: order.orderId,
    };
  }, [order]);

  useEffect(() => {
    if (!orderId || !purchasePayload) return;

    const trackedKey = `luxereva_purchase_tracked_${orderId}`;
    if (sessionStorage.getItem(trackedKey)) return;

    fbqTrack("Purchase", purchasePayload);
    sessionStorage.setItem(trackedKey, "1");
  }, [orderId, purchasePayload]);

  return (
    <div className="container-page py-16 max-w-xl mx-auto text-center">
      <FiCheckCircle className="w-14 h-14 text-sage mx-auto mb-5" />
      <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-2">
        Order Placed!
      </h1>
      <p className="text-brown/70 mb-1">Thank you. Your order has been placed successfully.</p>
      {orderId && (
        <p className="text-brown/70 mb-8">
          Order ID: <span className="font-semibold text-brown-dark">#{orderId.slice(0, 8)}</span>
        </p>
      )}

      {order && (
        <div className="bg-white border border-gold/30 rounded-xl p-6 text-left mb-8">
          <ul className="space-y-2 mb-4 text-sm">
            {order.items.map((item) => (
              <li key={item.key} className="flex justify-between gap-4">
                <span className="text-brown/80">
                  {item.qty} x {item.name}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
            {order.giftWrap && (
              <li className="flex justify-between">
                <span className="text-brown/80">Gift Wrap</span>
                <span>{formatPrice(GIFT_WRAP_FEE)}</span>
              </li>
            )}
          </ul>
          <div className="border-t border-gold/30 pt-4 flex justify-between font-semibold text-brown-dark">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="text-xs text-brown/60 mt-4">
            {order.paymentMethod === "cod" ? "Pay on delivery." : "Paid via Razorpay."}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
        {user ? (
          <Link href="/account" className="btn-outline">View Order History</Link>
        ) : (
          <Link href="/signup" className="btn-outline">Create an Account</Link>
        )}
      </div>

      {!user && (
        <p className="text-sm text-brown/70">
          Already have an account?{" "}
          <Link href="/login" className="text-rosewood font-semibold">Sign in</Link> to track this order.
        </p>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
