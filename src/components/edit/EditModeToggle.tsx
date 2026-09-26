"use client";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEditMode } from "./EditModeContext";

/** Floating admin-only control that turns inline editing on/off across the site. */
export function EditModeToggle() {
  const { isAdmin, editMode, toggleEditMode } = useEditMode();
  const pathname = usePathname();
  if (!isAdmin || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[500] flex flex-col items-end gap-2">
      {editMode && (
        <p className="max-w-[220px] rounded-xl bg-fg px-3 py-2 text-right text-xs font-medium text-bg shadow-lg">
          Edit mode is on — hover any outlined text or photo and click the pencil.
        </p>
      )}
      <div className="flex items-center gap-2">
        <Link href="/admin" className="rounded-full bg-elev px-3 py-2 text-xs font-semibold text-fg shadow-lg ring-1 ring-line hover:bg-soft">Dashboard</Link>
        <button
          type="button" onClick={toggleEditMode}
          className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-lg transition ${editMode ? "bg-fg text-bg" : "bg-accent text-accent-fg"}`}
        >
          {editMode ? <X className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
          {editMode ? "Done editing" : "Edit page"}
        </button>
      </div>
    </div>
  );
}
