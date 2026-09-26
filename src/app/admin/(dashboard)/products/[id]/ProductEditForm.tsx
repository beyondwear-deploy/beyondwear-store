"use client";
import { Loader2, Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { CONDITIONS } from "@/lib/format";
import { toPatch, type ProductPatchSnapshot } from "@/lib/productPatch";
import type { ImageView, Measurement, Product, ProductImage as ProductImageType } from "@/lib/types";

const STATUSES: { id: Product["status"]; label: string; hint: string }[] = [
  { id: "active", label: "Active", hint: "Shown and buyable on the live site." },
  { id: "draft", label: "Draft", hint: "Hidden from the site until switched to Active." },
  { id: "archived", label: "Archived", hint: "Hidden — kept for records only." },
];

const VIEW_CYCLE: ImageView[] = ["front", "back", "side", "detail", "label", "wear"];
const nextView = (used: ImageView[]): ImageView => VIEW_CYCLE.find((v) => !used.includes(v)) ?? "front";

export function ProductEditForm({ product, configured, hasOverride, isCustom, defaultCostPrice }: { product: Product; configured: boolean; hasOverride: boolean; isCustom: boolean; defaultCostPrice: number }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductPatchSnapshot>(() => toPatch(product));
  const [conditionNotesText, setConditionNotesText] = useState(product.conditionNotes.join("\n"));
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ProductPatchSnapshot>(key: K, value: ProductPatchSnapshot[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const setMeasurement = (i: number, field: keyof Measurement, value: string) => {
    set("measurements", form.measurements.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  };
  const addMeasurement = () => set("measurements", [...form.measurements, { label: "", value: "" }]);
  const removeMeasurement = (i: number) => set("measurements", form.measurements.filter((_, idx) => idx !== i));

  const setImageSrc = (i: number, src: string | undefined) => {
    set("images", form.images.map((img, idx) => (idx === i ? { ...img, src } : img)));
  };
  const removeImageSlot = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));
  const addImageSlot = (src: string) => {
    const view = nextView(form.images.map((i) => i.view));
    set("images", [...form.images, { view, alt: `${form.brand} ${form.name}`.trim() || "Product photo", src }]);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const patch = { ...form, conditionNotes: conditionNotesText.split("\n").map((s) => s.trim()).filter(Boolean) };
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
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

  const reset = async () => {
    const confirmMsg = isCustom
      ? "Delete this product for good? This can't be undone."
      : "Reset this product back to its original built-in details? This can't be undone.";
    if (!confirm(confirmMsg)) return;
    setResetting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || (isCustom ? "Delete failed." : "Reset failed."));
      if (isCustom) {
        router.push("/admin/products");
      } else {
        router.refresh();
        router.push(`/admin/products/${product.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {!configured && (
        <div className="rounded-2xl border border-dashed border-line-strong bg-elev px-5 py-4 text-sm text-subtle">
          Connect your free database to save edits — see <code className="rounded bg-soft px-1 py-0.5">ADMIN_SETUP.md</code>.
        </div>
      )}

      <Section title="Photos">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {form.images.map((img, i) => (
            <ImageSlot
              key={img.view} product={product} images={form.images} index={i} productId={product.id}
              isCustom={isCustom} canRemove={isCustom && form.images.length > 1}
              onChange={(src) => setImageSrc(i, src)} onRemove={() => removeImageSlot(i)}
            />
          ))}
          {isCustom && form.images.length < 6 && <AddImageSlot productId={product.id} onAdd={addImageSlot} />}
        </div>
      </Section>

      <Section title="Basics">
        <Field label="Name">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Brand">
          <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (PKR)">
            <input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Was price (optional)">
            <input
              type="number" min={0} value={form.originalPrice ?? ""}
              onChange={(e) => set("originalPrice", e.target.value === "" ? null : Number(e.target.value))}
              className={inputCls} placeholder="No strike-through price"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls} />
        </Field>
      </Section>

      <Section title="Condition">
        <Field label="Condition">
          <select value={form.condition} onChange={(e) => set("condition", e.target.value as Product["condition"])} className={inputCls}>
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Condition notes (one per line)">
          <textarea value={conditionNotesText} onChange={(e) => { setConditionNotesText(e.target.value); setSaved(false); }} rows={4} className={inputCls} />
        </Field>
        <Field label="Wear note (short summary shown on the product card)">
          <input value={form.wearNote} onChange={(e) => set("wearNote", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Material">
          <input value={form.material} onChange={(e) => set("material", e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Measurements">
        <div className="space-y-2">
          {form.measurements.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={m.label} onChange={(e) => setMeasurement(i, "label", e.target.value)} placeholder="Label (e.g. Chest)" className={inputCls} />
              <input value={m.value} onChange={(e) => setMeasurement(i, "value", e.target.value)} placeholder="Value (e.g. 21&quot;)" className={`${inputCls} max-w-[9rem]`} />
              <button type="button" onClick={() => removeMeasurement(i)} aria-label="Remove measurement" className="shrink-0 rounded-lg p-2 text-subtle hover:bg-soft hover:text-danger">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <button type="button" onClick={addMeasurement} className="rounded-lg bg-soft px-3 py-1.5 text-xs font-semibold text-fg hover:bg-line">+ Add measurement</button>
        </div>
      </Section>

      <Section title="Inventory">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock">
            <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value as Product["status"])} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <p className="text-xs text-subtle">{STATUSES.find((s) => s.id === form.status)?.hint}</p>
        <Field label={`Cost price (PKR) — what you paid for this pair`}>
          <input
            type="number" min={0} value={form.costPrice ?? ""} placeholder={`Default: ${defaultCostPrice}`}
            onChange={(e) => set("costPrice", e.target.value === "" ? null : Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <p className="text-xs text-subtle">Leave blank to use the store default ({defaultCostPrice} PKR, set in Financials → Settings). Used to calculate profit and inventory value.</p>
      </Section>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-line bg-elev/95 px-5 py-4 shadow-lg backdrop-blur">
        <button
          type="button" onClick={save} disabled={saving || !configured}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm font-medium text-success">Saved — live now.</span>}
        {(hasOverride || isCustom) && (
          <button
            type="button" onClick={reset} disabled={resetting}
            className={`ml-auto flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${isCustom ? "bg-danger-soft text-danger hover:opacity-90" : "bg-soft text-muted hover:bg-line"}`}
          >
            {isCustom ? <Trash2 className="size-4" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
            {resetting ? (isCustom ? "Deleting…" : "Resetting…") : isCustom ? "Delete product" : "Reset to original"}
          </button>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-line bg-elev px-3.5 py-2 text-sm outline-none focus:border-accent";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-elev p-5">
      <h2 className="text-sm font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-subtle">{label}</span>
      {children}
    </label>
  );
}

function ImageSlot({
  product, images, index, productId, isCustom, canRemove, onChange, onRemove,
}: {
  product: Product; images: ProductImageType[]; index: number; productId: string;
  isCustom: boolean; canRemove: boolean; onChange: (src: string | undefined) => void; onRemove: () => void;
}) {
  const img = images[index];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewProduct = { ...product, images };

  const onPick = () => inputRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("view", img.view);
      const res = await fetch(`/api/admin/products/${productId}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeLabel = canRemove ? "Remove this photo" : "Remove photo, use generated art instead";

  return (
    <div className="space-y-1.5">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-soft outline-dashed outline-1 outline-line-strong">
        <ProductImage product={previewProduct} index={index} className="h-full w-full object-cover" />
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
        <button
          type="button" onClick={onPick} disabled={uploading} aria-label={`Upload a photo for ${img.view}`}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-accent text-accent-fg opacity-0 shadow transition group-hover:opacity-100 disabled:opacity-100"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
        </button>
        {(img.src || canRemove) && (
          <button
            type="button" onClick={() => (canRemove ? onRemove() : onChange(undefined))} aria-label={removeLabel} title={removeLabel}
            className="absolute left-2 top-2 flex size-8 items-center justify-center rounded-full bg-fg/80 text-bg opacity-0 shadow transition group-hover:opacity-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <p className="text-center text-[11px] font-medium capitalize text-subtle">{isCustom ? (index === 0 ? "Main photo" : `Photo ${index + 1}`) : img.view}</p>
      {error && <p className="text-center text-[10px] text-danger">{error}</p>}
    </div>
  );
}

/** Extra "+" tile that uploads and appends a new photo — only shown for admin-added products, which can have any number of photos. */
function AddImageSlot({ productId, onAdd }: { productId: string; onAdd: (src: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("view", "front");
      const res = await fetch(`/api/admin/products/${productId}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Upload failed.");
      onAdd(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button" onClick={pick} disabled={uploading}
        className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong text-subtle transition hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {uploading ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <Plus className="size-6" aria-hidden />}
        <span className="text-xs font-semibold">{uploading ? "Uploading…" : "Add photo"}</span>
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
      {error && <p className="text-center text-[10px] text-danger">{error}</p>}
    </div>
  );
}
