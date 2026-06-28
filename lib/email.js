import nodemailer from "nodemailer";

let cachedTransporter = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

// Best-effort email sender — never throws. A notification failure must not
// break checkout/order flows. No-ops quietly if Gmail credentials aren't set.
export async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter || !to) return { skipped: true };

  try {
    await transporter.sendMail({
      from: `Luxereva <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { skipped: false, success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { skipped: false, success: false, error: err.message };
  }
}
