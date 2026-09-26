"use client";
import { Loader2, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { useEditMode, useOverride } from "./EditModeContext";

interface EditableImageProps {
  /** Stable id for this image, e.g. "about.photo". Must be unique across the site. */
  id: string;
  /** The site's default image URL — shown until an admin uploads a replacement. */
  defaultSrc: string;
  alt: string;
  className?: string;
}

/** Wraps an <img> so the signed-in admin can click a pencil, pick a new photo, and it saves immediately. */
export function EditableImage({ id, defaultSrc, alt, className }: EditableImageProps) {
  const { editMode, setOverride } = useEditMode();
  const src = useOverride(id, defaultSrc);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @next/next/no-img-element
  if (!editMode) return <img src={src} alt={alt} className={className} />;

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("key", id);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Upload failed.");
      setOverride(id, data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <span className="group relative block outline-dashed outline-1 outline-accent/40 outline-offset-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} />
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onChange} />
      <button
        type="button" onClick={onPick} disabled={uploading} aria-label="Replace this image"
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-accent text-accent-fg opacity-0 shadow transition group-hover:opacity-100 disabled:opacity-100"
      >
        {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
      </button>
      {error && <span className="absolute inset-x-0 bottom-0 bg-danger px-2 py-1 text-center text-[10px] font-semibold text-white">{error}</span>}
    </span>
  );
}
