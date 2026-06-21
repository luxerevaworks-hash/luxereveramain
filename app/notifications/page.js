import Link from "next/link";
import PageIntro from "@/components/PageIntro";

const NOTICES = [
  ["New arrivals", "Fresh skincare and ritual essentials are now visible in the shop."],
  ["Customer care", "For order help, use the contact page with your order email."],
  ["Members", "Sign in before checkout so your orders stay connected to your account."],
];

export default function NotificationsPage() {
  return (
    <div>
      <PageIntro eyebrow="Updates" title="Notifications">
        Store announcements, order reminders, and shopping updates from
        Luxereva.
      </PageIntro>

      <section className="container-page py-12 space-y-4">
        {NOTICES.map(([title, copy]) => (
          <div key={title} className="bg-white border border-gold/30 rounded-lg p-5">
            <h2 className="text-lg font-medium text-brown-dark">{title}</h2>
            <p className="mt-2 text-sm text-brown/75">{copy}</p>
          </div>
        ))}
        <Link href="/products" className="btn-outline mt-4">
          Browse Products
        </Link>
      </section>
    </div>
  );
}
