"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

function getOrderTime(order) {
  if (order.createdAt?.toMillis) return order.createdAt.toMillis();
  if (order.createdAt?.seconds) return order.createdAt.seconds * 1000;
  return 0;
}

export default function AccountPage() {
  const { user, profile, loading, logout, isAdmin, saveCheckoutDetails } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [address, setAddress] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setOrdersLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load order history");
        if (!cancelled) setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Could not load order history");
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    router.push("/");
  }

  function updateAddress(event) {
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function addAddress(event) {
    event.preventDefault();
    setSavingAddress(true);
    try {
      await saveCheckoutDetails({ ...address, name: address.name || user.displayName || "", email: user.email || "" });
      setAddress({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
      setShowAddressForm(false);
      toast.success("Address saved");
    } catch (error) {
      console.error(error);
      toast.error("Could not save address");
    } finally {
      setSavingAddress(false);
    }
  }

  if (loading || !user) {
    return <p className="container-page py-20 text-center text-brown/60">Loading…</p>;
  }

  return (
    <div className="container-page py-10 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">My Account</h1>
          <p className="text-brown/70 mt-1 break-words">{user.displayName || user.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-outline flex-shrink-0">
          Sign Out
        </button>
      </div>

      {isAdmin && (
        <a href="/admin" className="btn-primary inline-block mb-8">
          Go to Admin Panel
        </a>
      )}

      <section className="mb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="uppercase tracking-widest2 text-sm text-brown-dark">Saved Addresses</h2>
          <button type="button" onClick={() => setShowAddressForm((open) => !open)} className="btn-outline text-xs">
            {showAddressForm ? "Cancel" : "Add New Address"}
          </button>
        </div>
        {profile?.savedAddresses?.length ? (
          <div className="space-y-3 mb-4">
            {profile.savedAddresses.map((savedAddress, index) => (
              <div key={savedAddress.id || index} className="bg-white border border-gold/30 rounded-xl p-4 text-sm text-brown/80">
                <p className="font-semibold text-brown-dark">{savedAddress.name}</p>
                <p>{savedAddress.address}, {savedAddress.city}, {savedAddress.state} {savedAddress.pincode}</p>
                <p>{savedAddress.phone}</p>
              </div>
            ))}
          </div>
        ) : !showAddressForm ? <p className="text-sm text-brown/60">No saved addresses yet.</p> : null}
        {showAddressForm && (
          <form onSubmit={addAddress} className="bg-white border border-gold/30 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Full Name" value={address.name} onChange={updateAddress} required className="input-field" />
            <input name="phone" placeholder="Phone Number" value={address.phone} onChange={updateAddress} required className="input-field" />
            <input name="address" placeholder="Address" value={address.address} onChange={updateAddress} required className="input-field sm:col-span-2" />
            <input name="city" placeholder="City" value={address.city} onChange={updateAddress} required className="input-field" />
            <input name="state" placeholder="State" value={address.state} onChange={updateAddress} required className="input-field" />
            <input name="pincode" placeholder="Pincode" value={address.pincode} onChange={updateAddress} required className="input-field" />
            <button type="submit" disabled={savingAddress} className="btn-primary sm:col-start-2">
              {savingAddress ? "Saving..." : "Save Address"}
            </button>
          </form>
        )}
      </section>

      <h2 className="uppercase tracking-widest2 text-sm text-brown-dark mb-4">Order History</h2>

      {ordersLoading ? (
        <p className="text-brown/60">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-brown/60">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gold/30 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-brown-dark">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-brown/60">
                    {getOrderTime(order) ? new Date(getOrderTime(order)).toLocaleString() : "Date pending"}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-widest2 px-3 py-1 rounded-full bg-sage/20 text-sage">
                  {order.status || "placed"}
                </span>
              </div>
              <ul className="text-sm text-brown/80 mb-2">
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.qty} × {item.name}
                    {item.variant ? ` (${item.variant.name})` : ""}
                  </li>
                ))}
              </ul>
              {order.customer && (
                <p className="text-xs text-brown/60 mb-2">
                  Delivering to {order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.pincode}
                </p>
              )}
              <p className="font-semibold text-gold">{formatPrice(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
