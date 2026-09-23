import { siteConfig } from "@/lib/config";

export function AnnouncementBar() {
  const items = siteConfig.announcement;
  const row = (dup: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={dup || undefined}>
      {items.map((t) => (
        <li key={t + dup} className="flex items-center whitespace-nowrap px-8 text-[11px] font-semibold uppercase tracking-[0.18em]">
          {t}<span aria-hidden className="ml-16 size-1 rounded-full bg-accent" />
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
