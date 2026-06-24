import Link from "next/link";
import {
  FiInstagram,
  FiFacebook,
  FiMail,
  FiAward,
  FiFeather,
  FiTrendingUp,
  FiHeart,
  FiGift,
  FiShield,
} from "react-icons/fi";
import Logo from "@/components/Logo";

const ICON_CLASS = "w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2";

const WHY_US = [
  { label: "Premium Finish", icon: <FiAward className={ICON_CLASS} /> },
  { label: "Lightweight Designs", icon: <FiFeather className={ICON_CLASS} /> },
  { label: "Trendy Designs", icon: <FiTrendingUp className={ICON_CLASS} /> },
  { label: "Comfortable Wear Materials", icon: <FiHeart className={ICON_CLASS} /> },
  { label: "Best For Gifting", icon: <FiGift className={ICON_CLASS} /> },
  { label: "1 Year Warranty", icon: <FiShield className={ICON_CLASS} /> },
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
            <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
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
