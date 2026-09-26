"use client";
import { Loader2, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { CATEGORIES, GENDERS } from "@/lib/catalog";
import { CONDITIONS } from "@/lib/format";
import type { Category, Condition, Gender } from "@/lib/types";

interface UploadedImage { url: string; alt: string }

const STATUSES: { id: "active" | "draft" | "archived"; label: string }[] = [
  { id: "active", label: "Active — shown on the live site" },
  { id: "draft", label: "Draft — hidden for now" },
];

export function NewProductForm({ defaultCostPrice }: { defaultCostPrice: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Category>("shoes");
  const [gender, setGender] = useState<Gender>("unisex");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("#1c1b19");
  const [condition, setCondition] = useState<Condition>("excellent");
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [conditionNotesText, setConditionNotesText] = useState("");
  const [wearNote, setWearNote] = useState("");
  const [material, setMaterial] = useState("");
  const [stock, setStock] = useState<number>(1);
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");
  const [costPrice, setCostPrice] = useState<string>("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();
  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files.slice(0, 6 - images.length)) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/products/new/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Upload failed.");
        setImages((prev) => [...prev, { url: data.url, alt: `${brand} ${name}`.trim() || "Product photo" }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name, brand, category, gender, type, size, color, colorHex,
        condition, price, originalPrice: originalPrice === "" ? null : Number(originalPrice),
        description, conditionNotes: conditionNotesText.split("\n").map((s) => s.trim()).filter(Boolean),
        wearNote, material, stock, status, images,
        costPrice: costPrice === "" ? null : Number(costPrice),
      };
      const res = await fetch("/api/admin/products", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed.");
      router.push(`/admin/products/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <Section title="Photos">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.url} className="space-y-1.5">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                <button
                  type="button" onClick={() => removeImage(i)} aria-label="Remove photo"
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-fg/80 text-bg opacity-0 shadow transition group-hover:opacity-100"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
              {i === 0 && <p className="text-center text-[11px] font-medium text-subtle">Main photo</p>}
            </div>
          ))}
          {images.length < 6 && (
            <button
              type="button" onClick={pick} disabled={uploading}
              className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong text-subtle transition hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <Plus className="size-6" aria-hidden />}
              <span className="text-xs font-semibold">{uploading ? "Uploading…" : "Add photo"}</span>
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="hidden" onChange={onFiles} />
        <p className="text-xs text-subtle">Up to 6 photos. The first is used as the main listing photo.</p>
      </Section>

      <Section title="Basics">
        <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Air Max Trainers" /></Field>
        <Field label="Brand"><input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls} placeholder="e.g. Nike" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Gender">
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputCls}>
              {GENDERS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type"><input value={type} onChange={(e) => setType(e.target.value)} className={inputCls} placeholder="e.g. Sneakers" /></Field>
          <Field label="Size"><input value={size} onChange={(e) => setSize(e.target.value)} className={inputCls} placeholder="e.g. UK 9" /></Field>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <Field label="Colour"><input value={color} onChange={(e) => setColor(e.target.value)} className={inputCls} placeholder="e.g. Black" /></Field>
          <Field label="Swatch"><input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-[38px] w-16 cursor-pointer rounded-lg border border-line bg-elev p-1" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (PKR)"><input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputCls} /></Field>
          <Field label="Was price (optional)">
            <input type="number" min={0} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className={inputCls} placeholder="No strike-through price" />
          </Field>
        </div>
        <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputCls} /></Field>
      </Section>

      <Section title="Condition">
        <Field label="Condition">
          <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className={inputCls}>
            {CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Condition notes (one per line)"><textarea value={conditionNotesText} onChange={(e) => setConditionNotesText(e.target.value)} rows={3} className={inputCls} /></Field>
        <Field label="Wear note (short summary shown on the product card)"><input value={wearNote} onChange={(e) => setWearNote(e.target.value)} className={inputCls} /></Field>
        <Field label="Material"><input value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls} /></Field>
      </Section>

      <Section title="Inventory">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock"><input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} className={inputCls} /></Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "draft")} className={inputCls}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label={`Cost price (PKR) — what you paid for this pair`}>
          <input type="number" min={0} value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className={inputCls} placeholder={`Default: ${defaultCostPrice}`} />
        </Field>
        <p className="text-xs text-subtle">Leave blank to use the store default ({defaultCostPrice} PKR, set in Financials → Settings). Used to calculate profit and inventory value.</p>
      </Section>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-line bg-elev/95 px-5 py-4 shadow-lg backdrop-blur">
        <button
          type="button" onClick={save} disabled={saving || uploading}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "Saving…" : "Add product"}
        </button>
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
