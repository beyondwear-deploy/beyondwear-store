"use client";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useRef, useState, type ElementType } from "react";
import { useEditMode, useOverride } from "./EditModeContext";

interface EditableTextProps {
  /** Stable id for this field, e.g. "about.story.p1". Must be unique across the site. */
  id: string;
  /** The site's default copy — shown until an admin saves an override. */
  defaultValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
}

/**
 * Wraps a piece of text so the signed-in admin can click a pencil, edit it
 * in place, and click Save — no code changes needed. Renders as plain text
 * for every other visitor.
 */
export function EditableText({ id, defaultValue, as: Tag = "span", className, multiline = true }: EditableTextProps) {
  const { editMode, setOverride } = useEditMode();
  const value = useOverride(id, defaultValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  if (!editMode) return <Tag className={className}>{value}</Tag>;

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setError("");
    requestAnimationFrame(() => ref.current?.focus());
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: id, type: "text", value: draft }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed.");
      setOverride(id, draft);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    const Field = multiline ? "textarea" : "input";
    return (
      <span className="relative inline-block w-full rounded-lg ring-2 ring-accent">
        <Field
          ref={ref as never}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={multiline ? Math.max(2, Math.ceil(draft.length / 60)) : undefined}
          className={`w-full resize-y rounded-lg border-0 bg-elev p-2 text-fg outline-none ${className ?? ""}`}
        />
        <span className="mt-1 flex items-center gap-2">
          <button type="button" onClick={save} disabled={saving} className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-accent-fg disabled:opacity-60">
            {saving ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Check className="size-3" aria-hidden />} Save
          </button>
          <button type="button" onClick={() => setEditing(false)} disabled={saving} className="flex items-center gap-1 rounded-md bg-soft px-2.5 py-1 text-xs font-semibold text-muted">
            <X className="size-3" aria-hidden /> Cancel
          </button>
          {error && <span className="text-xs font-medium text-danger">{error}</span>}
        </span>
      </span>
    );
  }

  return (
    <span className="group relative inline-block rounded outline-dashed outline-1 outline-accent/40 outline-offset-2">
      <Tag className={className}>{value}</Tag>
      <button
        type="button" onClick={startEdit} aria-label="Edit this text"
        className="absolute -right-7 top-0 flex size-6 items-center justify-center rounded-full bg-accent text-accent-fg opacity-0 shadow transition group-hover:opacity-100"
      >
        <Pencil className="size-3" aria-hidden />
      </button>
    </span>
  );
}
