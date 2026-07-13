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
 * Sends an order confirmation via Mailgun (https://mailgun.com).
 * Set MAILGUN_API_KEY + MAILGUN_DOMAIN (and optionally MAILGUN_FROM / MAILGUN_API_BASE
 * for the EU region) in .env. In dev without a key the message is logged to the
 * server console so the flow stays verifiable. Uses the Mailgun HTTP API
 * directly via fetch — no extra dependency required.
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

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const base = process.env.MAILGUN_API_BASE || "https://api.mailgun.net";
  const from = process.env.MAILGUN_FROM || `Victory Martin <orders@${domain ?? "victorymartin.com"}>`;

  if (!apiKey || !domain) {
    console.log(
      `\n──────── ORDER CONFIRMATION EMAIL (dev — set MAILGUN_API_KEY + MAILGUN_DOMAIN to send) ────────\nFrom: ${from}\nTo: ${data.email}\nSubject: ${subject}\n\n${text}\n────────────────────────────────────────────────\n`
    );
    return;
  }

  try {
    const body = new URLSearchParams();
    body.set("from", from);
    body.set("to", data.email);
    body.set("subject", subject);
    body.set("text", text);
    body.set("html", html);

    // Mailgun uses HTTP Basic auth: username "api", password = the API key.
    const auth = Buffer.from(`api:${apiKey}`).toString("base64");
    const res = await fetch(`${base}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[mailgun] send failed (${res.status}) for order ${data.orderNumber}: ${detail}`);
    } else {
      const json = (await res.json().catch(() => ({}))) as { id?: string };
      console.log(`[mailgun] sent order ${data.orderNumber} to ${data.email}${json.id ? ` (id ${json.id})` : ""}`);
    }
  } catch (err) {
    console.error(`[mailgun] error sending order ${data.orderNumber}:`, err);
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
        <tr><td style="padding:16px 28px;background:#F7F2EA;color:#6b7280;font-size:12px">Handcrafted to order in South Carolina, USA · victorymartin.com</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
