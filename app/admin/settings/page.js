"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { nanoid } from "nanoid";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { CATEGORIES } from "@/lib/categories";

async function uploadToStorage(file, folder) {
  const path = `products/${folder}/${nanoid()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

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
    heroSlides: [],
    categoryImages: {},
    ugc: { title: "", subtitle: "", items: [] },
    liveViewers: { enabled: true },
    deliveryEstimate: { enabled: true, minDays: 5, maxDays: 7 },
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

  // ---- Hero slides ----
  function addHeroSlide() {
    setForm((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        { id: nanoid(), image: "", title: "", subtitle: "", ctaText: "", ctaLink: "" },
      ],
    }));
  }

  function updateHeroSlide(id, field, value) {
    setForm((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  }

  function removeHeroSlide(id) {
    setForm((prev) => ({ ...prev, heroSlides: prev.heroSlides.filter((s) => s.id !== id) }));
  }

  async function handleHeroSlideImageUpload(id, file) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "heroSlides");
      updateHeroSlide(id, "image", url);
      toast.success("Slide image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Slide image upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ---- Category images ----
  async function handleCategoryImageUpload(slug, file) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "categories");
      setForm((prev) => ({
        ...prev,
        categoryImages: { ...prev.categoryImages, [slug]: url },
      }));
      toast.success("Category image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Category image upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ---- UGC / Lookbook ----
  function updateUgcField(field, value) {
    setForm((prev) => ({ ...prev, ugc: { ...prev.ugc, [field]: value } }));
  }

  function addUgcItem() {
    setForm((prev) => ({
      ...prev,
      ugc: {
        ...prev.ugc,
        items: [...(prev.ugc.items || []), { id: nanoid(), image: "", video: "", link: "", caption: "" }],
      },
    }));
  }

  function updateUgcItem(id, field, value) {
    setForm((prev) => ({
      ...prev,
      ugc: {
        ...prev.ugc,
        items: prev.ugc.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
      },
    }));
  }

  function removeUgcItem(id) {
    setForm((prev) => ({
      ...prev,
      ugc: { ...prev.ugc, items: prev.ugc.items.filter((it) => it.id !== id) },
    }));
  }

  async function handleUgcMediaUpload(id, file) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "ugc");
      const field = file.type.startsWith("video/") ? "video" : "image";
      updateUgcItem(id, field, url);
      toast.success(`${field === "video" ? "Video" : "Image"} uploaded`);
    } catch (err) {
      console.error(err);
      toast.error("Media upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ---- Live viewers / delivery estimate ----
  function updateLiveViewers(field, value) {
    setForm((prev) => ({ ...prev, liveViewers: { ...prev.liveViewers, [field]: value } }));
  }

  function updateDeliveryEstimate(field, value) {
    setForm((prev) => ({
      ...prev,
      deliveryEstimate: { ...prev.deliveryEstimate, [field]: value },
    }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "store"), {
        ...form,
        shippingFee: Number(form.shippingFee) || 0,
        freeShippingAt: Number(form.freeShippingAt) || 0,
        liveViewers: {
          enabled: !!form.liveViewers.enabled,
        },
        deliveryEstimate: {
          enabled: !!form.deliveryEstimate.enabled,
          minDays: Number(form.deliveryEstimate.minDays) || 0,
          maxDays: Number(form.deliveryEstimate.maxDays) || 0,
        },
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
              Homepage Promo Banner (1200 × 500px)
            </label>
            <input type="file" accept="image/*" onChange={handleBannerUpload} className="mt-2 block text-sm" />
            {uploading && <p className="text-xs text-brown/60 mt-1">Uploading...</p>}
            {form.bannerImage && (
              <div className="relative mt-3 aspect-[12/5] max-w-md rounded-lg overflow-hidden border border-gold/30 bg-cream">
                <img src={form.bannerImage} alt="Promo banner" className="w-full h-full object-contain" />
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

          {/* Hero Slides */}
          <div className="border-t border-gold/30 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">
                Homepage Hero Slides
              </label>
              <button type="button" onClick={addHeroSlide} className="text-xs text-rosewood font-semibold">
                + Add Slide
              </button>
            </div>
            <p className="text-xs text-brown/50 mt-1">
              Leave empty to keep the default single hero. Each slide replaces the hero text + photo.
            </p>
            <div className="space-y-4 mt-3">
              {form.heroSlides.map((slide, idx) => (
                <div key={slide.id} className="border border-gold/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest2 text-sage">Slide {idx + 1}</span>
                    <button type="button" onClick={() => removeHeroSlide(slide.id)} className="text-xs text-rosewood">
                      Remove
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleHeroSlideImageUpload(slide.id, e.target.files?.[0])}
                    className="block text-sm"
                  />
                  {slide.image && (
                    <div className="relative aspect-[2/1] max-w-xs rounded-lg overflow-hidden border border-gold/30 bg-cream">
                      <img src={slide.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    placeholder="Title (e.g. Loved By 1K+ Customers)"
                    value={slide.title}
                    onChange={(e) => updateHeroSlide(slide.id, "title", e.target.value)}
                    className="input-field"
                  />
                  <input
                    placeholder="Subtitle (optional)"
                    value={slide.subtitle}
                    onChange={(e) => updateHeroSlide(slide.id, "subtitle", e.target.value)}
                    className="input-field"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Button text (e.g. Explore Now)"
                      value={slide.ctaText}
                      onChange={(e) => updateHeroSlide(slide.id, "ctaText", e.target.value)}
                      className="input-field"
                    />
                    <input
                      placeholder="Button link (e.g. /products)"
                      value={slide.ctaLink}
                      onChange={(e) => updateHeroSlide(slide.id, "ctaLink", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Images */}
          <div className="border-t border-gold/30 pt-4">
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">
              Shop by Category Images
            </label>
            <p className="text-xs text-brown/50 mt-1">
              Upload an optional image to replace the default category circle on the homepage.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              {CATEGORIES.map((cat) => (
                <div key={cat.slug} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gold/30 bg-cream flex-shrink-0">
                    <img
                      src={form.categoryImages[cat.slug] || cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-brown-dark mb-1">{cat.name}</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCategoryImageUpload(cat.slug, e.target.files?.[0])}
                      className="block text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UGC / Lookbook */}
          <div className="border-t border-gold/30 pt-4">
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">
              UGC / Lookbook Section
            </label>
            <input
              placeholder="Section title"
              value={form.ugc.title}
              onChange={(e) => updateUgcField("title", e.target.value)}
              className="input-field mt-2"
            />
            <input
              placeholder="Section subtitle"
              value={form.ugc.subtitle}
              onChange={(e) => updateUgcField("subtitle", e.target.value)}
              className="input-field mt-2"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs uppercase tracking-widest2 text-sage">Images</span>
              <button type="button" onClick={addUgcItem} className="text-xs text-rosewood font-semibold">
                + Add Image
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              {(form.ugc.items || []).map((item, idx) => (
                <div key={item.id} className="border border-gold/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest2 text-sage">Reel {idx + 1}</span>
                    <button type="button" onClick={() => removeUgcItem(item.id)} className="text-xs text-rosewood">
                      Remove
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    onChange={(e) => handleUgcMediaUpload(item.id, e.target.files?.[0])}
                    className="block text-sm"
                  />
                  {item.image && (
                    <div className="relative aspect-square max-w-[140px] rounded-lg overflow-hidden border border-gold/30 bg-cream">
                      <img src={item.image} alt={`UGC ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {item.video && (
                    <video src={item.video} controls muted playsInline className="w-full max-w-[220px] aspect-[9/16] rounded-lg border border-gold/30 bg-black object-cover" />
                  )}
                  <input
                    placeholder="Link (optional, e.g. Instagram post URL)"
                    value={item.link}
                    onChange={(e) => updateUgcItem(item.id, "link", e.target.value)}
                    className="input-field"
                  />
                  <input
                    placeholder="Caption (optional)"
                    value={item.caption}
                    onChange={(e) => updateUgcItem(item.id, "caption", e.target.value)}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Viewer Count */}
          <div className="border-t border-gold/30 pt-4">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-brown-dark">
              <input
                type="checkbox"
                checked={form.liveViewers.enabled}
                onChange={(e) => updateLiveViewers("enabled", e.target.checked)}
              />
              Show Live Viewer Count on Product Pages
            </label>
            <p className="text-xs text-brown/50 mt-1">
              Shows the real number of visitors currently viewing each product page.
            </p>
          </div>

          {/* Estimated Delivery */}
          <div className="border-t border-gold/30 pt-4">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-brown-dark">
              <input
                type="checkbox"
                checked={form.deliveryEstimate.enabled}
                onChange={(e) => updateDeliveryEstimate("enabled", e.target.checked)}
              />
              Show Estimated Delivery Date on Product Pages
            </label>
            <div className="grid grid-cols-2 gap-4 mt-3 max-w-sm">
              <div>
                <label className="text-xs text-brown/60">Min days</label>
                <input
                  type="number"
                  min="1"
                  value={form.deliveryEstimate.minDays}
                  onChange={(e) => updateDeliveryEstimate("minDays", e.target.value)}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-brown/60">Max days</label>
                <input
                  type="number"
                  min="1"
                  value={form.deliveryEstimate.maxDays}
                  onChange={(e) => updateDeliveryEstimate("maxDays", e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>
          </div>

          <button disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </AdminLayout>
    </AdminGuard>
  );
}
