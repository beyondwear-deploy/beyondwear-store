"use client";
import { Pipette } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface PickerPhoto { url: string; label: string }

const MAX_SIDE = 600;

const toHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

/** The handful of most common non-background colours in a picture, as hex strings. */
function dominantColors(data: Uint8ClampedArray, max = 6): string[] {
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 8) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue;
    if (Math.min(r, g, b) > 225) continue; // white-ish studio background
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const cur = buckets.get(key);
    if (cur) { cur.n++; cur.r += r; cur.g += g; cur.b += b; }
    else buckets.set(key, { n: 1, r, g, b });
  }
  const picked: { r: number; g: number; b: number }[] = [];
  for (const bk of [...buckets.values()].sort((a, b) => b.n - a.n)) {
    const c = { r: bk.r / bk.n, g: bk.g / bk.n, b: bk.b / bk.n };
    // Skip shades that are almost the same as one we already have, so the suggestions are genuinely different colours.
    if (picked.some((p) => Math.hypot(p.r - c.r, p.g - c.g, p.b - c.b) < 48)) continue;
    picked.push(c);
    if (picked.length >= max) break;
  }
  return picked.map((c) => toHex(c.r, c.g, c.b));
}

/**
 * Lets the admin set a product's swatch colour straight from its own photo, right next to the colour field.
 *
 * Why: the browser's built-in colour eyedropper can only sample what is visible on screen, and the product
 * photos sit at the top of the form — scrolling up to them closes the picker. Here the photo is shown beside
 * the field: click anywhere on it, or tap one of the suggested colours.
 */
export function PhotoColorPicker({ photos, onPick }: { photos: PickerPhoto[]; onPick: (hex: string) => void }) {
  const [active, setActive] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const index = Math.min(active, photos.length - 1);
  const photo = photos[index];
  const url = photo?.url;

  // Copy the chosen photo into an off-screen canvas so its pixels can be read.
  useEffect(() => {
    canvasRef.current = null;
    setSuggestions([]);
    setError("");
    if (!url) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("no canvas");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height); // throws if the image isn't readable
        canvasRef.current = canvas;
        setSuggestions(dominantColors(data));
      } catch {
        setError("This photo's colours can't be read here — use the colour box above instead.");
      }
    };
    img.onerror = () => { if (!cancelled) setError("This photo's colours can't be read here — use the colour box above instead."); };
    img.src = url;
    return () => { cancelled = true; };
  }, [url]);

  const sample = (e: React.MouseEvent<HTMLImageElement>) => {
    const canvas = canvasRef.current;
    const el = imgRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !el || !ctx) return;
    const rect = el.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    // Average a small patch rather than one pixel, so grain and stitching don't skew the colour.
    const half = 2;
    const x0 = Math.max(0, x - half), y0 = Math.max(0, y - half);
    const w = Math.min(canvas.width - x0, half * 2 + 1), h = Math.min(canvas.height - y0, half * 2 + 1);
    if (w < 1 || h < 1) return;
    const { data } = ctx.getImageData(x0, y0, w, h);
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    if (n) onPick(toHex(r / n, g / n, b / n));
  };

  if (!photo) return null;

  return (
    <div className="space-y-3 rounded-xl border border-line bg-soft/40 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-subtle">
        <Pipette className="size-3.5" aria-hidden />
        Pick the swatch from your photo: click any spot on it, or tap a suggested colour.
      </p>

      {photos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <button
              key={p.url} type="button" onClick={() => setActive(i)} aria-label={`Use ${p.label}`} aria-pressed={i === index}
              className={`size-12 overflow-hidden rounded-lg border-2 ${i === index ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef} src={photo.url} alt={photo.label} onClick={sample}
          className="max-h-64 w-auto max-w-full cursor-crosshair rounded-lg"
        />
        {suggestions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-subtle">Suggested colours</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((hex) => (
                <button
                  key={hex} type="button" onClick={() => onPick(hex)} aria-label={`Use colour ${hex}`} title={hex}
                  className="size-9 rounded-full ring-1 ring-line-strong transition hover:scale-110" style={{ background: hex }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
