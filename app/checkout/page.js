"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { FiCheckCircle } from "react-icons/fi";
import { useCart, GIFT_WRAP_FEE } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import GiftWrapOption from "@/components/GiftWrapOption";
import { fbqTrack } from "@/components/MetaPixel";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hydrated, giftWrap, setGiftWrap } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("prepaid");
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const total = subtotal + (giftWrap ? GIFT_WRAP_FEE : 0);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.displayName || f.name,
        email: user.email || f.email,
      }));
    }
  }, [user]);

  if (placedOrder) {
    return (
      <div className="container-page py-16 max-w-xl mx-auto text-center">
        <FiCheckCircle className="w-14 h-14 text-sage mx-auto mb-5" />
        <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-2">
          Order Placed!
        </h1>
        <p className="text-brown/70 mb-1">Thank you — your order has been placed successfully.</p>
        <p className="text-brown/70 mb-8">
          Order ID: <span className="font-semibold text-brown-dark">#{placedOrder.orderId.slice(0, 8)}</span>
        </p>

        <div className="bg-white border border-gold/30 rounded-xl p-6 text-left mb-8">
          <ul className="space-y-2 mb-4 text-sm">
            {placedOrder.items.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span className="text-brown/80">
                  {item.qty} × {item.name}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
            {placedOrder.giftWrap && (
              <li className="flex justify-between">
                <span className="text-brown/80">Gift Wrap</span>
                <span>{formatPrice(GIFT_WRAP_FEE)}</span>
              </li>
            )}
          </ul>
          <div className="border-t border-gold/30 pt-4 flex justify-between font-semibold text-brown-dark">
            <span>Total</span>
            <span>{formatPrice(placedOrder.total)}</span>
          </div>
          <p className="text-xs text-brown/60 mt-4">
            {placedOrder.paymentMethod === "cod" ? "Pay on delivery." : "Paid via Razorpay."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a href="/products" className="btn-primary">Continue Shopping</a>
          {user ? (
            <a href="/account" className="btn-outline">View Order History</a>
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

  if (hydrated && items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-4">
          Your Bag is Empty
        </h1>
        <a href="/products" className="btn-primary">Continue Shopping</a>
      </div>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function trackPurchase(orderId) {
    fbqTrack("Purchase", {
      value: total / 100,
      currency: "INR",
      content_type: "product",
      content_ids: items.map((i) => i.id),
      contents: items.map((i) => ({ id: i.id, quantity: i.qty, item_price: i.price / 100 })),
      num_items: items.reduce((sum, i) => sum + i.qty, 0),
      order_id: orderId,
    });
  }

  async function handlePay(e) {
    e.preventDefault();

    if (!user) {
      router.push("/login?redirect=%2Fcheckout");
      return;
    }

    setSubmitting(true);

    try {
      if (paymentMethod === "cod") {
        const codRes = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.uid || null,
            customer: form,
            items,
            giftWrap,
            paymentMethod: "cod",
          }),
        });
        const codData = await codRes.json();
        if (!codData?.success) throw new Error(codData?.error || "Could not place order");

        trackPurchase(codData.orderId);
        setPlacedOrder({ orderId: codData.orderId, items, total, giftWrap, paymentMethod: "cod" });
        clearCart();
        toast.success("Order placed! Pay on delivery.");
        return;
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("Razorpay public key is not configured");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again.");
      }

      // 1. Create a Razorpay order on the server
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || null,
          customer: form,
          items,
          giftWrap,
          paymentMethod: "prepaid",
        }),
      });
      const orderData = await orderRes.json();

      if (!orderData?.id) throw new Error(orderData?.error || "Could not create order");

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Luxereva",
        description: "Order Payment",
        order_id: orderData.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#846348" },
        handler: async function (response) {
          try {
            // 3. Verify payment & save order on the server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData?.success) {
              trackPurchase(verifyData.orderId);
              setPlacedOrder({ orderId: verifyData.orderId, items, total, giftWrap, paymentMethod: "prepaid" });
              clearCart();
              toast.success("Payment successful! Order placed.");
            } else {
              toast.error(verifyData?.error || "Payment verification failed.");
              setSubmitting(false);
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(response.error?.description || "Payment failed.");
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  function requireAccountForCheckout(e) {
    if (!user && !authLoading) {
      e.preventDefault();
      router.push("/login?redirect=%2Fcheckout");
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="container-page py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form onSubmit={handlePay} className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark mb-4">
            Shipping Details
          </h1>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="input-field" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input-field" />
          <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className="input-field" />
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className="input-field" />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} required className="input-field" />
          </div>
          <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required className="input-field" />

          <GiftWrapOption checked={giftWrap} onChange={setGiftWrap} />

          <div>
            <p className="text-xs uppercase tracking-widest2 text-brown-dark mb-3">Payment Method</p>
            <div className="flex gap-3">
              <label
                className={`flex-1 cursor-pointer border rounded-lg px-4 py-3 text-sm text-center transition-colors ${
                  paymentMethod === "prepaid" ? "border-rosewood bg-rosewood/10 text-rosewood" : "border-gold/40 text-brown-dark"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="prepaid"
                  checked={paymentMethod === "prepaid"}
                  onChange={() => setPaymentMethod("prepaid")}
                  className="hidden"
                />
                Prepaid (Razorpay)
              </label>
              <label
                className={`flex-1 cursor-pointer border rounded-lg px-4 py-3 text-sm text-center transition-colors ${
                  paymentMethod === "cod" ? "border-rosewood bg-rosewood/10 text-rosewood" : "border-gold/40 text-brown-dark"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="hidden"
                />
                Cash on Delivery
              </label>
            </div>
          </div>

          <button
            type="submit"
            onClick={requireAccountForCheckout}
            disabled={submitting || authLoading}
            className="btn-primary w-full mt-4"
          >
            {submitting
              ? "Processing…"
              : paymentMethod === "cod"
              ? `Place Order — Pay ${formatPrice(total)} on Delivery`
              : `Pay ${formatPrice(total)} with Razorpay`}
          </button>
        </form>

        {/* Order summary */}
        <div className="bg-white border border-gold/30 rounded-xl p-6 h-fit">
          <h2 className="uppercase tracking-widest2 text-sm text-brown-dark mb-4">
            Order Summary
          </h2>
          <ul className="space-y-2 mb-4 text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span className="text-brown/80">
                  {item.qty} × {item.name}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
            {giftWrap && (
              <li className="flex justify-between">
                <span className="text-brown/80">Gift Wrap</span>
                <span>{formatPrice(GIFT_WRAP_FEE)}</span>
              </li>
            )}
          </ul>
          <div className="border-t border-gold/30 pt-4 flex justify-between font-semibold text-brown-dark">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
