"use client";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoreSettings } from "@/lib/storeSettings";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [startingCapital, setStartingCapital] = useState(String(settings.startingCapital));
  const [defaultCostPrice, setDefaultCostPrice] = useState(String(settings.defaultCostPrice));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const sc = Number(startingCapital);
    const cp = Number(defaultCostPrice);
    if (!Number.isFinite(sc) || sc < 0 || !Number.isFinite(cp) || cp < 0) {
      setError("Both values need to be valid, non-negative numbers.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startingCapital: sc, defaultCostPrice: cp }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed.");
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5 rounded-2xl border border-line bg-elev p-6">
      <div>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-subtle">Starting capital (PKR)</span>
          <input type="number" min={0} value={startingCapital} onChange={(e) => { setStartingCapital(e.target.value); setSaved(false); }} className={inputCls} />
        </label>
        <p className="mt-1.5 text-xs text-subtle">The money you put into the business to start it. Entered once — used as the base for the balance sheet and cash flow statement.</p>
      </div>
      <div>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-subtle">Default cost price per pair (PKR)</span>
          <input type="number" min={0} value={defaultCostPrice} onChange={(e) => { setDefaultCostPrice(e.target.value); setSaved(false); }} className={inputCls} />
        </label>
        <p className="mt-1.5 text-xs text-subtle">Used for any product that doesn&apos;t have its own cost price set (edit a product to override it individually).</p>
      </div>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button" onClick={save} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-sm font-medium text-success">Saved.</span>}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-line bg-elev px-3.5 py-2 text-sm outline-none focus:border-accent";
