"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const { user } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.displayName || f.name,
        email: user.email || f.email,
      }));
    }
  }, [user]);

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

  async function handlePay(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Create a Razorpay order on the server
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: subtotal }),
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
          // 3. Verify payment & save order on the server
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.uid || null,
              customer: form,
              items,
              total: subtotal,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData?.success) {
            clearCart();
            toast.success("Payment successful! Order placed.");
            router.push("/account");
          } else {
            toast.error("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-4">
            {submitting ? "Processing…" : `Pay ${formatPrice(subtotal)} with Razorpay`}
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
          </ul>
          <div className="border-t border-gold/30 pt-4 flex justify-between font-semibold text-brown-dark">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
