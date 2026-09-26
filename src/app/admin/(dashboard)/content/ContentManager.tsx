"use client";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

interface OverrideRow { key: string; type: "text" | "image"; value: string; updated_at: string }

const EDITABLE_PAGES = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function ContentManager() {
  const [rows, setRows] = useState<OverrideRow[] | null>(null);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setRows(data.overrides);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    }
  };
  useEffect(() => { load(); }, []);

  const reset = async (key: string) => {
    setResetting(key);
    try {
      await fetch(`/api/admin/content?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      setRows((r) => r?.filter((x) => x.key !== key) ?? null);
    } finally {
      setResetting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-elev p-5">
        <h2 className="mb-2 text-sm font-bold">How it works</h2>
        <p className="text-sm text-muted">
          Open any page below on the live site while signed in here, click the orange <span className="font-semibold text-fg">“Edit page”</span> button in the
          bottom-right corner, then hover any dashed-outline text or photo and click the pencil to change it. Click Save and it&apos;s live immediately for every visitor.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EDITABLE_PAGES.map((p) => (
            <a key={p.href} href={p.href} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full bg-soft px-3.5 py-1.5 text-xs font-semibold text-fg hover:bg-line">
              {p.label} <ExternalLink className="size-3" aria-hidden />
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-elev p-5">
        <h2 className="mb-4 text-sm font-bold">Saved edits</h2>
        {error && <p className="text-sm text-danger">{error}</p>}
        {!error && rows === null && <p className="text-sm text-subtle">Loading…</p>}
        {rows && rows.length === 0 && <p className="text-sm text-subtle">Nothing customized yet — everything is showing its default text and photos.</p>}
        {rows && rows.length > 0 && (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-semibold text-fg">{r.key}</p>
                  <p className="truncate text-xs text-subtle">{r.type === "image" ? "Photo" : r.value} · saved {formatDate(r.updated_at, true)}</p>
                </div>
                <button
                  onClick={() => reset(r.key)} disabled={resetting === r.key}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-soft px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-line disabled:opacity-60"
                >
                  <RotateCcw className="size-3" aria-hidden /> {resetting === r.key ? "Resetting…" : "Reset to default"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
