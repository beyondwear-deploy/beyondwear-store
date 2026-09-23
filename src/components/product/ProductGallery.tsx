"use client";
import { ChevronLeft, ChevronRight, Expand, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/format";
import type { ImageView, Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export const VIEW_LABEL: Record<ImageView, string> = {
  front: "Front", back: "Back", side: "Side", detail: "Close-up", label: "Brand & size label", wear: "Wear detail",
};

/** Desktop hover-zoom image (vector art stays crisp when scaled). */
function ZoomImage({ product, index, onOpen, eager }: { product: Product; index: number; onOpen: () => void; eager?: boolean }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${VIEW_LABEL[product.images[index].view]} image in full screen viewer`}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
      onMouseLeave={() => setPos(null)}
      className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-3xl bg-soft ring-1 ring-line/60"
    >
      <div className="h-full w-full transition-transform duration-300 ease-out" style={{ transform: pos ? "scale(2.2)" : "scale(1)", transformOrigin: pos ? `${pos.x}% ${pos.y}%` : "50% 50%" }}>
        <ProductImage product={product} index={index} eager={eager} />
      </div>
    </button>
  );
}

export function ProductGallery({ product: p, sold, openAt, onOpenAtHandled }: { product: Product; sold: boolean; openAt?: number | null; onOpenAtHandled?: () => void }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const n = p.images.length;

  useEffect(() => { if (openAt !== null && openAt !== undefined) { setIndex(openAt); setViewer(true); onOpenAtHandled?.(); } }, [openAt, onOpenAtHandled]);

  // keep index in sync with swipe position on mobile
  const onScroll = useCallback(() => {
    const el = track.current; if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex((cur) => (cur !== i ? i : cur));
  }, []);
  const goto = (i: number) => {
    setIndex(i);
    const el = track.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="lg:sticky lg:top-28">
      <div className="grid gap-4 lg:grid-cols-[84px_1fr]">
        {/* desktop thumbnails */}
        <div className="order-2 hidden gap-3 lg:order-1 lg:flex lg:flex-col" role="tablist" aria-label="Product images">
          {p.images.map((img, i) => (
            <button key={img.view} type="button" role="tab" aria-selected={i === index} aria-label={`${VIEW_LABEL[img.view]}`} onClick={() => setIndex(i)} onMouseEnter={() => setIndex(i)}
              className={cn("relative aspect-[4/5] overflow-hidden rounded-xl bg-soft ring-2 transition", i === index ? "ring-fg" : "ring-transparent opacity-65 hover:opacity-100")}>
              <ProductImage product={p} index={i} />
            </button>
          ))}
        </div>

        <div className="order-1 relative lg:order-2">
          {/* desktop main */}
          <div className="hidden lg:block"><ZoomImage product={p} index={index} onOpen={() => setViewer(true)} eager /></div>
          {/* mobile swipe carousel */}
          <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl lg:hidden" role="group" aria-label="Product images, swipe to browse">
            {p.images.map((img, i) => (
              <button key={img.view} type="button" onClick={() => setViewer(true)} aria-label={`${VIEW_LABEL[img.view]} — tap for full screen`} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-soft">
                <ProductImage product={p} index={i} eager={i === 0} />
              </button>
            ))}
          </div>

          {sold && <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl bg-bg/40"><span className="rounded-full bg-fg px-6 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-bg shadow-lift">Sold out</span></div>}

          <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-elev/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-soft backdrop-blur">{VIEW_LABEL[p.images[index].view]}</div>
          <button type="button" onClick={() => setViewer(true)} className="glass absolute bottom-4 right-4 inline-flex h-11 items-center gap-2 rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.1em] shadow-soft transition hover:bg-elev active:scale-95">
            <Expand className="size-4" aria-hidden /> View details
          </button>
          {/* mobile dots */}
          <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
            {p.images.map((_, i) => <button key={i} type="button" tabIndex={-1} aria-label={`Show image ${i + 1} of ${p.images.length}`} aria-current={i === index} onClick={() => goto(i)} className={cn("h-1.5 rounded-full transition-all duration-300", i === index ? "w-6 bg-fg" : "w-1.5 bg-line-strong")} />)}
          </div>
        </div>
      </div>
      <p className="mt-3 hidden text-xs text-muted lg:block">Hover to zoom · click for full screen. Images include close-ups of labels and any wear.</p>

      <Viewer product={p} index={index} setIndex={setIndex} open={viewer} onClose={() => setViewer(false)} />
    </div>
  );
}

function Viewer({ product: p, index, setIndex, open, onClose }: { product: Product; index: number; setIndex: (i: number) => void; open: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const n = p.images.length;
  const prev = useCallback(() => { setZoom(null); setIndex((index - 1 + n) % n); }, [index, n, setIndex]);
  const next = useCallback(() => { setZoom(null); setIndex((index + 1) % n); }, [index, n, setIndex]);
  useEffect(() => {
    if (!open) { setZoom(null); return; }
    const on = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, prev, next]);
  const img = p.images[index];
  const caption = img.view === "wear" ? `${p.wearNote}. ${p.conditionNotes[0] ?? ""}` : img.view === "label" ? `Brand: ${p.brand} · Size ${p.size} · ${p.material}` : img.alt;

  const setFromEvent = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setZoom({ x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 });
  };

  return (
    <Modal open={open} onClose={onClose} title={`${p.brand} ${p.name} — image viewer`} hideTitle variant="full" className="!bg-transparent !text-white">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div><p className="text-sm font-semibold">{p.brand} {p.name}</p><p className="text-xs text-white/60">{VIEW_LABEL[img.view]} · {index + 1} / {n}</p></div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setZoom(zoom ? null : { x: 50, y: 50 })} aria-pressed={!!zoom} aria-label={zoom ? "Zoom out" : "Zoom in"} className="tap grid place-items-center rounded-full hover:bg-white/10">{zoom ? <Minus className="size-5" /> : <Plus className="size-5" />}</button>
            <button type="button" onClick={onClose} aria-label="Close viewer" className="tap grid place-items-center rounded-full hover:bg-white/10"><X className="size-6" /></button>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
          <button type="button" onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:left-5"><ChevronLeft className="size-6" /></button>
          <div
            className={cn("relative aspect-[4/5] h-full max-h-full max-w-full overflow-hidden rounded-2xl bg-soft", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
            onClick={(e) => (zoom ? setZoom(null) : setFromEvent(e.clientX, e.clientY, e.currentTarget))}
            onMouseMove={(e) => zoom && setFromEvent(e.clientX, e.clientY, e.currentTarget)}
            onTouchMove={(e) => zoom && setFromEvent(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
          >
            <div key={index} className="h-full w-full transition-transform duration-300 ease-out" style={{ transform: zoom ? "scale(2.6)" : "scale(1)", transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}>
              <ProductImage product={p} index={index} eager />
            </div>
          </div>
          <button type="button" onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:right-5"><ChevronRight className="size-6" /></button>
        </div>
        <p className="mx-auto max-w-xl px-6 py-3 text-center text-xs text-white/70" aria-live="polite">{caption}</p>
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 pb-5">
          {p.images.map((im, i) => (
            <button key={im.view} type="button" onClick={() => { setZoom(null); setIndex(i); }} aria-label={VIEW_LABEL[im.view]} aria-current={i === index} className={cn("aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:w-16", i === index ? "ring-white" : "ring-transparent opacity-50 hover:opacity-100")}>
              <ProductImage product={p} index={i} />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
