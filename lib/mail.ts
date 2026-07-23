import "server-only";
import { formatCents } from "@/lib/money";

interface OrderEmailData {
  orderNumber: string;
  email: string;
  customerName: string;
  items: { label: string; quantity: number }[];
  subtotal: number;
  tax: number;
  freight: number;
  total: number;
}

/**
 * Sends an order confirmation via Resend (https://resend.com).
 * Set RESEND_API_KEY (and optionally RESEND_FROM) in .env. In dev without a key
 * the message is logged to the server console so the flow stays verifiable.
 * Uses the Resend HTTP API directly via fetch — no extra dependency required.
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const subject = `Your Apt.Bed order ${data.orderNumber}`;
  const itemLines = data.items.map((it) => `${it.quantity}× ${it.label}`);

  const text = [
    `Hi ${data.customerName},`,
    ``,
    `Thanks for your order! We've received it and payment is confirmed.`,
    ``,
    `Order ${data.orderNumber}`,
    ...itemLines.map((l) => `  ${l}`),
    `  Subtotal: ${formatCents(data.subtotal)}`,
    `  Sales tax: ${formatCents(data.tax)}`,
    `  Freight: ${formatCents(data.freight)}`,
    `  Total: ${formatCents(data.total)}`,
    ``,
    `Your Apt.Bed is now made to order. Track its status any time from your account.`,
    ``,
    `— Victory Martin`,
  ].join("\n");

  const html = renderHtml(data, itemLines);

  await deliverMail({ to: data.email, subject, text, html, logLabel: `order ${data.orderNumber}` });
}

/**
 * Sends a password-reset link via Resend. `resetUrl` embeds the single-use
 * token; the caller is responsible for generating + storing it (hashed).
 * Without a Resend key the message is logged to the console like other emails.
 */
export async function sendPasswordReset(data: { email: string; name: string; resetUrl: string }): Promise<void> {
  const subject = "Reset your Apt.Bed password";

  const text = [
    `Hi ${data.name},`,
    ``,
    `We received a request to reset the password for your Apt.Bed account.`,
    `Open the link below to choose a new password. It expires in 1 hour and can be used once.`,
    ``,
    data.resetUrl,
    ``,
    `If you didn't request this, you can safely ignore this email — your password won't change.`,
    ``,
    `— Victory Martin`,
  ].join("\n");

  const html = renderResetHtml(data);

  await deliverMail({ to: data.email, subject, text, html, logLabel: `password reset for ${data.email}` });
}

/**
 * Sends an email-address verification link for a newly-registered account.
 * `verifyUrl` embeds the single-use token; without a Resend key the message is
 * logged to the console like other emails.
 */
export async function sendEmailVerification(data: { email: string; name: string; verifyUrl: string }): Promise<void> {
  const subject = "Verify your Apt.Bed email";

  const text = [
    `Hi ${data.name},`,
    ``,
    `Thanks for creating an Apt.Bed account. Please confirm your email address by`,
    `opening the link below. It expires in 24 hours.`,
    ``,
    data.verifyUrl,
    ``,
    `If you didn't create this account, you can safely ignore this email.`,
    ``,
    `— Victory Martin`,
  ].join("\n");

  const html = renderVerifyHtml(data);

  await deliverMail({ to: data.email, subject, text, html, logLabel: `email verification for ${data.email}` });
}

/** Alerts the store admin that a new (paid) order has come in. */
export async function sendNewOrderAdminAlert(data: {
  adminEmail: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { label: string; quantity: number }[];
  total: number;
}): Promise<void> {
  const subject = `New order ${data.orderNumber} — ${formatCents(data.total)}`;
  const itemLines = data.items.map((it) => `${it.quantity}× ${it.label}`);

  const text = [
    `A new order has been placed and paid.`,
    ``,
    `Order:    ${data.orderNumber}`,
    `Customer: ${data.customerName} <${data.customerEmail}>`,
    `Total:    ${formatCents(data.total)}`,
    ``,
    ...itemLines.map((l) => `  ${l}`),
    ``,
    `Manage it in the admin dashboard.`,
  ].join("\n");

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px">
    <h2 style="color:#1E3A5F;margin:0 0 4px">New order ${escapeHtml(data.orderNumber)}</h2>
    <p style="color:#374151;margin:0 0 16px">A new order has been placed and paid — <strong>${formatCents(data.total)}</strong>.</p>
    <p style="color:#374151;margin:0 0 4px"><strong>Customer:</strong> ${escapeHtml(data.customerName)} (${escapeHtml(data.customerEmail)})</p>
    <ul style="color:#374151;padding-left:18px;margin:8px 0 16px">${itemLines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
    <p style="color:#6b7280;font-size:13px">Manage this order in the Victory Martin admin dashboard.</p>
  </div>`;

  await deliverMail({ to: data.adminEmail, subject, text, html, logLabel: `admin alert for order ${data.orderNumber}` });
}

/** Sends an admin-authored message to a customer (used from the reviews screen). */
export async function sendAdminMessage(data: {
  to: string;
  customerName?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const greeting = data.customerName ? `Hi ${data.customerName},` : "Hello,";
  const text = [greeting, ``, data.message, ``, `— Victory Martin`].join("\n");

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px">
    <p style="color:#0C1826">${escapeHtml(greeting)}</p>
    <div style="color:#374151;line-height:1.6;white-space:pre-wrap">${escapeHtml(data.message)}</div>
    <p style="color:#6b7280;font-size:13px;margin-top:20px">— Victory Martin · apartmentloftbed.com</p>
  </div>`;

  await deliverMail({ to: data.to, subject: data.subject, text, html, logLabel: `admin message to ${data.to}` });
}

/**
 * Shared Resend delivery. Sends via the Resend HTTP API when RESEND_API_KEY is
 * set; otherwise logs to the server console so every email flow stays verifiable
 * in dev. Uses fetch — no extra dependency.
 */
async function deliverMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  logLabel: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Victory Martin <orders@apartmentloftbed.com>";

  if (!apiKey) {
    console.log(
      `\n──────── EMAIL (${opts.logLabel}) (dev — set RESEND_API_KEY to send) ────────\nFrom: ${from}\nTo: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}\n────────────────────────────────────────────────\n`
    );
    return;
  }

  try {
    // Resend uses Bearer auth and a JSON body.
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[resend] send failed (${res.status}) for ${opts.logLabel}: ${detail}`);
    } else {
      const json = (await res.json().catch(() => ({}))) as { id?: string };
      console.log(`[resend] sent ${opts.logLabel} to ${opts.to}${json.id ? ` (id ${json.id})` : ""}`);
    }
  } catch (err) {
    console.error(`[resend] error sending ${opts.logLabel}:`, err);
  }
}

function renderHtml(data: OrderEmailData, itemLines: string[]): string {
  const rows = itemLines
    .map((l) => `<tr><td style="padding:6px 0;color:#1E3A5F;font-size:14px">${escapeHtml(l)}</td></tr>`)
    .join("");
  const totalRow = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;color:${bold ? "#0C1826" : "#6b7280"};font-size:14px;${bold ? "font-weight:700" : ""}">${label}</td><td align="right" style="padding:4px 0;color:${bold ? "#0C1826" : "#374151"};font-size:14px;${bold ? "font-weight:700" : ""}">${value}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;background:#F4EDE3;font-family:Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EDE3;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;max-width:520px;width:100%">
        <tr><td style="background:#1E3A5F;padding:20px 28px;color:#fff;font-size:18px;font-weight:700">Victory Martin — Apt.Bed</td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 8px;color:#0C1826;font-size:16px">Hi ${escapeHtml(data.customerName)},</p>
          <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6">Thanks for your order! We've received it and payment is confirmed. Your Apt.Bed is now made to order — track its status any time from your account.</p>
          <p style="margin:0 0 6px;color:#0C1826;font-size:14px;font-weight:700">Order ${escapeHtml(data.orderNumber)}</p>
          <table role="presentation" width="100%" style="border-top:1px solid #eee;border-bottom:1px solid #eee;margin:6px 0 14px">${rows}</table>
          <table role="presentation" width="100%">
            ${totalRow("Subtotal", formatCents(data.subtotal))}
            ${totalRow("Sales tax", formatCents(data.tax))}
            ${totalRow("Freight", formatCents(data.freight))}
            ${totalRow("Total", formatCents(data.total), true)}
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#F7F2EA;color:#6b7280;font-size:12px">Handcrafted to order in South Carolina, USA · apartmentloftbed.com</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderResetHtml(data: { name: string; resetUrl: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#F4EDE3;font-family:Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EDE3;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;max-width:520px;width:100%">
        <tr><td style="background:#1E3A5F;padding:20px 28px;color:#fff;font-size:18px;font-weight:700">Victory Martin — Apt.Bed</td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 8px;color:#0C1826;font-size:16px">Hi ${escapeHtml(data.name)},</p>
          <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6">We received a request to reset your Apt.Bed account password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong> and can be used once.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px">
            <tr><td style="border-radius:10px;background:#C8102E">
              <a href="${escapeHtml(data.resetUrl)}" style="display:inline-block;padding:12px 22px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px">Reset password</a>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;line-height:1.6">Or paste this link into your browser:</p>
          <p style="margin:0 0 20px;color:#1E3A5F;font-size:12px;word-break:break-all">${escapeHtml(data.resetUrl)}</p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#F7F2EA;color:#6b7280;font-size:12px">Handcrafted to order in South Carolina, USA · apartmentloftbed.com</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderVerifyHtml(data: { name: string; verifyUrl: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#F4EDE3;font-family:Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EDE3;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;max-width:520px;width:100%">
        <tr><td style="background:#1E3A5F;padding:20px 28px;color:#fff;font-size:18px;font-weight:700">Victory Martin — Apt.Bed</td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 8px;color:#0C1826;font-size:16px">Hi ${escapeHtml(data.name)},</p>
          <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6">Thanks for creating an Apt.Bed account. Confirm your email address to activate it. This link expires in <strong>24 hours</strong>.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px">
            <tr><td style="border-radius:10px;background:#C8102E">
              <a href="${escapeHtml(data.verifyUrl)}" style="display:inline-block;padding:12px 22px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px">Verify email</a>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;line-height:1.6">Or paste this link into your browser:</p>
          <p style="margin:0 0 20px;color:#1E3A5F;font-size:12px;word-break:break-all">${escapeHtml(data.verifyUrl)}</p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6">If you didn't create this account, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#F7F2EA;color:#6b7280;font-size:12px">Handcrafted to order in South Carolina, USA · apartmentloftbed.com</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
