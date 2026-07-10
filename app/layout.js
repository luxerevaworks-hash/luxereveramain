import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import PresenceTracker from "@/components/PresenceTracker";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Luxereva | Premium Jewellery",
  description:
    "Discover Luxereva's trend-inspired jewellery — necklaces, earrings, bracelets, rings and more. Premium finish, lightweight designs, best for gifting.",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnalyticsTracker />
              <PresenceTracker />
              <Navbar />
              <main className="min-h-[60vh]">{children}</main>
              <Footer />
              <Toaster position="bottom-center" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
