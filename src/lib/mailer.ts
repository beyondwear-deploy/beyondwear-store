/**
 * MAILER — sends real notification emails using free Gmail SMTP.
 *
 * Setup (all free, no paid service required):
 *  1. Use any Gmail account (a dedicated one for the store is recommended,
 *     e.g. beyondwear.store@gmail.com — but your own Gmail works too).
 *  2. Turn on 2-Step Verification on that Google account.
 *  3. Create an "App Password": myaccount.google.com/apppasswords
 *     → app "Mail", device "Other" → name it "BeyondWear" → copy the 16-char code.
 *  4. In Vercel → your project → Settings → Environment Variables, add:
 *       GMAIL_USER = the Gmail address from step 1
 *       GMAIL_APP_PASSWORD = the 16-character app password from step 3
 *       NOTIFY_EMAIL = the inbox that should receive orders/messages
 *         (can be the same Gmail address, or any other inbox you check)
 *  5. Redeploy. Until these are set, sendNotification() safely no-ops and
 *     logs a warning instead of throwing, so the site never breaks because
 *     email isn't configured yet.
 */
import nodemailer from "nodemailer";

let cachedTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return cachedTransport;
}

export interface NotifyInput {
  subject: string;
  html: string;
  replyTo?: string;
}

export interface NotifyResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/** Sends a notification email to NOTIFY_EMAIL (or GMAIL_USER as a fallback). Never throws. */
export async function sendNotification({ subject, html, replyTo }: NotifyInput): Promise<NotifyResult> {
  const transport = getTransport();
  const user = process.env.GMAIL_USER;
  const to = process.env.NOTIFY_EMAIL || user;
  if (!transport || !to) {
    console.warn("[mailer] GMAIL_USER / GMAIL_APP_PASSWORD / NOTIFY_EMAIL not configured — skipping email:", subject);
    return { ok: false, skipped: true, error: "Email is not configured yet." };
  }
  try {
    await transport.sendMail({
      from: `BeyondWear Store <${user}>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return { ok: false, error: "Failed to send email." };
  }
}
