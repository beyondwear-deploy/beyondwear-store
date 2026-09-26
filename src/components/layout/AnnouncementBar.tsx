"use client";
import { EditableText } from "@/components/edit/EditableText";
import { useEditMode } from "@/components/edit/EditModeContext";
import { siteConfig } from "@/lib/config";

export function AnnouncementBar() {
  const { editMode } = useEditMode();
  const items = siteConfig.announcement;

  // In edit mode, show one static (non-scrolling) row so the inline editor
  // doesn't have to fight the marquee animation.
  if (editMode) {
    return (
      <div className="overflow-x-auto bg-inverse py-2.5 text-inverse-fg" role="region" aria-label="Announcements">
        <ul className="flex items-center gap-8 px-4">
          {items.map((t, i) => (
            <li key={i} className="flex shrink-0 items-center whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em]">
              <EditableText id={`announcement.${i}`} defaultValue={t} multiline={false} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const row = (dup: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={dup || undefined}>
      {items.map((t, i) => (
        <li key={t + dup} className="flex items-center whitespace-nowrap px-8 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <ItemText id={`announcement.${i}`} defaultValue={t} />
          <span aria-hidden className="ml-16 size-1 rounded-full bg-accent" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden bg-inverse py-2.5 text-inverse-fg" role="region" aria-label="Announcements">
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}

/** Plain (non-editing) render of an announcement item's live value — used in the scrolling marquee. */
function ItemText({ id, defaultValue }: { id: string; defaultValue: string }) {
  const { overrides } = useEditMode();
  return <>{overrides[id] ?? defaultValue}</>;
}
