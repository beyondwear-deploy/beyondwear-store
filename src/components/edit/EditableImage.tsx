"use client";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { BeforeAfter, FieldEditorModal } from "./FieldEditorModal";
import { useEditMode, useOverride } from "./EditModeContext";

interface EditableImageProps {
  /** Stable id for this image, e.g. "about.photo". Must be unique across the site. */
  id: string;
  /** The site's default image URL — shown until an admin uploads a replacement. */
  defaultSrc: string;
  alt: string;
  className?: string;
  /** Friendly name shown at the top of the edit dialog, e.g. "About page photo". */
  label?: string;
}

/** Wraps an <img> so a signed-in admin can click it, preview the new photo next to the current one, and Save. */
export function EditableImage({ id, defaultSrc, alt, className, label }: EditableImageProps) {
  const { editMode, setOverride } = useEditMode();
  const src = useOverride(id, defaultSrc);
  const [editing, setEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @next/next/no-img-element
  if (!editMode) return <img src={src} alt={alt} className={className} />;

  const openEditor = () => { setFile(null); setPreviewUrl(null); setError(""); setEditing(true); };
  const pick = () => inputRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!file) { setEditing(false); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("key", id);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Upload failed.");
      setOverride(id, data.url);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    setSaving(true);
    setError("");
    try {
      await fetch(`/api/admin/content?key=${encodeURIComponent(id)}`, { method: "DELETE" });
      setOverride(id, defaultSrc);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <span
        role="button" tabIndex={0} onClick={openEditor}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEditor(); } }}
        title="Click to edit"
        className="edit-target group relative block cursor-pointer outline-dashed outline-1 outline-accent/40 outline-offset-2 transition hover:outline-2 hover:outline-accent"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
        <span className="pointer-events-none absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-accent text-accent-fg opacity-0 shadow transition group-hover:opacity-100">
          <Pencil className="size-4" aria-hidden />
        </span>
      </span>

      {editing && (
        <FieldEditorModal
          title={label ?? "Edit photo"} onCancel={() => setEditing(false)} onSave={save} saving={saving} error={error}
          saveLabel={file ? "Save photo" : "Save"}
          extraActions={
            src !== defaultSrc ? (
              <button type="button" onClick={resetToDefault} disabled={saving} className="rounded-lg bg-soft px-3.5 py-2 text-xs font-semibold text-danger transition hover:bg-danger-soft disabled:opacity-60">
                Reset to default
              </button>
            ) : undefined
          }
        >
          <BeforeAfter
            before={
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt} className="aspect-[4/3] w-full rounded-lg bg-soft object-cover" />
            }
            after={
              <div className="space-y-2">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="New preview" className="aspect-[4/3] w-full rounded-lg bg-soft object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-dashed border-line-strong bg-soft text-xs text-subtle">No photo chosen yet</div>
                )}
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onFile} />
                <button type="button" onClick={pick} className="w-full rounded-lg bg-soft px-3 py-1.5 text-xs font-semibold text-fg transition hover:bg-line">
                  {previewUrl ? "Choose a different photo…" : "Choose photo…"}
                </button>
              </div>
            }
          />
        </FieldEditorModal>
      )}
    </>
  );
}
