"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    active: true,
  });

  async function load() {
    setLoading(true);
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCoupon(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "coupons"), {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value) || 0,
        active: form.active,
        createdAt: serverTimestamp(),
      });
      toast.success("Coupon created");
      setForm({ code: "", type: "percent", value: "", active: true });
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create coupon");
    }
  }

  async function toggleCoupon(coupon) {
    try {
      await updateDoc(doc(db, "coupons", coupon.id), { active: !coupon.active });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update coupon");
    }
  }

  async function removeCoupon(id) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete coupon");
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
            Coupons
          </h1>
          <p className="text-sm text-brown/60 mt-2">
            Create promo codes for discounts and campaigns.
          </p>
        </div>

        <form onSubmit={createCoupon} className="bg-white border border-gold/30 rounded-lg p-5 grid md:grid-cols-[1fr_160px_160px_auto] gap-4 mb-8">
          <input
            className="input-field"
            placeholder="Code, e.g. LUXE10"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            required
          />
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed INR</option>
          </select>
          <input
            type="number"
            className="input-field"
            placeholder="Value"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            required
          />
          <button className="btn-primary">Create</button>
        </form>

        {loading ? (
          <p className="text-brown/60">Loading...</p>
        ) : coupons.length === 0 ? (
          <p className="text-brown/60">No coupons yet.</p>
        ) : (
          <div className="bg-white border border-gold/30 rounded-lg divide-y divide-gold/20">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-brown-dark">{coupon.code}</p>
                  <p className="text-sm text-brown/60">
                    {coupon.type === "percent" ? `${coupon.value}% off` : `${coupon.value} INR off`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => toggleCoupon(coupon)} className="btn-outline py-2 px-4">
                    {coupon.active ? "Active" : "Paused"}
                  </button>
                  <button onClick={() => removeCoupon(coupon.id)} className="text-rosewood text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
