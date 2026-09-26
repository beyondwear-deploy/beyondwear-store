"use client";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * Shared "review before you save" dialog used by every inline editor
 * (EditableText, EditableImage, EditableImageSlot). Always shows the
 * current value next to whatever the admin is about to change it to.
 */
export function FieldEditorModal({
  title, onCancel, onSave, saving, error, saveLabel = "Save", children, extraActions,
}: {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string;
  saveLabel?: string;
  children: ReactNode;
  /** Optional extra buttons (e.g. "Remove photo") shown left of Cancel/Save. */
  extraActions?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-fg/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-elev p-5 shadow-2xl ring-1 ring-line"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-fg">{title}</h3>
          <button type="button" onClick={onCancel} aria-label="Close" className="rounded-full p-1.5 text-subtle transition hover:bg-soft hover:text-fg">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {children}

        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

        <div className="mt-5 flex items-center justify-between gap-2">
          <div>{extraActions}</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg bg-soft px-4 py-2 text-sm font-semibold text-muted transition hover:bg-line disabled:opacity-60">
              Cancel
            </button>
            <button
              type="button" onClick={onSave} disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-fg transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
              {saving ? "Saving…" : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A labelled "Current" / "New" pair — the standard before/after layout inside the modal. */
export function BeforeAfter({ before, after, beforeLabel = "Current", afterLabel = "New" }: { before: ReactNode; after: ReactNode; beforeLabel?: string; afterLabel?: string }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-subtle">{beforeLabel}</p>
        {before}
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-subtle">{afterLabel}</p>
        {after}
      </div>
    </div>
  );
}
