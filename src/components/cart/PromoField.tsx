"use client";
import { Check, Tag, X } from "lucide-react";
import { useState } from "react";
import { validatePromo } from "@/lib/pricing";
import { useCart, useUI } from "@/store";

export function PromoField({ subtotal }: { subtotal: number }) {
  const promo = useCart((s) => s.promo);
  const setPromo = useCart((s) => s.setPromo);
  const toast = useUI((s) => s.toast);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const current = promo ? validatePromo(promo, subtotal) : null;

  if (promo && current?.ok)
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-success-soft px-4 py-3 text-sm text-success" role="status">
        <span className="flex items-center gap-2 font-semibold"><Check className="size-4" aria-hidden /> {promo} applied <span className="hidden font-normal opacity-80 sm:inline">— {current.description}</span></span>
        <button type="button" onClick={() => setPromo(null)} aria-label="Remove promo code" className="rounded-full p-1 hover:bg-black/10"><X className="size-4" /></button>
      </div>
    );

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const r = validatePromo(code, subtotal);
    if (!r.ok) { setError(r.message); return; }
    setError(""); setPromo(r.code); setCode("");
    toast({ kind: "success", title: "Promo code applied", message: r.description });
  };
  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor="promo" className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted"><Tag className="size-3.5" aria-hidden /> Promo code</label>
      <div className="flex gap-2">
        <input id="promo" value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "promo-err" : undefined} autoComplete="off" placeholder="Enter code" maxLength={24}
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-elev px-4 text-sm uppercase tracking-wider outline-none transition placeholder:normal-case placeholder:tracking-normal hover:border-line-strong focus:border-fg aria-[invalid=true]:border-danger" />
        <button type="submit" className="h-11 rounded-full bg-fg px-5 text-xs font-bold uppercase tracking-[0.1em] text-bg transition hover:brightness-125 active:scale-95">Apply</button>
      </div>
      {error && <p id="promo-err" role="alert" className="mt-2 text-xs font-medium text-danger">{error}</p>}
      {promo && current && !current.ok && <p role="alert" className="mt-2 text-xs font-medium text-danger">{promo}: {current.message}</p>}
    </form>
  );
}
