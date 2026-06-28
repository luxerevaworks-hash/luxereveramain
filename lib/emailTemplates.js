import { formatPrice } from "@/lib/utils";

function itemsListHtml(items = []) {
  return items
    .map(
      (item) =>
        `<li>${item.qty} &times; ${item.name}${item.variant ? ` (${item.variant.name})` : ""}</li>`
    )
    .join("");
}

export function orderConfirmationEmail(order) {
  const subject = `Luxereva — Order Confirmed (#${(order.id || "").slice(0, 8)})`;
  const html = `
    <div style="font-family:sans-serif;color:#3a2c22;">
      <h2>Thank you for your order, ${order.customer?.name || ""}!</h2>
      <p>Your Luxereva order <strong>#${(order.id || "").slice(0, 8)}</strong> has been placed
      ${order.paymentMethod === "cod" ? "and will be paid via Cash on Delivery." : "and payment was received successfully."}</p>
      <ul>${itemsListHtml(order.items)}</ul>
      <p><strong>Total: ${formatPrice(order.total)}</strong></p>
      <p>We'll notify you again once your order ships.</p>
    </div>
  `;
  return { subject, html };
}

export function orderShippedEmail(order) {
  const subject = `Luxereva — Your Order Has Shipped (#${(order.id || "").slice(0, 8)})`;
  const html = `
    <div style="font-family:sans-serif;color:#3a2c22;">
      <h2>Your order is on its way!</h2>
      <p>Order <strong>#${(order.id || "").slice(0, 8)}</strong> has shipped.</p>
      <ul>${itemsListHtml(order.items)}</ul>
      <p>Thank you for shopping with Luxereva.</p>
    </div>
  `;
  return { subject, html };
}
