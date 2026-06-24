"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { nanoid } from "nanoid";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    storeName: "Luxereva",
    supportEmail: "hello@luxereva.com",
    shippingFee: 0,
    freeShippingAt: 0,
    announcement: "",
    heroImage: "",
    bannerImage: "",
    bannerLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) setForm((prev) => ({ ...prev, ...snap.data() }));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `products/banner/${nanoid()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, bannerImage: url }));
      toast.success("Banner uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Banner upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleHeroUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `products/hero/${nanoid()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, heroImage: url }));
      toast.success("Hero image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Hero image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "store"), {
        ...form,
        shippingFee: Number(form.shippingFee) || 0,
        freeShippingAt: Number(form.freeShippingAt) || 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success("Settings saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl uppercase tracking-widest2 text-brown-dark">
            Settings
          </h1>
          <p className="text-sm text-brown/60 mt-2">
            Manage store details, shipping, and customer messaging.
          </p>
        </div>

        <form onSubmit={save} className="bg-white border border-gold/30 rounded-lg p-6 max-w-2xl space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Store Name</label>
              <input name="storeName" value={form.storeName} onChange={updateField} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Support Email</label>
              <input name="supportEmail" type="email" value={form.supportEmail} onChange={updateField} className="input-field mt-1" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Shipping Fee (INR)</label>
              <input name="shippingFee" type="number" min="0" value={form.shippingFee} onChange={updateField} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Free Shipping At (INR)</label>
              <input name="freeShippingAt" type="number" min="0" value={form.freeShippingAt} onChange={updateField} className="input-field mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Announcement</label>
            <textarea name="announcement" value={form.announcement} onChange={updateField} rows={4} className="input-field mt-1" />
          </div>

          <div className="border-t border-gold/30 pt-4">
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">
              Homepage Hero Background Photo
            </label>
            <input type="file" accept="image/*" onChange={handleHeroUpload} className="mt-2 block text-sm" />
            {uploading && <p className="text-xs text-brown/60 mt-1">Uploading...</p>}
            {form.heroImage && (
              <div className="relative mt-3 aspect-[2/1] max-w-md rounded-lg overflow-hidden border border-gold/30 bg-cream">
                <img src={form.heroImage} alt="Hero background" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="border-t border-gold/30 pt-4">
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">
              Homepage Promo Banner (1200 × 600px)
            </label>
            <input type="file" accept="image/*" onChange={handleBannerUpload} className="mt-2 block text-sm" />
            {uploading && <p className="text-xs text-brown/60 mt-1">Uploading...</p>}
            {form.bannerImage && (
              <div className="relative mt-3 aspect-[2/1] max-w-md rounded-lg overflow-hidden border border-gold/30 bg-cream">
                <img src={form.bannerImage} alt="Promo banner" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="text-xs uppercase tracking-widest2 text-brown-dark block mt-3">
              Banner Link (optional)
            </label>
            <input
              name="bannerLink"
              placeholder="/products?category=necklaces"
              value={form.bannerLink}
              onChange={updateField}
              className="input-field mt-1"
            />
          </div>

          <button disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </AdminLayout>
    </AdminGuard>
  );
}
