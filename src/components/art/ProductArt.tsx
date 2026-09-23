import { useId } from "react";
import { darken, inkFor, lighten } from "@/lib/color";
import type { ArtSpec, GarmentKey, ImageView } from "@/lib/types";
import { GARMENTS, type GarmentProps } from "./garments";

/**
 * Generated studio imagery. Every product renders through <ProductImage/>,
 * which uses a real photo when `image.src` exists and falls back to this art.
 * View boxes below zoom into the garment for the "detail" and "wear" shots.
 */

// x y w h — always 4:5 so every view fills the same card ratio
const DETAIL: Record<GarmentKey, string> = {
  tee: "100 60 200 250", shirt: "110 60 180 225", hoodie: "100 40 200 250", trucker: "110 70 180 225", bomber: "110 70 180 225",
  puffer: "110 60 180 225", jeans: "100 20 200 250", sneaker: "130 130 240 300", boot: "120 80 240 300", cap: "110 90 240 300",
  tote: "90 180 220 275", cross: "90 160 220 275", pack: "110 100 180 225", sunglasses: "40 200 200 250", belt: "10 170 220 275", watch: "110 130 180 225",
};
const WEAR: Record<GarmentKey, { vb: string; at: [number, number] }> = {
  tee: { vb: "80 290 200 250", at: [190, 405] }, shirt: { vb: "10 220 180 225", at: [60, 310] }, hoodie: { vb: "10 250 200 250", at: [58, 330] },
  trucker: { vb: "10 220 180 225", at: [54, 308] }, bomber: { vb: "10 220 180 225", at: [56, 312] }, puffer: { vb: "10 240 190 238", at: [52, 320] },
  jeans: { vb: "70 330 180 225", at: [140, 446] }, sneaker: { vb: "190 230 200 250", at: [340, 338] }, boot: { vb: "40 230 180 225", at: [96, 330] },
  cap: { vb: "230 230 200 250", at: [330, 332] }, tote: { vb: "40 330 200 250", at: [70, 430] }, cross: { vb: "60 280 200 250", at: [100, 366] },
  pack: { vb: "70 330 180 225", at: [110, 420] }, sunglasses: { vb: "50 210 160 200", at: [132, 294] }, belt: { vb: "180 190 220 275", at: [300, 246] },
  watch: { vb: "130 290 140 175", at: [200, 340] },
};

const WEAVE_ID = (uid: string, kind: string) => `${uid}-tex-${kind}`;

interface Meta {
  brand: string;
  size: string;
  material: string;
  wearNote: string;
}
interface Props {
  art: ArtSpec;
  view: ImageView;
  meta: Meta;
  alt: string;
  className?: string;
  decorative?: boolean;
  /** Optional CSS colour that tints the studio backdrop (hero / category compositions). */
  tint?: string;
}

export function ProductArt({ art, view, meta, alt, className, decorative, tint }: Props) {
  const raw = useId();
  const uid = "a" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const { garment, color, color2, variant = 0, mark } = art;
  const fab = art.fabric ?? (garment === "jeans" || garment === "trucker" ? "denim" : "plain");
  const Garment = GARMENTS[garment];
  const props: GarmentProps = { c: color, c2: color2, v: variant, mark, view, uid, fab };

  let vb = "0 0 400 500";
  if (view === "detail") vb = DETAIL[garment];
  if (view === "wear") vb = WEAR[garment].vb;
  const [vx, vy, vw, vh] = vb.split(" ").map(Number);
  const standing = ["sneaker", "boot", "cross", "tote", "pack", "sunglasses", "watch", "cap", "belt"].includes(garment);
  const showFloor = view !== "detail" && view !== "wear" && view !== "label";

  return (
    <svg
      viewBox={vb}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="42%" r="75%">
          <stop offset="0%" style={{ stopColor: tint ? `color-mix(in srgb, ${tint} 45%, var(--art-bg-b))` : "var(--art-bg-b)" }} />
          <stop offset="100%" style={{ stopColor: tint ? `color-mix(in srgb, ${tint} 80%, var(--art-bg-a))` : "var(--art-bg-a)" }} />
        </radialGradient>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${uid}-lens`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a7a7a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0c1414" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={`${uid}-floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* fabric textures */}
        <pattern id={WEAVE_ID(uid, "denim")} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="5" height="5" fill="none" />
          <path d="M0 0 H5" stroke="#fff" strokeOpacity="0.13" strokeWidth="1.2" />
          <path d="M0 2.5 H5" stroke="#000" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <pattern id={WEAVE_ID(uid, "knit")} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" />
          <path d="M1 0 V4" stroke="#000" strokeOpacity="0.16" strokeWidth="1.2" />
          <path d="M3 0 V4" stroke="#fff" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <pattern id={WEAVE_ID(uid, "plain")} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="none" />
          <path d="M0 3 H6" stroke="#000" strokeOpacity="0.045" strokeWidth="1" />
        </pattern>
        <pattern id={WEAVE_ID(uid, "canvas")} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" />
          <path d="M0 2 H4 M2 0 V4" stroke="#000" strokeOpacity="0.09" strokeWidth="0.8" />
        </pattern>
        <pattern id={WEAVE_ID(uid, "leather")} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="none" />
          <circle cx="2" cy="2" r="0.9" fill="#000" fillOpacity="0.16" />
          <circle cx="6" cy="6" r="0.9" fill="#000" fillOpacity="0.12" />
          <circle cx="6" cy="2" r="0.6" fill="#fff" fillOpacity="0.1" />
        </pattern>
      </defs>

      {/* studio backdrop (oversized so zoomed views still fill) */}
      <rect x={vx - 400} y={vy - 400} width={vw + 800} height={vh + 800} fill={`url(#${uid}-bg)`} />
      {view !== "label" && <ellipse cx="200" cy="250" rx="360" ry="330" fill={`url(#${uid}-bg)`} />}

      {showFloor && (
        <ellipse cx="200" cy={standing ? (garment === "sneaker" ? 354 : garment === "boot" ? 372 : garment === "cap" ? 350 : 448) : 466} rx={standing ? 150 : 130} ry="12" fill={`url(#${uid}-floor)`} />
      )}

      {view === "label" ? (
        <LabelCard art={art} meta={meta} uid={uid} />
      ) : (
        <Garment {...props} />
      )}

      {view === "wear" && <WearMark at={WEAR[garment].at} note={meta.wearNote} vb={[vx, vy, vw, vh]} />}
    </svg>
  );
}

function WearMark({ at, note, vb }: { at: [number, number]; note: string; vb: [number, number, number, number] }) {
  const [x, y] = at;
  const [vx, vy, vw, vh] = vb;
  const pillW = Math.min(vw - 20, note.length * 7.2 + 26);
  return (
    <g>
      <circle cx={x} cy={y} r={30} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeDasharray="5 4" />
      <circle cx={x} cy={y} r={4} fill="var(--accent)" />
      <g transform={`translate(${vx + vw / 2 - pillW / 2} ${vy + vh - 34})`}>
        <rect width={pillW} height={24} rx={12} fill="var(--bg-elev)" stroke="var(--border-strong)" />
        <text x={pillW / 2} y={16} textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontSize={11.5} fontWeight={600} fill="var(--fg)">{note}</text>
      </g>
    </g>
  );
}

/** Brand / size label lying on the garment's fabric. */
function LabelCard({ art, meta, uid }: { art: ArtSpec; meta: Meta; uid: string }) {
  const fabric = darken(art.color, 0.1);
  const brand = meta.brand.toUpperCase();
  const bw = Math.min(210, brand.length * 17);
  const size = meta.size.replace(/^UK\s*/i, "");
  const mat = meta.material.length > 34 ? meta.material.slice(0, 33) + "…" : meta.material;
  return (
    <g>
      <rect x={-400} y={-400} width={1200} height={1300} fill={fabric} />
      <rect x={-400} y={-400} width={1200} height={1300} fill={`url(#${uid}-tex-${art.fabric ?? "plain"})`} />
      <rect x={-400} y={-400} width={1200} height={1300} fill={`url(#${uid}-shade)`} />
      <path d="M-20 90 H420 M-20 410 H420" stroke={darken(fabric, 0.3)} strokeWidth={2} strokeDasharray="5 4" opacity={0.6} />
      <g transform="rotate(-3 200 250)">
        <rect x={88} y={158} width={224} height={184} rx={6} fill="#000" opacity={0.18} transform="translate(5 8)" />
        <rect x={88} y={158} width={224} height={184} rx={6} fill="#f2ede0" />
        <path d="M88 158 h224 v4 h-224Z" fill="#000" opacity={0.04} />
        <text x={200} y={200} textAnchor="middle" textLength={bw} lengthAdjust="spacingAndGlyphs" fontFamily="Inter Variable, sans-serif" fontWeight={800} fontSize={24} fill="#1a1916">{brand}</text>
        <path d="M112 216 H288" stroke="#1a1916" strokeWidth={1.2} opacity={0.5} />
        <text x={112} y={250} fontFamily="Inter Variable, sans-serif" fontSize={11} letterSpacing={2.4} fill="#5a554b" fontWeight={600}>SIZE</text>
        <text x={288} y={264} textAnchor="end" fontFamily="Fraunces Variable, serif" fontSize={size.length > 4 ? 24 : 44} fill="#1a1916" fontWeight={500}>{size}</text>
        <path d="M112 280 H288" stroke="#1a1916" strokeWidth={1} opacity={0.3} />
        <text x={112} y={302} fontFamily="Inter Variable, sans-serif" fontSize={10.5} fill="#3d3a33">{mat}</text>
        <g fill="none" stroke="#1a1916" strokeWidth={1.4} opacity={0.75}>
          <rect x={112} y={312} width={13} height={13} rx={2} />
          <circle cx={143} cy={318.5} r={6.5} />
          <path d="M160 325 l6.5 -13 l6.5 13 Z" />
          <rect x={182} y={312} width={13} height={13} rx={2} />
          <path d="M182 312 l13 13" />
        </g>
      </g>
    </g>
  );
}
