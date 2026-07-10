"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { BADGE_OPTIONS } from "@/lib/badges";

const CATEGORIES = ["earrings", "necklaces", "bracelets", "rings"];
const STATUSES = ["active", "draft", "archived"];

export default function ProductForm({ initialData = null }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    category: initialData?.category || CATEGORIES[0],
    sku: initialData?.sku || "",
    status: initialData?.status || "active",
    price: initialData ? initialData.price / 100 : "",
    originalPrice: initialData?.originalPrice ? initialData.originalPrice / 100 : "",
    rating: initialData?.rating ?? "",
    reviewCount: initialData?.reviewCount ?? "",
    badges: initialData?.badges || [],
    stock: initialData?.stock ?? 0,
    lowStockThreshold: initialData?.lowStockThreshold ?? 5,
    description: initialData?.description || "",
    featured: initialData?.featured || false,
    images: initialData?.images || [],
    videos: initialData?.videos || [],
    variants: initialData?.variants || [],
  });
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function uploadFiles(files, folder) {
    const urls = [];
    for (const file of files) {
      const path = `products/${folder}/${nanoid()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      urls.push(await getDownloadURL(storageRef));
    }
    return urls;
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(files, "images");
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleVideoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(files, "videos");
      setForm((f) => ({ ...f, videos: [...f.videos, ...urls] }));
      toast.success("Video uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Video upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addVideoUrl() {
    const clean = videoUrl.trim();
    if (!clean) return;
    setForm((f) => ({ ...f, videos: [...f.videos, clean] }));
    setVideoUrl("");
  }

  function removeImage(url) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  function removeVideo(url) {
    setForm((f) => ({ ...f, videos: f.videos.filter((i) => i !== url) }));
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { id: nanoid(6), name: "" }],
    }));
  }

  function updateVariant(id, name) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => (v.id === id ? { ...v, name } : v)),
    }));
  }

  function removeVariant(id) {
    setForm((f) => ({ ...f, variants: f.variants.filter((v) => v.id !== id) }));
  }

  function toggleBadge(key) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(key)
        ? f.badges.filter((b) => b !== key)
        : [...f.badges, key],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        sku: form.sku,
        status: form.status,
        price: Math.round(parseFloat(form.price) * 100),
        originalPrice: form.originalPrice
          ? Math.round(parseFloat(form.originalPrice) * 100)
          : null,
        rating: form.rating ? parseFloat(form.rating) : null,
        reviewCount: form.reviewCount ? parseInt(form.reviewCount, 10) : null,
        badges: form.badges,
        stock: parseInt(form.stock, 10) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold, 10) || 0,
        description: form.description,
        featured: !!form.featured,
        images: form.images,
        videos: form.videos,
        variants: form.variants.filter((v) => v.name.trim()),
      };

      if (isEdit) {
        await setDoc(doc(db, "products", initialData.id), payload, { merge: true });
        toast.success("Product updated");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Product added");
      }
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="bg-white border border-gold/30 rounded-lg p-5 space-y-4">
        <h2 className="text-sm uppercase tracking-widest2 text-brown-dark">Product Details</h2>
        <div>
          <label className="text-xs uppercase tracking-widest2 text-brown-dark">Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field mt-1" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field mt-1">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Price (INR)</label>
            <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} required className="input-field mt-1" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Original Price / MRP (optional)</label>
            <input type="number" name="originalPrice" min="0" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder="Leave blank if no discount" className="input-field mt-1" />
            <p className="text-[11px] text-brown/50 mt-1">Set higher than Price to show a strikethrough MRP, % off badge and "you save" amount.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Rating (0-5)</label>
              <input type="number" name="rating" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest2 text-brown-dark">Review Count</label>
              <input type="number" name="reviewCount" min="0" value={form.reviewCount} onChange={handleChange} className="input-field mt-1" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest2 text-brown-dark">Badges</label>
          <p className="text-[11px] text-brown/50 mt-1 mb-2">Select any badges to display on this product's card. Multiple badges are supported.</p>
          <div className="flex flex-wrap gap-2">
            {BADGE_OPTIONS.map((badge) => {
              const active = form.badges.includes(badge.key);
              return (
                <button
                  key={badge.key}
                  type="button"
                  onClick={() => toggleBadge(badge.key)}
                  className={`text-[11px] font-semibold uppercase tracking-widest2 px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? `${badge.className} text-white border-transparent`
                      : "border-gold/40 text-brown-dark hover:border-brown-dark"
                  }`}
                >
                  {badge.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">SKU</label>
            <input name="sku" value={form.sku} onChange={handleChange} placeholder="LX-001" className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field mt-1">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Stock Quantity</label>
            <input type="number" name="stock" min="0" value={form.stock} onChange={handleChange} required className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest2 text-brown-dark">Low Stock Alert</label>
            <input type="number" name="lowStockThreshold" min="0" value={form.lowStockThreshold} onChange={handleChange} className="input-field mt-1" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-brown-dark">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
          Featured on homepage
        </label>

        <div>
          <label className="text-xs uppercase tracking-widest2 text-brown-dark">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} required className="input-field mt-1" />
        </div>
      </div>

      <div className="bg-white border border-gold/30 rounded-lg p-5 space-y-4">
        <h2 className="text-sm uppercase tracking-widest2 text-brown-dark">Product Media</h2>

        <div>
          <label className="text-xs uppercase tracking-widest2 text-brown-dark">Product Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mt-1 block" />
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {form.images.map((img) => (
                <div key={img} className="relative border border-gold/30 rounded-lg overflow-hidden bg-cream">
                  <img src={img} alt="" className="w-full aspect-square object-cover" />
                  <button type="button" onClick={() => removeImage(img)} className="absolute top-2 right-2 bg-rosewood text-cream rounded-full w-6 h-6 text-xs">X</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest2 text-brown-dark">Product Videos</label>
          <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="mt-1 block" />
          <div className="flex gap-2 mt-3">
            <input className="input-field" placeholder="Paste video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            <button type="button" onClick={addVideoUrl} className="btn-outline px-4">Add</button>
          </div>
          {form.videos.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {form.videos.map((video) => (
                <div key={video} className="border border-gold/30 rounded-lg overflow-hidden bg-cream">
                  <video src={video} controls className="w-full aspect-video bg-black object-contain" />
                  <div className="p-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-brown/60 truncate">{video}</p>
                    <button type="button" onClick={() => removeVideo(video)} className="text-rosewood text-sm font-medium">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {uploading && <p className="text-xs text-brown/60">Uploading media...</p>}
      </div>

      <div className="bg-white border border-gold/30 rounded-lg p-5">
        <label className="text-xs uppercase tracking-widest2 text-brown-dark">Variants (e.g. size, shade) - optional</label>
        <div className="space-y-2 mt-2">
          {form.variants.map((v) => (
            <div key={v.id} className="flex gap-2">
              <input value={v.name} onChange={(e) => updateVariant(v.id, e.target.value)} placeholder="e.g. 50ml" className="input-field" />
              <button type="button" onClick={() => removeVariant(v.id)} className="btn-outline px-3">X</button>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="text-xs text-rosewood uppercase tracking-widest2">+ Add variant</button>
        </div>
      </div>

      <button type="submit" disabled={saving || uploading} className="btn-primary">
        {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
