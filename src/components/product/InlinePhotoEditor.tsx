"use client";
import { Camera, Loader2, Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FieldEditorModal } from "@/components/edit/FieldEditorModal";
import { useEditMode } from "@/components/edit/EditModeContext";
import type { ImageView, Product, ProductImage as ProductImageType } from "@/lib/types";
import { ProductImage } from "./ProductImage";

const VIEW_CYCLE: ImageView[] = ["front", "back", "side", "detail", "label", "wear"];
const nextView = (used: ImageView[]): ImageView => VIEW_CYCLE.find((v) => !used.includes(v)) ?? "front";

/**
 * Admin-only "Edit photos" button shown directly on the live product page.
 * Lets an admin upload, replace or remove this product's photos without
 * going through the admin dashboard — the same save endpoint the
 * /admin/products/[id] form uses.
 */
export function InlinePhotoEditor({ product }: { product: Product }) {
  const { isAdmin, editMode } = useEditMode();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ProductImageType[]>(product.images);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isCustom = product.id.startsWith("c");

  if (!isAdmin || !editMode) return null;

  const openEditor = () => { setImages(product.images); setError(""); setOpen(true); };

  const setSrc = (i: number, src: string | undefined) => setImages((prev) => prev.map((img, idx) => (idx === i ? { ...img, src } : img)));
  const removeAt = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const addSlot = (src: string) => setImages((prev) => [...prev, { view: nextView(prev.map((i) => i.view)), alt: `${product.brand} ${product.name}`, src }]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button" onClick={openEditor}
        className="glass absolute left-4 top-4 z-10 inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-fg shadow-soft transition hover:opacity-90"
      >
        <Camera className="size-4" aria-hidden /> Edit photos
      </button>

      {open && (
        <FieldEditorModal title="Edit photos" onCancel={() => setOpen(false)} onSave={save} saving={saving} error={error} saveLabel="Save photos">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img, i) => (
              <PhotoTile
                key={`${img.view}-${i}`} product={product} images={images} index={i}
                canRemove={isCustom ? images.length > 1 : true}
                removesSlot={isCustom}
                onChange={(src) => setSrc(i, src)} onRemove={() => removeAt(i)}
              />
            ))}
            {images.length < 6 && <AddTile productId={product.id} onAdd={addSlot} />}
          </div>
          <p className="mt-3 text-xs text-subtle">
            {isCustom ? "Removing a photo deletes it from the listing." : "Removing a photo reverts that spot to the generated placeholder art."}
          </p>
        </FieldEditorModal>
      )}
    </>
  );
}

function PhotoTile({
  product, images, index, canRemove, removesSlot, onChange, onRemove,
}: { product: Product; images: ProductImageType[]; index: number; canRemove: boolean; removesSlot: boolean; onChange: (src: string | undefined) => void; onRemove: () => void }) {
  const img = images[index];
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewProduct = { ...product, images };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("view", img.view);
      const res = await fetch(`/api/admin/products/${product.id}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) onChange(data.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-soft outline-dashed outline-1 outline-line-strong">
      <ProductImage product={previewProduct} index={index} className="h-full w-full object-cover" />
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
      <button
        type="button" onClick={() => inputRef.current?.click()} disabled={uploading} aria-label="Upload a photo"
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-accent text-accent-fg opacity-0 shadow transition group-hover:opacity-100 disabled:opacity-100"
      >
        {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
      </button>
      {(img.src || canRemove) && (
        <button
          type="button" onClick={() => (removesSlot ? onRemove() : onChange(undefined))} aria-label="Remove photo"
          className="absolute left-2 top-2 flex size-8 items-center justify-center rounded-full bg-fg/80 text-bg opacity-0 shadow transition group-hover:opacity-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function AddTile({ productId, onAdd }: { productId: string; onAdd: (src: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("view", "front");
      const res = await fetch(`/api/admin/products/${productId}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) onAdd(data.url);
    } finally {
      setUploading(false);
    }
  };
  return (
    <button
      type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
      className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line-strong text-subtle transition hover:border-accent hover:text-accent disabled:opacity-60"
    >
      {uploading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Plus className="size-5" aria-hidden />}
      <span className="text-[11px] font-semibold">Add photo</span>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
    </button>
  );
}
