"use client";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-elev p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Lock className="size-5" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold">{siteConfig.brand.name} Admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage orders, analytics and site content.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-subtle">Email</label>
            <input
              id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-line-strong bg-soft px-4 text-sm text-fg outline-none transition focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-subtle">Password</label>
            <input
              id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-line-strong bg-soft px-4 text-sm text-fg outline-none transition focus:border-accent"
            />
          </div>
          {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-accent text-xs font-bold uppercase tracking-[0.12em] text-accent-fg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
