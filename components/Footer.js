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

const ICON_CLASS = "w-3.5 h-3.5 text-gold";

const WHY_US = [
  { label: "Premium Finish", icon: <FiAward className={ICON_CLASS} /> },
  { label: "Lightweight Designs", icon: <FiFeather className={ICON_CLASS} /> },
  { label: "Trendy Designs", icon: <FiTrendingUp className={ICON_CLASS} /> },
  { label: "Comfortable Wear Materials", icon: <FiHeart className={ICON_CLASS} /> },
  { label: "Best For Gifting", icon: <FiGift className={ICON_CLASS} /> },
  { label: "1 Year Warranty", icon: <FiShield className={ICON_CLASS} /> },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/luxereva?igsh=OGdjMW1waGdqbmc2",
    icon: <FiInstagram className="w-5 h-5" />,
    className: "bg-gradient-to-br from-rosewood via-gold to-rosewood text-cream",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FiFacebook className="w-5 h-5" />,
    className: "bg-[#1877F2] text-white",
  },
  {
    label: "Email",
    href: "mailto:luxerevaworks@gmail.com",
    icon: <FiMail className="w-5 h-5" />,
    className: "bg-gold text-brown-dark",
  },
];

const FOOTER_SECTIONS = [
  {
    title: "Quick Links",
    links: [
      { label: "Necklaces", href: "/products?category=necklaces" },
      { label: "Earrings", href: "/products?category=earrings" },
      { label: "Bracelets", href: "/products?category=bracelets" },
      { label: "Rings", href: "/products?category=rings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Blogs", href: "/blogs" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", href: "/account" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Get In Touch",
    links: [
      { label: "info@luxereva.com", href: "mailto:info@luxereva.com" },
      { label: "WhatsApp +91 84213 18199", href: "https://wa.me/918421318199" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brown-dark text-cream mt-16">
      {/* Why Choose Us */}
      <div className="border-b border-cream/10">
        <div className="container-page py-6">
          <h3 className="text-center uppercase tracking-widest2 text-gold text-sm mb-1">
            Why Choose Us
          </h3>
          <p className="text-center text-cream/60 text-xs mb-4 max-w-xl mx-auto leading-relaxed">
            We believe jewellery is more than an accessory — it&apos;s a way to express your style.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {WHY_US.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-xs text-cream/80 bg-cream/5 border border-cream/10 rounded-full px-3 py-1.5"
              >
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Logo, tagline & socials */}
      <div className="container-page py-12 flex flex-col items-center text-center">
        <Logo className="w-40 h-auto" onDark />
        <p className="text-sm text-cream/60 leading-relaxed max-w-md mt-5">
          Premium, trend-inspired jewellery designed for everyday elegance, thoughtful gifting,
          and comfortable, long-lasting shine.
        </p>
        <div className="flex items-center gap-4 mt-6">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${s.className}`}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Accordion link sections */}
      <div className="container-page max-w-2xl mx-auto pb-4">
        {FOOTER_SECTIONS.map((section) => (
          <details key={section.title} className="group border-t border-cream/10 py-4">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 uppercase text-xs tracking-widest2 text-gold">
              {section.title}
              <span className="flex-shrink-0 text-lg leading-none transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <ul className="space-y-2 text-sm text-cream/80 mt-4">
              {section.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} Luxereva. All rights reserved.
      </div>
    </footer>
  );
}
