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
import { FiShield, FiRefreshCw, FiTruck, FiStar, FiChevronRight, FiChevronDown, FiBox, FiLayers, FiSettings } from "react-icons/fi";

const FEATURES = [
  { icon: <FiTruck className="w-5 h-5" />, label: "Free Delivery", sub: "On all orders" },
  { icon: <FiRefreshCw className="w-5 h-5" />, label: "Easy Exchange", sub: "7-day exchange policy" },
  { icon: <FiShield className="w-5 h-5" />, label: "1 Year Warranty", sub: "On Gold Plating" },
  { icon: <FiStar className="w-5 h-5" />, label: "Premium Finish", sub: "Long-lasting shine" },
];

const SPECIFICATION_LABELS = {
  brand: "Brand",
  productName: "Product Name",
  productType: "Product Type",
  collection: "Collection",
  material: "Material",
  plating: "Plating",
  finish: "Finish",
  stoneType: "Stone Type",
  stoneColour: "Stone Colour",
  tarnishProtection: "Tarnish Protection",
  waterResistance: "Water Resistance",
  hypoallergenic: "Hypoallergenic",
  colour: "Colour",
  dimensions: "Dimensions",
  weight: "Weight",
  closureType: "Closure Type",
  occasion: "Occasion",
  gender: "Gender",
  warranty: "Warranty",
  countryOfOrigin: "Country of Origin",
  manufacturer: "Manufacturer",
  marketedBy: "Marketed / Sold By",
};

const PRODUCT_TYPE_BY_CATEGORY = {
  earrings: "Earrings",
  necklaces: "Necklace",
  bracelets: "Bracelet",
  rings: "Ring",
};

const SPECIFICATION_GROUPS = [
  { title: "Product details", icon: FiBox, fields: ["brand", "productName", "productType", "collection", "gender"] },
  { title: "Material & finish", icon: FiLayers, fields: ["material", "plating", "finish", "colour", "tarnishProtection"] },
  { title: "Stone details", icon: FiStar, fields: ["stoneType", "stoneColour"] },
  { title: "Size & closure", icon: FiSettings, fields: ["dimensions", "weight", "closureType", "occasion"] },
  { title: "Care & warranty", icon: FiShield, fields: ["waterResistance", "hypoallergenic", "warranty", "countryOfOrigin", "manufacturer", "marketedBy", "careInstructions"] },
];

function getSpecifications(product) {
  const saved = product.specifications || {};
  return {
    brand: saved.brand || "Luxereva",
    productName: product.name,
    productType: saved.productType || PRODUCT_TYPE_BY_CATEGORY[product.category] || "Not specified",
    collection: saved.collection || "Not specified",
    material: saved.material || "Not specified",
    plating: saved.plating || "Not specified",
    finish: saved.finish || "Not specified",
    stoneType: saved.stoneType || "Not specified",
    stoneColour: saved.stoneColour || "Not specified",
    tarnishProtection: saved.tarnishProtection || "Anti-Tarnish",
    waterResistance: saved.waterResistance || "Not specified",
    hypoallergenic: saved.hypoallergenic || "Not specified",
    colour: saved.colour || "Not specified",
    dimensions: saved.dimensions || "Not specified",
    weight: saved.weight || "Not specified",
    closureType: saved.closureType || "Not specified",
    occasion: saved.occasion || "Not specified",
    gender: saved.gender || "Women",
    warranty: saved.warranty || "1 Year",
    countryOfOrigin: saved.countryOfOrigin || "India",
    manufacturer: saved.manufacturer || "Not specified",
    marketedBy: saved.marketedBy || "Luxereva",
    careInstructions: saved.careInstructions || "Store dry, avoid direct contact with perfumes, chemicals and excessive moisture.",
  };
}

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
  const [openSpecification, setOpenSpecification] = useState(null);
  const [showAllSpecifications, setShowAllSpecifications] = useState(false);

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
        let data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (!data) {
          const slugMatch = await getDocs(query(collection(db, "products"), where("slug", "==", id), limit(1)));
          if (!slugMatch.empty) data = { id: slugMatch.docs[0].id, ...slugMatch.docs[0].data() };
        }
        // This is only needed before existing products have been migrated.
        if (!data) {
          const products = await getDocs(collection(db, "products"));
          const { getProductSlug } = await import("@/lib/productUrl");
          const match = products.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .find((item) => getProductSlug(item) === id);
          data = match || sampleProducts.find((item) => item.id === id || item.slug === id);
        }
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
              .filter((p) => p.id !== data.id);
            setRelated(
              rProducts.length
                ? rProducts.slice(0, 4)
                : sampleProducts.filter((p) => p.category === data.category && p.id !== data.id).slice(0, 4)
            );
          } catch {
            setRelated(
              sampleProducts.filter((p) => p.category === data?.category && p.id !== data?.id).slice(0, 4)
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
  const specifications = getSpecifications(product);

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
                unoptimized
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
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill unoptimized className="object-cover" />
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

          <section className="mt-7 border-t border-gold/30 pt-6">
            <h2 className="text-xs uppercase tracking-widest2 text-brown-dark mb-4">Product Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIFICATION_GROUPS.slice(0, showAllSpecifications ? SPECIFICATION_GROUPS.length : 4).map((group) => {
                const Icon = group.icon;
                const isOpen = openSpecification === group.title;
                return (
                  <div key={group.title} className="rounded-2xl border border-gold/20 bg-white overflow-hidden transition-shadow hover:shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenSpecification(isOpen ? null : group.title)}
                      className="w-full flex items-center gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="w-12 h-12 shrink-0 rounded-full bg-gold/10 text-[#93701e] flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-medium text-brown-dark">{group.title}</span>
                        <span className="block mt-0.5 text-xs text-brown/60">{group.fields.length} details</span>
                      </span>
                      <FiChevronDown className={`w-5 h-5 text-brown/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <dl className="px-5 pb-5 space-y-2 text-xs">
                        {group.fields.map((key) => (
                          <div key={key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 border-t border-gold/15 pt-2">
                            <dt className="text-brown/55">{SPECIFICATION_LABELS[key] || "Care Instructions"}</dt>
                            <dd className="text-brown-dark text-right leading-relaxed">{specifications[key]}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowAllSpecifications((visible) => !visible)}
              className="mt-5 text-sm font-medium text-brown-dark hover:text-rosewood transition-colors"
            >
              {showAllSpecifications ? "See Less" : "See More"}
            </button>
          </section>

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
