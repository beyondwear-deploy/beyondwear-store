"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField, clean, Honeypot, inputCls, TextField } from "@/components/ui/Form";
import { isEmail, isPhone, login, passwordIssue, register, requestPasswordReset } from "@/lib/adapters/auth";
import { cn } from "@/lib/format";
import type { User } from "@/lib/types";

export type AuthMode = "login" | "register" | "forgot";
type Errors = Record<string, string | undefined>;

function PasswordField({ label, value, onChange, error, autoComplete, hint }: { label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string; hint?: string }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}<span className="text-accent" aria-hidden> *</span></label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} maxLength={100} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className={cn(inputCls, "pr-12")} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-fg">
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-subtle">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export function AuthPanel({ mode, setMode, onAuthed }: { mode: AuthMode; setMode: (m: AuthMode) => void; onAuthed: (u: User, isNew: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "", terms: false });
  const [sent, setSent] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };
  const switchMode = (m: AuthMode) => { setErrors({}); setSent(false); setMode(m); };
  const bot = (e: FormEvent<HTMLFormElement>) => !!(new FormData(e.currentTarget).get("company_website") as string)?.length;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bot(e)) return;
    const er: Errors = {};
    if (!isEmail(form.email)) er.email = "Enter a valid email address.";
    if (mode === "register") {
      if (clean(form.fullName, 80).length < 2) er.fullName = "Please enter your full name.";
      if (form.phone.trim() && !isPhone(form.phone)) er.phone = "Enter a valid phone number.";
      const pw = passwordIssue(form.password); if (pw) er.password = pw;
      if (form.confirm !== form.password) er.confirm = "Passwords don't match.";
      if (!form.terms) er.terms = "Please accept the terms to continue.";
    }
    if (mode === "login" && !form.password) er.password = "Enter your password.";
    setErrors(er);
    if (Object.keys(er).length) return;

    setBusy(true);
    try {
      if (mode === "forgot") { await requestPasswordReset(form.email); setSent(true); return; }
      const res = mode === "login" ? await login(form.email, form.password) : await register({ fullName: clean(form.fullName, 80), email: form.email, phone: clean(form.phone, 20) || undefined, password: form.password });
      if (!res.ok) { setErrors({ [res.field ?? "form"]: res.error }); return; }
      onAuthed(res.data, mode === "register");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally { setBusy(false); }
  };

  const titles: Record<AuthMode, [string, string]> = {
    login: ["Welcome back", "Sign in to see your orders, wishlist and saved addresses."],
    register: ["Create your account", "Save addresses, track orders and check out faster."],
    forgot: ["Reset your password", "Enter your email and we'll send you a reset link."],
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {mode !== "forgot" && (
        <div role="tablist" aria-label="Account" className="relative mb-8 grid grid-cols-2 rounded-full bg-soft p-1">
          {(["login", "register"] as const).map((m) => (
            <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => switchMode(m)} className={cn("relative z-10 h-11 rounded-full text-xs font-bold uppercase tracking-[0.12em] transition-colors", mode === m ? "text-bg" : "text-muted hover:text-fg")}>
              {mode === m && <motion.span layoutId="auth-pill" className="absolute inset-0 -z-10 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={mode + String(sent)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
          {mode === "forgot" && sent ? (
            <div className="text-center" role="status">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success-soft text-success"><MailCheck className="size-7" aria-hidden /></div>
              <h1 className="text-3xl">Check your inbox</h1>
              <p className="mt-3 text-sm text-muted">If an account exists for <strong className="text-fg">{form.email}</strong>, a reset link is on its way.</p>
              <p className="mt-2 text-xs text-subtle">Demo store: no email is actually sent. With Supabase Auth connected this uses <code>resetPasswordForEmail</code>.</p>
              <Button variant="outline" className="mt-6" onClick={() => switchMode("login")}>Back to sign in</Button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl">{titles[mode][0]}</h1>
              <p className="mt-2 text-sm text-muted">{titles[mode][1]}</p>
              <form onSubmit={submit} noValidate className="relative mt-7 space-y-4">
                <Honeypot />
                {errors.form && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{errors.form}</p>}
                {mode === "register" && <TextField label="Full name" required autoComplete="name" value={form.fullName} maxLength={80} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} />}
                <TextField label="Email" required type="email" inputMode="email" autoComplete="email" value={form.email} maxLength={120} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                {mode === "register" && <TextField label="Phone (optional)" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} maxLength={20} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />}
                {mode !== "forgot" && <PasswordField label="Password" value={form.password} onChange={(v) => set("password", v)} error={errors.password} autoComplete={mode === "login" ? "current-password" : "new-password"} hint={mode === "register" ? "At least 8 characters, with a letter and a number." : undefined} />}
                {mode === "register" && <PasswordField label="Confirm password" value={form.confirm} onChange={(v) => set("confirm", v)} error={errors.confirm} autoComplete="new-password" />}
                {mode === "register" && (
                  <div>
                    <CheckboxField checked={form.terms} onChange={(v) => set("terms", v)} label={<>I agree to the <a href="/policies/terms" target="_blank" className="underline">Terms</a> and <a href="/policies/privacy" target="_blank" className="underline">Privacy Policy</a>.</>} />
                    {errors.terms && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.terms}</p>}
                  </div>
                )}
                {mode === "login" && <button type="button" onClick={() => switchMode("forgot")} className="link-underline text-xs font-semibold text-muted hover:text-fg">Forgot password?</button>}
                <Button type="submit" full size="lg" loading={busy}>{mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}</Button>
                {mode === "forgot" && <button type="button" onClick={() => switchMode("login")} className="mx-auto block text-xs font-semibold text-muted underline underline-offset-4 hover:text-fg">Back to sign in</button>}
              </form>
              {mode !== "forgot" && <p className="mt-6 text-center text-xs text-subtle">Demo store: accounts are saved in this browser only. Production uses Supabase Auth.</p>}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
