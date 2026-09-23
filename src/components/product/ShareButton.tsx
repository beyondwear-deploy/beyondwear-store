"use client";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";
import { useUI } from "@/store";

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useUI((s) => s.toast);
  const ref = useRef<HTMLDivElement>(null);
  const url = () => (typeof window !== "undefined" ? window.location.origin : siteConfig.brand.domain) + path;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator && window.matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title, url: url() }); return; } catch { /* cancelled */ }
    }
    setOpen((o) => !o);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); setCopied(true); toast({ kind: "success", title: "Link copied" }); setTimeout(() => setCopied(false), 1800); }
    catch { toast({ kind: "error", title: "Couldn't copy the link", message: "Copy it from the address bar instead." }); }
    setOpen(false);
  };
  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-soft";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={share} aria-haspopup="menu" aria-expanded={open} className="inline-flex h-14 items-center gap-2 rounded-full border border-line-strong px-5 text-xs font-semibold uppercase tracking-[0.09em] transition hover:border-fg active:scale-95">
        {copied ? <Check className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}Share
      </button>
      {open && (
        <div role="menu" className="glass absolute bottom-full right-0 z-20 mb-2 w-56 rounded-2xl p-1.5 shadow-lift">
          <button role="menuitem" type="button" onClick={copy} className={item}><Link2 className="size-4" aria-hidden />Copy link</button>
          <a role="menuitem" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}><MessageCircle className="size-4" aria-hidden />WhatsApp</a>
          <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}><Share2 className="size-4" aria-hidden />Facebook</a>
        </div>
      )}
    </div>
  );
}
