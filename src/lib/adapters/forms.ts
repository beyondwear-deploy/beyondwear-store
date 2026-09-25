/**
 * NEWSLETTER + CONTACT adapters.
 * These POST to /api/newsletter and /api/contact, which email the submission
 * to you via Gmail SMTP (see src/lib/mailer.ts for setup). A local copy is
 * still kept in this browser as a harmless backup, but the email is the real
 * record now. Once Supabase (or another backend) is connected, swap the body
 * of these functions for a real insert — the calling components already
 * handle loading / success / error states.
 */
export type SubmitResult = { ok: true; duplicate?: boolean } | { ok: false; error: string };

function push(key: string, value: unknown): void {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push(value);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // best-effort local backup only — never block the real submission on this
  }
}

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || "Something went wrong. Please try again." };
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't reach the server. Please check your connection and try again." };
  }
}

export async function subscribeNewsletter(email: string): Promise<SubmitResult> {
  const list: { email: string }[] = JSON.parse(localStorage.getItem("beyondwear.newsletter") || "[]");
  if (list.some((x) => x.email === email.toLowerCase())) return { ok: true, duplicate: true };
  const r = await postJson("/api/newsletter", { email });
  if (!r.ok) return { ok: false, error: r.error! };
  push("beyondwear.newsletter", { email: email.toLowerCase(), at: new Date().toISOString() });
  return { ok: true };
}

export async function sendContactMessage(msg: { name: string; email: string; phone?: string; subject: string; message: string; productRef?: string }): Promise<SubmitResult> {
  const r = await postJson("/api/contact", msg);
  if (!r.ok) return { ok: false, error: r.error! };
  push("beyondwear.messages", { ...msg, at: new Date().toISOString() });
  return { ok: true };
}
