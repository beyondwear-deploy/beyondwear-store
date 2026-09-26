"use client";
import { Pencil } from "lucide-react";
import { useState, type ElementType } from "react";
import { BeforeAfter, FieldEditorModal } from "./FieldEditorModal";
import { useEditMode, useOverride } from "./EditModeContext";

interface EditableTextProps {
  /** Stable id for this field, e.g. "about.story.p1". Must be unique across the site. */
  id: string;
  /** The site's default copy — shown until an admin saves an override. */
  defaultValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  /** Friendly name shown at the top of the edit dialog, e.g. "Homepage hero heading". Defaults to the id. */
  label?: string;
}

/**
 * Wraps a piece of text so a signed-in admin can click it anywhere, review
 * the current text next to their edit, and Save — no code changes needed.
 * Renders as plain text for every other visitor.
 */
export function EditableText({ id, defaultValue, as: Tag = "span", className, multiline = true, label }: EditableTextProps) {
  const { editMode, setOverride } = useEditMode();
  const value = useOverride(id, defaultValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!editMode) return <Tag className={className}>{value}</Tag>;

  const startEdit = () => {
    setDraft(value);
    setError("");
    setEditing(true);
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

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={startEdit}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startEdit(); } }}
        title="Click to edit"
        className="edit-target group relative inline-block cursor-pointer rounded outline-dashed outline-1 outline-accent/40 outline-offset-2 transition hover:bg-accent-soft/50 hover:outline-2 hover:outline-accent"
      >
        <Tag className={className}>{value}</Tag>
        <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-fg opacity-0 shadow transition group-hover:opacity-100">
          <Pencil className="size-2.5" aria-hidden />
        </span>
      </span>

      {editing && (
        <FieldEditorModal title={label ?? "Edit text"} onCancel={() => setEditing(false)} onSave={save} saving={saving} error={error}>
          <BeforeAfter
            before={<p className="whitespace-pre-wrap rounded-lg bg-soft px-3 py-2 text-sm text-muted">{value || <span className="italic text-subtle">(empty)</span>}</p>}
            after={
              multiline ? (
                <textarea
                  autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={Math.max(3, Math.min(10, Math.ceil(draft.length / 50)))}
                  className="w-full resize-y rounded-lg border border-line bg-elev p-2.5 text-sm text-fg outline-none focus:border-accent"
                />
              ) : (
                <input
                  autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                  className="w-full rounded-lg border border-line bg-elev p-2.5 text-sm text-fg outline-none focus:border-accent"
                />
              )
            }
          />
        </FieldEditorModal>
      )}
    </>
  );
}
