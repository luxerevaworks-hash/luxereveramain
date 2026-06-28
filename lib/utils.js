export function formatPrice(amountInPaise) {
  const rupees = (amountInPaise || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isAdminEmail(email) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

function seededFraction(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const x = Math.sin(h) * 10000;
  return x - Math.floor(x);
}

export function getEstimatedDelivery(productId, minDays = 5, maxDays = 7) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const days = Math.round(
    seededFraction(`${productId}-${todayKey}-delivery`) * (maxDays - minDays) + minDays
  );
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
}
