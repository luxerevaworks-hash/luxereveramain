# Luxereva — Full-Stack E-commerce Platform

A complete e-commerce storefront + admin panel for **Luxereva**, built with:

- **Next.js 14** (App Router, React 18)
- **Firebase** — Authentication, Firestore (database), Storage (product images)
- **Razorpay** — payment gateway (India)
- **Tailwind CSS** — styling, using your brand palette
- **Admin Panel** — manage products, orders, view dashboard stats

---

## 1. Brand Palette (already wired into Tailwind)

| Name      | Hex       | Usage                         |
|-----------|-----------|-------------------------------|
| Cream     | `#F2E9E1` | Page background                |
| Brown     | `#846348` | Buttons, primary text          |
| Brown Dark| `#5E4733` | Headings, body text            |
| Gold      | `#C39F71` | Borders, accents, CTAs         |
| Rosewood  | `#A66D5E` | Highlights, badges, links      |
| Sage      | `#979F85` | Tags, success states           |

Your logo is at `public/images/logo.png` and Montserrat fonts are bundled in `public/fonts/`.

---

## 2. Project Structure

```
luxereva-ecommerce/
├── app/
│   ├── page.js              # Homepage
│   ├── products/             # Product listing + detail pages
│   ├── cart/                 # Shopping bag
│   ├── checkout/             # Checkout + Razorpay
│   ├── login/ signup/        # Auth pages
│   ├── account/              # Customer account + order history
│   ├── admin/                # Admin dashboard, products, orders
│   └── api/
│       ├── create-order/     # Razorpay order creation (server)
│       └── verify-payment/   # Razorpay signature verification + saves order
├── components/               # Navbar, Footer, ProductCard, AdminLayout, etc.
├── context/                  # AuthContext, CartContext
├── lib/                       # firebase.js (client SDK), firebaseAdmin.js (server SDK), utils.js
├── scripts/seed.js           # Sample product seeder
├── firestore.rules           # Database security rules
├── storage.rules             # Image storage security rules
└── .env.local.example        # All required environment variables
```

---

## 3. Setup Instructions

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Create a Firebase project
1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project** → name it `luxereva`.
2. Enable **Authentication** → Sign-in methods: **Email/Password** and **Google**.
3. Enable **Firestore Database** (start in production mode).
4. Enable **Storage**.
5. Go to **Project Settings → General → Your apps → Web app** — copy the config values into `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
6. Go to **Project Settings → Service Accounts → Generate new private key** — this gives you `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for `.env.local`.

### Step 3 — Configure environment variables
```bash
cp .env.local.example .env.local
```
Fill in all values. For `ADMIN_EMAILS` and `NEXT_PUBLIC_ADMIN_EMAILS`, use the email address(es) you'll log in with to access `/admin` (comma-separated for multiple admins).

> ⚠️ Also update the hardcoded admin email lists inside `firestore.rules` and `storage.rules` to match — security rules can't read `.env` files.

### Step 4 — Deploy Firestore & Storage rules
Install the Firebase CLI if you haven't:
```bash
npm install -g firebase-tools
firebase login
firebase use --add        # select your luxereva project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Step 5 — Set up Razorpay
1. Create an account at [razorpay.com](https://razorpay.com).
2. Go to **Settings → API Keys** → generate Test (or Live) keys.
3. Put `key_id` in `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `key_secret` in `RAZORPAY_KEY_SECRET`.

### Step 6 — Seed sample products (optional)
```bash
npm run seed
```
This adds 4 sample products to Firestore so your storefront isn't empty. You can delete them later from the Admin Panel.

### Step 7 — Run locally
```bash
npm run dev
```
Visit `http://localhost:3000`.

### Step 8 — Access the Admin Panel
1. Sign up at `/signup` using the email address listed in `ADMIN_EMAILS`.
2. Visit `/admin` — you'll see the dashboard, Products, and Orders.
3. Add products (with images, variants, pricing, stock) from **Admin → Products → Add Product**.

---

## 4. How Checkout Works

1. Customer fills shipping details on `/checkout` and clicks **Pay**.
2. The browser calls `POST /api/create-order`, which uses your Razorpay secret key (server-side only) to create an order.
3. The Razorpay Checkout modal opens for the customer to pay.
4. On success, the browser calls `POST /api/verify-payment`, which:
   - Verifies the payment signature using HMAC-SHA256 (server-side, secure).
   - Saves the order to Firestore (`orders` collection) via the Firebase Admin SDK.
   - Decrements product stock.
5. Customer is redirected to `/account` to see their order.

---

## 5. Firestore Data Model

**`products/{productId}`**
```json
{
  "name": "Radiance Renewal Face Serum",
  "category": "skincare",
  "price": 189900,          // stored in paise (₹1,899.00)
  "stock": 25,
  "description": "...",
  "featured": true,
  "images": ["https://firebasestorage.../img1.jpg"],
  "variants": [{ "id": "v1", "name": "50ml" }],
  "createdAt": "<timestamp>"
}
```

**`orders/{orderId}`**
```json
{
  "userId": "firebase-uid-or-null",
  "customer": { "name": "...", "email": "...", "phone": "...", "address": "...", "city": "...", "state": "...", "pincode": "..." },
  "items": [{ "id": "productId", "name": "...", "price": 189900, "qty": 2, "variant": {...} }],
  "total": 379800,
  "paymentId": "razorpay_payment_id",
  "razorpayOrderId": "razorpay_order_id",
  "status": "paid",
  "createdAt": "<timestamp>"
}
```

**`users/{uid}`**
```json
{ "name": "...", "email": "...", "createdAt": "<timestamp>" }
```

---

## 6. Deployment (Vercel recommended)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Add all variables from `.env.local` into Vercel's **Environment Variables** settings.
4. Update `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://luxereva.com`).
5. Deploy. Vercel auto-builds Next.js apps with zero config.
6. Point your domain (`luxereva.com`) to Vercel via DNS (Vercel will show you the records to add).

For Razorpay, switch from **Test** keys to **Live** keys once you're ready to accept real payments, and complete Razorpay's KYC/activation process.

---

## 7. Next Steps / Ideas to Extend

- **Reviews & ratings** — add a `reviews` subcollection per product.
- **Wishlist** — store favorite product IDs per user.
- **Coupons/discounts** — add a `coupons` collection and apply at checkout.
- **Email notifications** — use Firebase Functions + an email service (e.g. Resend, SendGrid) to send order confirmations.
- **Shipping integration** — connect Shiprocket/Delhivery APIs for live shipping rates and tracking.
- **Analytics** — add Google Analytics / Meta Pixel to `app/layout.js`.
- **Multiple admins / roles** — move from email-list checks to Firebase custom claims for finer-grained roles (admin, staff, etc.).

---

## 8. Notes

- All prices are stored in **paise** (smallest INR unit) in Firestore, e.g. ₹1,899 = `189900`. The admin form takes input in rupees and converts automatically.
- Cart state is stored in `localStorage` (per browser) so it persists across page reloads, even for guests.
- The category links on the homepage (`Skincare`, `Fragrance`, `Accessories`) map to the `category` field on each product — add more categories by editing `CATEGORIES` in `app/products/page.js` and `components/ProductForm.js`.
"# luxereveramain" 
