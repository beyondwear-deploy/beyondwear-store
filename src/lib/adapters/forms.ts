/**
 * NEWSLETTER + CONTACT adapters (local demo).
 * Submissions are validated then stored in this browser only. Replace the body
 * of these functions with a POST to your backend (e.g. Supabase insert into
 * `newsletter_subscribers` / `contact_messages`, or an email service) — the
 * calling components already handle loading / success / error states.
 */
export type SubmitResult = { ok: true; duplicate?: boolean } | { ok: false; error: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function push(key: string, value: unknown): void {
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push(value);
  localStorage.setItem(key, JSON.stringify(arr));
}

export async function subscribeNewsletter(email: string): Promise<SubmitResult> {
  await wait(700);
  try {
    const list: { email: string }[] = JSON.parse(localStorage.getItem("beyondwear.newsletter") || "[]");
    if (list.some((x) => x.email === email.toLowerCase())) return { ok: true, duplicate: true };
    push("beyondwear.newsletter", { email: email.toLowerCase(), at: new Date().toISOString() });
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't save your email. Please try again." };
  }
}

export async function sendContactMessage(msg: { name: string; email: string; phone?: string; subject: string; message: string; productRef?: string }): Promise<SubmitResult> {
  await wait(900);
  try {
    push("beyondwear.messages", { ...msg, at: new Date().toISOString() });
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong sending your message. Please try again or reach us on WhatsApp." };
  }
}
