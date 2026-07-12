"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { fbqTrack } from "@/components/MetaPixel";
import { formatPrice, getEstimatedDelivery } from "@/lib/utils";
import { sampleProducts } from "@/lib/sampleProducts";
import Logo from "@/components/Logo";
import ProductCard from "@/components/ProductCard";
import GiftingPainPoints from "@/components/GiftingPainPoints";
import GiftWrapOption from "@/components/GiftWrapOption";
import ProductFaq from "@/components/ProductFaq";
import LiveViewerBadge from "@/components/LiveViewerBadge";
import ProductReviews from "@/components/ProductReviews";
import toast from "react-hot-toast";
import { FiShield, FiRefreshCw, FiTruck, FiStar, FiChevronRight } from "react-icons/fi";

const FEATURES = [
  { icon: <FiTruck className="w-5 h-5" />, label: "Free Delivery", sub: "On all orders" },
  { icon: <FiRefreshCw className="w-5 h-5" />, label: "Easy Exchange", sub: "7-day exchange policy" },
  { icon: <FiShield className="w-5 h-5" />, label: "1 Year Warranty", sub: "On Gold Plating" },
  { icon: <FiStar className="w-5 h-5" />, label: "Premium Finish", sub: "Long-lasting shine" },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem, giftWrap, setGiftWrap } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) setStoreSettings(snap.data());
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        const fallback = sampleProducts.find((item) => item.id === id);
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : fallback;
        setProduct(data || null);
        if (data?.variants?.length) setVariant(data.variants[0]);

        // load related products from same category
        if (data?.category) {
          try {
            const q = query(
              collection(db, "products"),
              where("category", "==", data.category),
              limit(5)
            );
            const rSnap = await getDocs(q);
            const rProducts = rSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((p) => p.id !== id);
            setRelated(
              rProducts.length
                ? rProducts.slice(0, 4)
                : sampleProducts.filter((p) => p.category === data.category && p.id !== id).slice(0, 4)
            );
          } catch {
            setRelated(
              sampleProducts.filter((p) => p.category === data?.category && p.id !== id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error(err);
        const fallback = sampleProducts.find((item) => item.id === id) || null;
        setProduct(fallback);
        setRelated(
          sampleProducts.filter((p) => p.category === fallback?.category && p.id !== id).slice(0, 4)
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    fbqTrack("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      contents: [{ id: product.id, quantity: 1, item_price: product.price / 100 }],
      currency: "INR",
      value: product.price / 100,
    });
  }, [product]);

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-brown/60">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-brown/60 mb-4">Product not found.</p>
        <Link href="/products" className="btn-outline">Back to Shop</Link>
      </div>
    );
  }

  function handleAddToCart() {
    addItem(product, qty, variant);
    toast.success(`${product.name} added to bag`);
  }

  function handleBuyNow() {
    addItem(product, qty, variant);
    router.push("/checkout");
  }

  // Older catalogue records may not have a stock field. They are sellable until
  // inventory is explicitly tracked, instead of leaving every purchase button disabled.
  const stock = Number(product.stock);
  const hasTrackedStock = Number.isFinite(stock);
  const inStock = !hasTrackedStock || stock > 0;
  const lowStock = hasTrackedStock && inStock && stock <= 5;

  return (
    <div className="bg-cream min-h-screen pb-28 md:pb-0">
      {/* Breadcrumb */}
      <div className="container-page pt-4 pb-2">
        <nav className="flex items-center gap-1 text-xs text-brown/50 uppercase tracking-widest2">
          <Link href="/" className="hover:text-brown-dark transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-brown-dark transition-colors">Shop</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${product.category}`} className="hover:text-brown-dark transition-colors capitalize">{product.category}</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-brown-dark truncate max-w-[120px]">{product.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="container-page py-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">

        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-sm">
            {product.images?.[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white">
                <div className="text-center px-6">
                  <Logo className="mx-auto w-48 h-auto" />
                  <p className="mt-4 text-xs uppercase tracking-widest2 text-brown/40">
                    {product.category}
                  </p>
                </div>
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
                <span className="bg-rosewood text-cream text-xs uppercase tracking-widest2 px-4 py-2 rounded-full">
                  Sold Out
                </span>
              </div>
            )}
            {lowStock && (
              <span className="absolute top-3 left-3 bg-rosewood text-cream text-[10px] uppercase tracking-widest2 px-3 py-1 rounded-full">
                Only {product.stock} left
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? "border-rosewood scale-105" : "border-gold/30"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="inline-block w-fit text-[11px] uppercase tracking-widest2 text-rosewood bg-rosewood/10 rounded-full px-3 py-1 mb-3 capitalize">
            {product.category}
          </span>

          <h1 className="text-2xl md:text-3xl font-light text-brown-dark leading-snug">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <span className="text-2xl font-semibold text-brown-dark">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-brown/40 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {storeSettings?.liveViewers?.enabled !== false && (
            <LiveViewerBadge productId={product.id} />
          )}

          <p className="text-sm text-brown/80 mt-5 leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest2 text-brown-dark mb-3">Options</p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v)}
                    className={`px-4 py-2 rounded-full text-xs border uppercase tracking-widest2 transition-colors ${
                      variant?.id === v.id
                        ? "bg-brown-dark text-cream border-brown-dark"
                        : "border-gold text-brown-dark hover:bg-gold/20"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest2 text-brown-dark mb-3">Quantity</p>
            <div className="flex items-center border border-gold/60 rounded-full overflow-hidden w-fit bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-11 text-lg text-brown-dark hover:bg-gold/20 transition-colors flex items-center justify-center"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-10 text-center text-brown-dark font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(hasTrackedStock ? stock : 99, q + 1))}
                className="w-11 h-11 text-lg text-brown-dark hover:bg-gold/20 transition-colors flex items-center justify-center"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>

          {/* Gift Wrap */}
          <div className="mt-6">
            <GiftWrapOption checked={giftWrap} onChange={setGiftWrap} />
          </div>

          {storeSettings?.deliveryEstimate?.enabled !== false && (
            <p className="flex items-center gap-1.5 text-xs text-brown-dark mt-4">
              <FiTruck className="w-3.5 h-3.5 text-gold" />
              <span>
                Delivery by{" "}
                {getEstimatedDelivery(
                  product.id,
                  storeSettings?.deliveryEstimate?.minDays || 5,
                  storeSettings?.deliveryEstimate?.maxDays || 7
                )}
              </span>
            </p>
          )}

          {/* Buttons — hidden on mobile (shown in sticky bar below) */}
          <div className="hidden md:flex flex-col gap-3 mt-7">
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="btn-primary w-full py-4 text-sm disabled:opacity-40"
            >
              {inStock ? "Buy Now" : "Sold Out"}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn-outline w-full py-4 text-sm disabled:opacity-40"
            >
              Add to Cart
            </button>
          </div>

          {/* Delivery & Trust badges */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gold/20">
                <span className="text-gold mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-brown-dark">{f.label}</p>
                  <p className="text-[10px] text-brown/50 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GiftingPainPoints />
      <ProductReviews />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="container-page mt-14 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="uppercase tracking-widest2 text-brown-dark text-sm">
              You May Also Like
            </h2>
            <Link href={`/products?category=${product.category}`} className="text-xs text-gold hover:text-rosewood transition-colors uppercase tracking-widest2">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ProductFaq productName={product.name} />

      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gold/30 px-4 py-3 flex gap-3 shadow-lg">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="btn-outline flex-1 py-3.5 text-xs disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="btn-primary flex-1 py-3.5 text-xs disabled:opacity-40"
        >
          {inStock ? "Buy Now" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}
