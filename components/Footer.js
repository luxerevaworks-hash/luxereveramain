import Link from "next/link";
import { FiInstagram, FiFacebook, FiMail } from "react-icons/fi";
import Logo from "@/components/Logo";

const WHY_US = [
  {
    label: "Premium Finish",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2">
        <circle cx="32" cy="28" r="16" />
        <path d="M24 44 L20 58 L32 52 L44 58 L40 44" />
      </svg>
    ),
  },
  {
    label: "Lightweight Designs",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2">
        <rect x="16" y="8" width="32" height="8" rx="2" />
        <line x1="32" y1="16" x2="32" y2="28" />
        <circle cx="32" cy="36" r="8" />
        <line x1="20" y1="36" x2="44" y2="36" />
        <path d="M24 50 Q32 56 40 50" />
        <line x1="8" y1="56" x2="56" y2="56" />
      </svg>
    ),
  },
  {
    label: "Trendy Designs",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2">
        <ellipse cx="32" cy="36" rx="18" ry="10" />
        <ellipse cx="32" cy="36" rx="10" ry="5" />
        <line x1="20" y1="20" x2="24" y2="28" />
        <line x1="32" y1="16" x2="32" y2="26" />
        <line x1="44" y1="20" x2="40" y2="28" />
        <circle cx="20" cy="18" r="2" />
        <circle cx="32" cy="14" r="2" />
        <circle cx="44" cy="18" r="2" />
      </svg>
    ),
  },
  {
    label: "Comfortable Wear Materials",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2">
        <path d="M20 48 Q10 40 12 28 Q14 18 24 16 L28 20 L32 14 L36 20 L40 16 Q50 18 52 28 Q54 40 44 48 Z" />
        <path d="M28 20 Q32 30 44 48" strokeOpacity="0.5" />
        <path d="M36 20 Q32 30 20 48" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    label: "Best For Gifting",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2">
        <rect x="12" y="28" width="40" height="28" rx="2" />
        <rect x="10" y="20" width="44" height="10" rx="2" />
        <line x1="32" y1="20" x2="32" y2="56" />
        <path d="M32 20 Q24 8 16 16 Q8 24 32 20" />
        <path d="M32 20 Q40 8 48 16 Q56 24 32 20" />
      </svg>
    ),
  },
  {
    label: "1 Year Warranty",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2">
        <path d="M32 8 L52 16 L52 36 Q52 50 32 58 Q12 50 12 36 L12 16 Z" />
        <circle cx="32" cy="34" r="3" fill="currentColor" />
        <line x1="32" y1="22" x2="32" y2="30" />
        <text x="22" y="38" fontSize="10" fontFamily="Montserrat, sans-serif" fill="currentColor" stroke="none" fontWeight="600">1 YR</text>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-brown-dark text-cream mt-16">
      {/* Why Choose Us */}
      <div className="border-b border-cream/10">
        <div className="container-page py-10">
          <h3 className="text-center uppercase tracking-widest2 text-gold text-sm mb-2">
            Why Choose Us
          </h3>
          <p className="text-center text-cream/60 text-sm mb-8 max-w-xl mx-auto leading-relaxed">
            We believe jewellery is more than an accessory — it&apos;s a way to express your style.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 text-center">
            {WHY_US.map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="text-cream/80">{item.icon}</div>
                <p className="text-xs text-cream/70 leading-snug mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="container-page py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Logo className="w-36 h-auto" onDark />
          </div>
          <p className="text-sm text-cream/70 leading-relaxed">
            Premium trend-inspired jewellery crafted for comfort and long-lasting shine.
          </p>
        </div>
        <div>
          <h4 className="uppercase text-xs tracking-widest2 text-gold mb-4">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/products?category=necklaces">Necklaces</Link></li>
            <li><Link href="/products?category=earrings">Earrings</Link></li>
            <li><Link href="/products?category=bracelets">Bracelets</Link></li>
            <li><Link href="/products?category=rings">Rings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="uppercase text-xs tracking-widest2 text-gold mb-4">
            Help
          </h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/account">Track Order</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/blogs">Blogs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="uppercase text-xs tracking-widest2 text-gold mb-4">
            Connect
          </h4>
          <div className="flex gap-4 text-cream/80">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FiInstagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FiFacebook className="w-5 h-5" />
            </a>
            <a href="mailto:luxerevaworks@gmail.com" aria-label="Email">
              <FiMail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-cream/50 mt-4">luxerevaworks@gmail.com</p>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} Luxereva. All rights reserved.
      </div>
    </footer>
  );
}
