import type { ReactNode } from "react";
import { darken, inkFor, lighten, luminance } from "@/lib/color";
import type { ImageView } from "@/lib/types";

export interface GarmentProps {
  c: string;
  c2: string;
  v: number;
  mark?: string;
  view: ImageView;
  uid: string;
  fab: "denim" | "knit" | "plain" | "leather" | "canvas";
}

/** A filled shape with light shading + fabric texture overlays. */
function Part({ d, fill, uid, fab, tex = true, stroke, sw = 0, opacity = 1 }: { d: string; fill: string; uid: string; fab?: GarmentProps["fab"]; tex?: boolean; stroke?: string; sw?: number; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d={d} fill={`url(#${uid}-shade)`} />
      {tex && fab && <path d={d} fill={`url(#${uid}-tex-${fab})`} />}
    </g>
  );
}

const Stitch = ({ d, color, w = 1.6 }: { d: string; color: string; w?: number }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="4 3.2" strokeLinecap="round" opacity={0.75} />
);
const Seam = ({ d, color, w = 2 }: { d: string; color: string; w?: number }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.55} />
);

/** Chest / pocket print by variant. */
function Print({ v, mark, c, c2, x, y, big = false }: { v: number; mark?: string; c: string; c2: string; x: number; y: number; big?: boolean }) {
  const ink = luminance(c2) > 0.45 || luminance(c) < 0.35 ? c2 : inkFor(c);
  if (v === 1 && mark)
    return (
      <text x={x} y={y} textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight={800} fontSize={big ? 24 : 15} letterSpacing={big ? 4 : 2.5} fill={ink} opacity={0.92}>
        {mark}
      </text>
    );
  if (v === 1)
    return (
      <g fill="none" stroke={ink} strokeWidth={3} opacity={0.9}>
        <circle cx={x} cy={y - 6} r={big ? 18 : 10} />
        <path d={`M${x - (big ? 26 : 15)} ${y + (big ? 26 : 14)} h${big ? 52 : 30}`} />
      </g>
    );
  if (v === 2)
    return (
      <g fill="none" stroke={ink} strokeWidth={3.5} opacity={0.85}>
        <circle cx={x} cy={y} r={big ? 30 : 16} />
        <circle cx={x} cy={y} r={big ? 18 : 9} strokeWidth={2} />
        <path d={`M${x - (big ? 44 : 24)} ${y} h${big ? 88 : 48}`} strokeWidth={2} />
      </g>
    );
  if (v === 3)
    return (
      <g fill={ink} opacity={0.85}>
        <rect x={x - (big ? 60 : 32)} y={y - 12} width={big ? 120 : 64} height={big ? 10 : 6} rx={2} />
        <rect x={x - (big ? 60 : 32)} y={y + 6} width={big ? 84 : 44} height={big ? 10 : 6} rx={2} />
      </g>
    );
  if (v === 4)
    return (
      <g fill={ink} opacity={0.85}>
        <path d={`M${x} ${y - 14} L${x + 12} ${y + 10} L${x - 12} ${y + 10} Z`} />
      </g>
    );
  if (v === 5)
    return (
      <g fill="none" stroke={ink} strokeWidth={3} opacity={0.85} strokeLinecap="round">
        <path d={`M${x - 22} ${y + 8} q11 -26 22 0 q11 26 22 0`} />
      </g>
    );
  return null;
}

/* ------------------------------------------------------------------ */
/* TEE                                                                  */
/* ------------------------------------------------------------------ */
export function Tee({ c, c2, v, mark, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.28), dk2 = darken(c, 0.5);
  const back = view === "back";
  const body = "M150 86 C168 108 232 108 250 86 L316 110 L374 186 L324 216 L300 184 L300 418 Q200 432 100 418 L100 184 L76 216 L26 186 L84 110 Z";
  return (
    <g>
      <Part d={body} fill={c} uid={uid} fab={fab} />
      <Seam d="M100 184 C97 152 92 128 84 110" color={dk} />
      <Seam d="M300 184 C303 152 308 128 316 110" color={dk} />
      <Seam d="M26 186 L76 216" color={dk} w={3} />
      <Seam d="M374 186 L324 216" color={dk} w={3} />
      <Stitch d="M104 402 Q200 415 296 402" color={dk2} />
      {back ? (
        <>
          <path d="M150 86 C170 98 230 98 250 86" stroke={dk} strokeWidth={8} fill="none" strokeLinecap="round" />
          <rect x={186} y={102} width={28} height={16} rx={2} fill={lighten(c, 0.55)} opacity={0.8} />
          <path d="M192 110 h16" stroke={dk2} strokeWidth={1.4} />
        </>
      ) : (
        <>
          <path d="M150 86 C170 76 230 76 250 86 C232 110 168 110 150 86Z" fill={dk2} opacity={0.75} />
          <path d="M148 86 C168 116 232 116 252 86" stroke={dk} strokeWidth={8} fill="none" strokeLinecap="round" />
          <Print v={v} mark={mark} c={c} c2={c2} x={200} y={196} big />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* SHIRT                                                                */
/* ------------------------------------------------------------------ */
export function Shirt({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.25), dk2 = darken(c, 0.5), lt = lighten(c, 0.22);
  const back = view === "back";
  const body = "M148 80 L200 98 L252 80 L322 104 L362 306 L322 314 L302 196 L304 436 Q200 448 96 436 L98 196 L78 314 L38 306 L78 104 Z";
  const check = v === 2;
  return (
    <g>
      <Part d={body} fill={c} uid={uid} fab={fab} />
      {check && (
        <g opacity={0.5} stroke={c2} strokeWidth={5}>
          {[132, 168, 204, 240, 276].map((x) => (<path key={x} d={`M${x} 110 V436`} />))}
          {[140, 190, 240, 290, 340, 390].map((y) => (<path key={y} d={`M98 ${y} H304`} />))}
        </g>
      )}
      {v === 1 && <g opacity={0.14} stroke="#fff" strokeWidth={2}>{[130, 160, 190, 220, 250, 280, 310, 340, 370, 400].map((y) => (<path key={y} d={`M98 ${y} H304`} />))}</g>}
      {v === 3 && <g opacity={0.5} fill={c2}>{Array.from({ length: 24 }).map((_, i) => (<circle key={i} cx={120 + (i % 6) * 32} cy={140 + Math.floor(i / 6) * 70} r={8} />))}</g>}
      <Seam d="M98 196 C95 160 90 128 78 104" color={dk} />
      <Seam d="M302 196 C305 160 310 128 322 104" color={dk} />
      {back ? (
        <>
          <path d="M98 150 Q200 172 302 150" stroke={dk} strokeWidth={2} fill="none" opacity={0.6} />
          <path d="M200 160 V436" stroke={dk} strokeWidth={2} opacity={0.4} />
          <path d="M148 80 L200 92 L252 80 L246 66 Q200 78 154 66 Z" fill={lt} />
          <Stitch d="M100 420 Q200 432 300 420" color={dk2} />
        </>
      ) : (
        <>
          <path d="M148 78 L200 100 L172 140 L132 96 Z" fill={lt} stroke={dk} strokeWidth={1.4} />
          <path d="M252 78 L200 100 L228 140 L268 96 Z" fill={lighten(c, 0.3)} stroke={dk} strokeWidth={1.4} />
          <path d="M200 100 V440" stroke={dk} strokeWidth={2} opacity={0.55} />
          <rect x={198} y={100} width={4} height={340} fill={dk} opacity={0.1} />
          {[152, 198, 244, 290, 336, 382].map((y) => (
            <g key={y}>
              <circle cx={200} cy={y} r={5} fill={lighten(c, 0.6)} stroke={dk2} strokeWidth={1} />
              <path d={`M198 ${y - 2} l4 4 M202 ${y - 2} l-4 4`} stroke={dk2} strokeWidth={0.8} />
            </g>
          ))}
          {v !== 4 && (
            <g>
              <path d="M226 184 h50 v56 l-25 12 l-25 -12 Z" fill="none" stroke={dk} strokeWidth={1.6} opacity={0.7} />
            </g>
          )}
        </>
      )}
      <Seam d="M38 306 L78 314" color={dk2} w={5} />
      <Seam d="M362 306 L322 314" color={dk2} w={5} />
      {!back && <Stitch d="M100 420 Q200 432 300 420" color={dk2} />}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* HOODIE                                                               */
/* ------------------------------------------------------------------ */
export function Hoodie({ c, c2, v, mark, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.55);
  const back = view === "back";
  const body = "M156 106 C176 134 224 134 244 106 L322 130 L368 326 L322 336 L304 206 L308 434 Q200 448 92 434 L96 206 L78 336 L32 326 L78 130 Z";
  return (
    <g>
      <Part d="M138 118 C112 26 288 26 262 118 Z" fill={darken(c, 0.18)} uid={uid} fab={fab} />
      <Part d={body} fill={c} uid={uid} fab={fab} />
      {back ? (
        <>
          <path d="M138 118 C112 26 288 26 262 118 C240 136 160 136 138 118 Z" fill={c} />
          <path d="M138 118 C112 26 288 26 262 118 C240 136 160 136 138 118 Z" fill={`url(#${uid}-shade)`} />
          <path d="M200 40 V122" stroke={dk} strokeWidth={2} opacity={0.6} />
          <Print v={v} mark={mark} c={c} c2={c2} x={200} y={220} big />
        </>
      ) : (
        <>
          <path d="M156 106 C176 134 224 134 244 106 C226 90 174 90 156 106Z" fill={dk2} opacity={0.85} />
          <path d="M156 106 C176 134 224 134 244 106" stroke={dk} strokeWidth={5} fill="none" opacity={0.7} />
          <path d="M184 124 L181 196" stroke={c2} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M216 124 L219 196" stroke={c2} strokeWidth={4.5} strokeLinecap="round" />
          <rect x={178} y={196} width={6} height={12} rx={3} fill={darken(c2, 0.3)} />
          <rect x={216} y={196} width={6} height={12} rx={3} fill={darken(c2, 0.3)} />
          <Print v={v} mark={mark} c={c} c2={c2} x={200} y={244} big={v === 1 || v === 2 || v === 3} />
          <path d="M126 340 L274 340 L298 410 L102 410 Z" fill="none" stroke={dk} strokeWidth={2} opacity={0.65} />
          <path d="M126 340 L112 380 M274 340 L288 380" stroke={dk} strokeWidth={1.6} opacity={0.5} />
        </>
      )}
      <path d="M94 420 Q200 436 306 420" stroke={dk} strokeWidth={9} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M32 326 L78 336" stroke={dk} strokeWidth={9} opacity={0.6} strokeLinecap="round" />
      <path d="M368 326 L322 336" stroke={dk} strokeWidth={9} opacity={0.6} strokeLinecap="round" />
      <Seam d="M96 206 C94 170 88 150 78 130" color={dk} />
      <Seam d="M304 206 C306 170 312 150 322 130" color={dk} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* JACKETS (trucker / bomber)                                           */
/* ------------------------------------------------------------------ */
export function Trucker({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.28), dk2 = darken(c, 0.5), lt = lighten(c, 0.2);
  const back = view === "back";
  const body = "M146 78 L200 96 L254 78 L326 102 L366 304 L324 314 L304 194 L308 400 Q200 414 92 400 L96 194 L76 314 L34 304 L74 102 Z";
  const thread = c2;
  return (
    <g>
      <Part d={body} fill={c} uid={uid} fab={fab} />
      {v === 2 && <path d="M34 304 L74 102 L146 78 L100 200 Z" fill={lighten(c, 0.12)} opacity={0.35} />}
      <Seam d="M96 194 C94 160 86 128 74 102" color={dk} />
      <Seam d="M304 194 C306 160 314 128 326 102" color={dk} />
      {back ? (
        <>
          <path d="M96 140 Q200 172 304 140" stroke={dk} strokeWidth={2.2} fill="none" />
          <Stitch d="M96 148 Q200 180 304 148" color={thread} />
          <path d="M200 160 V400" stroke={dk} strokeWidth={2.2} />
          <path d="M150 78 L200 90 L250 78 L242 62 Q200 74 158 62Z" fill={lt} />
          <path d="M96 340 H304" stroke={dk} strokeWidth={2} />
          <Stitch d="M96 348 H304" color={thread} />
        </>
      ) : (
        <>
          <path d="M146 76 L200 98 L172 142 L124 96 Z" fill={lt} stroke={dk} strokeWidth={1.6} />
          <path d="M254 76 L200 98 L228 142 L276 96 Z" fill={lighten(c, 0.26)} stroke={dk} strokeWidth={1.6} />
          <Stitch d="M146 84 L196 104 M254 84 L204 104" color={thread} w={1.4} />
          <path d="M200 98 V404" stroke={dk} strokeWidth={2.4} />
          <path d="M172 142 L162 400 M228 142 L238 400" stroke={dk} strokeWidth={2} opacity={0.55} />
          <Stitch d="M166 150 L157 398 M234 150 L243 398" color={thread} w={1.4} />
          <path d="M104 178 Q200 206 296 178" stroke={dk} strokeWidth={2} fill="none" opacity={0.6} />
          <g>
            <path d="M112 200 h58 v44 l-29 14 l-29 -14Z" fill={lighten(c, 0.08)} stroke={dk} strokeWidth={1.8} />
            <path d="M230 200 h58 v44 l-29 14 l-29 -14Z" fill={lighten(c, 0.08)} stroke={dk} strokeWidth={1.8} />
            <circle cx={141} cy={226} r={4.5} fill={thread} stroke={dk2} strokeWidth={1} />
            <circle cx={259} cy={226} r={4.5} fill={thread} stroke={dk2} strokeWidth={1} />
          </g>
          {[128, 170, 212, 254, 296, 338, 380].map((y) => (<circle key={y} cx={200} cy={y} r={4.8} fill={thread} stroke={dk2} strokeWidth={1} />)).slice(0, 7)}
        </>
      )}
      <path d="M34 304 L76 314" stroke={dk} strokeWidth={7} opacity={0.6} />
      <path d="M366 304 L324 314" stroke={dk} strokeWidth={7} opacity={0.6} />
      <path d="M96 388 Q200 402 304 388" stroke={dk} strokeWidth={6} fill="none" opacity={0.55} />
    </g>
  );
}

export function Bomber({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.55);
  const back = view === "back";
  const body = "M158 92 C176 116 224 116 242 92 L326 116 L364 308 L318 318 L304 204 L308 416 Q200 430 92 416 L96 204 L82 318 L36 308 L74 116 Z";
  const rib = darken(c, 0.12);
  return (
    <g>
      <Part d={body} fill={c} uid={uid} fab={fab} />
      <Seam d="M96 204 C94 170 86 140 74 116" color={dk} />
      <Seam d="M304 204 C306 170 314 140 326 116" color={dk} />
      <path d="M150 86 C170 122 230 122 250 86 L262 96 C240 138 160 138 138 96Z" fill={rib} />
      <path d="M150 86 C170 122 230 122 250 86 L262 96 C240 138 160 138 138 96Z" fill={`url(#${uid}-tex-knit)`} />
      {!back && (
        <>
          <path d="M200 124 V418" stroke={dk2} strokeWidth={3} />
          <path d="M204 126 V416" stroke={c2} strokeWidth={1.4} strokeDasharray="2 3" opacity={0.7} />
          <rect x={195} y={128} width={10} height={20} rx={2} fill={c2} stroke={dk2} strokeWidth={1} />
          <path d="M116 224 L156 224" stroke={dk2} strokeWidth={2} opacity={0.6} />
          <path d="M284 224 L244 224" stroke={dk2} strokeWidth={2} opacity={0.6} />
          {v === 1 && <path d="M110 250 H170 M230 250 H290" stroke={dk2} strokeWidth={2} opacity={0.5} />}
          <path d="M338 210 v70" stroke={c2} strokeWidth={2.5} opacity={0.7} />
        </>
      )}
      {back && <path d="M200 140 V416" stroke={dk} strokeWidth={2} opacity={0.4} />}
      <path d="M36 308 L82 318" stroke={rib} strokeWidth={13} strokeLinecap="butt" />
      <path d="M364 308 L318 318" stroke={rib} strokeWidth={13} />
      <path d="M92 408 Q200 422 308 408" stroke={rib} strokeWidth={16} fill="none" />
      <path d="M92 408 Q200 422 308 408" stroke={`url(#${uid}-tex-knit)`} strokeWidth={16} fill="none" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* PUFFER                                                               */
/* ------------------------------------------------------------------ */
export function Puffer({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.35), dk2 = darken(c, 0.55);
  const back = view === "back";
  const body = "M150 76 L250 76 L268 100 L332 122 L368 316 L320 328 L306 214 L312 420 Q200 438 88 420 L94 214 L80 328 L32 316 L68 122 L132 100 Z";
  const rows = [150, 196, 242, 288, 334, 380];
  return (
    <g>
      <Part d={body} fill={c} uid={uid} fab={fab === "denim" ? "plain" : fab} />
      {rows.map((y, i) => (
        <path key={y} d={`M94 ${y} Q200 ${y + 16} 306 ${y}`} fill="none" stroke={dk} strokeWidth={3} opacity={0.6} />
      ))}
      {rows.map((y) => (
        <path key={"h" + y} d={`M94 ${y - 2} Q200 ${y + 14} 306 ${y - 2}`} fill="none" stroke={lighten(c, 0.35)} strokeWidth={1.4} opacity={0.35} />
      ))}
      {[[60, 150], [50, 210], [44, 270]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} l34 -10`} stroke={dk} strokeWidth={3} opacity={0.55} />
      ))}
      {[[340, 150], [350, 210], [356, 270]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} l-34 -10`} stroke={dk} strokeWidth={3} opacity={0.55} />
      ))}
      <Seam d="M94 214 C90 180 80 150 68 122" color={dk} />
      <Seam d="M306 214 C310 180 320 150 332 122" color={dk} />
      <path d="M148 76 H252 L268 100 Q200 122 132 100 Z" fill={darken(c, 0.15)} stroke={dk} strokeWidth={1.4} />
      <path d="M200 120 V424" stroke={dk2} strokeWidth={3} opacity={back ? 0.35 : 1} />
      {!back && (
        <>
          <rect x={195} y={112} width={10} height={22} rx={3} fill={c2} stroke={dk2} strokeWidth={1} />
          {v === 2 && <Print v={1} mark="" c={c} c2={c2} x={252} y={190} />}
          <path d="M110 330 l40 2 M290 330 l-40 2" stroke={dk2} strokeWidth={3} opacity={0.7} strokeLinecap="round" />
        </>
      )}
      <path d="M32 316 L80 328" stroke={dk} strokeWidth={10} opacity={0.7} />
      <path d="M368 316 L320 328" stroke={dk} strokeWidth={10} opacity={0.7} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* JEANS                                                                */
/* ------------------------------------------------------------------ */
export function Jeans({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.5);
  const thread = c2;
  const back = view === "back";
  const legs = "M114 78 L286 78 L310 458 L212 458 L200 210 L188 458 L90 458 Z";
  return (
    <g>
      <Part d={legs} fill={c} uid={uid} fab={fab} />
      {/* fading */}
      <path d="M116 200 Q130 300 116 380 Q140 340 150 260 Z" fill={lighten(c, 0.18)} opacity={0.32} />
      <path d="M284 200 Q270 300 284 380 Q260 340 250 260 Z" fill={lighten(c, 0.18)} opacity={0.32} />
      {v === 2 && <path d="M120 250 l20 10 M120 270 l24 8 M280 250 l-20 10 M280 270 l-24 8" stroke={lighten(c, 0.5)} strokeWidth={2} opacity={0.5} />}
      {v === 4 && <path d="M90 458 L114 78 M310 458 L286 78" stroke={dk} strokeWidth={0} />}
      <path d="M114 78 L286 78 L288 46 L112 46 Z" fill={darken(c, 0.1)} />
      <path d="M114 78 L286 78 L288 46 L112 46 Z" fill={`url(#${uid}-shade)`} />
      <Stitch d="M113 72 H287 M113 52 H287" color={thread} w={1.4} />
      {[124, 198, 268].map((x) => (<rect key={x} x={x} y={40} width={10} height={40} rx={2} fill={darken(c, 0.15)} stroke={dk} strokeWidth={1} opacity={0.9} />))}
      {back ? (
        <>
          <path d="M114 100 Q200 140 286 100" stroke={dk} strokeWidth={2} fill="none" />
          <Stitch d="M114 108 Q200 148 286 108" color={thread} />
          <path d="M200 100 V210" stroke={dk} strokeWidth={2} />
          {[[130, 156], [216, 156]].map(([x, y]) => (
            <g key={x}>
              <path d={`M${x} ${y} h56 v66 l-28 22 l-28 -22 Z`} fill="none" stroke={dk} strokeWidth={1.8} />
              <path d={`M${x + 6} ${y + 14} q22 26 44 0`} fill="none" stroke={thread} strokeWidth={2.4} opacity={0.9} />
            </g>
          ))}
          <rect x={185} y={54} width={30} height={18} rx={2} fill="#c4a67a" opacity={0.9} />
          <path d="M191 63 h18" stroke="#6b4e2a" strokeWidth={1.4} />
        </>
      ) : (
        <>
          <path d="M200 78 V210" stroke={dk} strokeWidth={2} opacity={0.7} />
          <Stitch d="M206 86 V180 Q206 196 188 196" color={thread} />
          <path d="M116 86 Q160 92 168 158" fill="none" stroke={dk} strokeWidth={2} />
          <path d="M284 86 Q240 92 232 158" fill="none" stroke={dk} strokeWidth={2} />
          <Stitch d="M118 92 Q158 98 163 152 M282 92 Q242 98 237 152" color={thread} w={1.4} />
          <circle cx={200} cy={58} r={9} fill={thread} stroke={dk2} strokeWidth={1.5} />
          <circle cx={200} cy={58} r={4} fill={dk2} opacity={0.6} />
          <circle cx={130} cy={100} r={3.4} fill={thread} stroke={dk2} strokeWidth={0.8} />
          <circle cx={270} cy={100} r={3.4} fill={thread} stroke={dk2} strokeWidth={0.8} />
        </>
      )}
      <path d="M200 210 L188 458 M200 210 L212 458" stroke={dk} strokeWidth={2} opacity={0.6} />
      <Stitch d="M92 440 L188 440 M212 440 L308 440" color={thread} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* SNEAKER / BOOT                                                       */
/* ------------------------------------------------------------------ */
export function Sneaker({ c, c2, v, view, uid }: GarmentProps) {
  const dk = darken(c, 0.32), dk2 = darken(c, 0.58);
  const flip = view === "back";
  const hi = v === 4;
  const sole = v === 3 ? "#e9e2d0" : v === 1 ? "#cdb88a" : "#ebe6d9";
  const soleDark = darken(sole, 0.3);
  const upper = hi
    ? "M66 322 L62 200 C60 160 74 136 96 130 C112 126 130 130 148 134 C156 136 158 146 160 156 C168 150 190 150 198 156 C222 186 254 214 292 230 C332 244 366 268 376 302 C382 316 378 322 366 322 Z"
    : "M66 322 L62 252 C60 228 70 210 88 204 C104 200 116 206 130 210 C142 212 150 200 158 184 L172 156 C178 148 190 148 198 156 C222 186 254 214 292 230 C332 244 366 268 376 302 C382 316 378 322 366 322 Z";
  const laceYOffset = hi ? 0 : 0;
  return (
    <g transform={`${flip ? "translate(400 0) scale(-1 1) " : ""}translate(0 34.6) scale(1 0.9)`}>
      <Part d={upper} fill={c} uid={uid} tex={false} />
      {/* side panel / mudguard */}
      {v !== 3 && v !== 5 && v !== 1 && (
        <path d="M68 322 L64 268 C104 254 150 262 190 284 C224 302 268 314 318 322 Z" fill={c2} opacity={0.94} />
      )}
      {v === 1 && (
        <g>
          <path d="M68 322 L64 262 C100 254 146 268 186 288 C220 304 262 316 316 322 Z" fill={darken(c, 0.14)} />
          <path d="M150 268 C190 276 236 292 276 314" stroke={c2} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
        </g>
      )}
      {v === 3 && <path d="M74 300 C120 262 176 268 220 296 C262 320 320 318 364 300" stroke={c2} strokeWidth={10} fill="none" strokeLinecap="round" />}
      {v === 5 && <path d="M70 296 C130 276 220 300 340 300" stroke={c2} strokeWidth={4} fill="none" opacity={0.9} />}
      {/* toe cap */}
      <path d="M300 236 C338 250 368 276 378 306 C380 316 376 322 366 322 L330 322 C328 292 318 264 292 244 Z" fill={v === 2 || v === 1 ? c2 : darken(c, 0.12)} opacity={0.96} />
      {v === 2 && Array.from({ length: 9 }).map((_, i) => (<circle key={i} cx={322 + (i % 3) * 11 - Math.floor(i / 3) * 3} cy={272 + Math.floor(i / 3) * 12} r={2} fill={darken(c, 0.5)} opacity={0.65} />))}
      {/* collar lining */}
      <path d={hi ? "M96 130 C112 126 130 130 148 134 C156 136 158 146 160 156 L150 170 C140 150 116 146 96 150 Z" : "M88 204 C104 200 116 206 130 210 C142 212 150 200 158 184 L152 200 C144 220 128 226 112 220 C100 216 92 218 84 226 Z"} fill={dk2} />
      {/* tongue */}
      <path d="M158 184 L172 156 C178 148 190 148 198 156 L190 178 L172 194 Z" fill={lighten(c, 0.14)} stroke={dk} strokeWidth={1.2} />
      {/* laces */}
      {[0, 1, 2, 3, 4].map((i) => {
        const t = 0.1 + i * 0.19;
        const x = 192 + 100 * t, y = 154 + 76 * t + laceYOffset;
        return (
          <g key={i}>
            <path d={`M${x - 3} ${y + 1} l-14 18`} stroke={lighten(c, 0.6)} strokeWidth={4.6} strokeLinecap="round" />
            <circle cx={x - 17} cy={y + 19} r={2.4} fill={dk2} />
          </g>
        );
      })}
      {/* heel tab */}
      <path d={hi ? "M62 210 L62 322 L88 322 L90 214 Z" : "M62 256 C62 236 72 220 88 214 L90 268 L64 270 Z"} fill={c2} opacity={0.4} />
      {hi && <circle cx={100} cy={196} r={13} fill="none" stroke={c2} strokeWidth={4} opacity={0.9} />}
      <Stitch d="M72 300 C100 290 140 296 176 312" color={dk2} w={1.3} />
      {/* midsole + outsole */}
      <path d="M50 336 C50 324 60 319 72 319 L338 319 C368 319 386 328 388 340 C388 350 378 352 366 352 L72 352 C58 352 50 348 50 336 Z" fill={sole} />
      <path d="M50 336 C50 324 60 319 72 319 L338 319 C368 319 386 328 388 340 C388 350 378 352 366 352 L72 352 C58 352 50 348 50 336 Z" fill={`url(#${uid}-shade)`} />
      <path d="M54 334 L386 334" stroke={soleDark} strokeWidth={1.4} opacity={0.5} />
      <path d="M56 352 Q210 358 382 350" stroke={v === 1 ? "#a77b4c" : "#2a2925"} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.92} />
      {v === 3 && Array.from({ length: 24 }).map((_, i) => (<path key={i} d={`M${70 + i * 13} 322 v26`} stroke={soleDark} strokeWidth={1} opacity={0.3} />))}
    </g>
  );
}

export function Boot({ c, c2, v, view, uid }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.55);
  const flip = view === "back";
  const upper = "M96 328 L98 110 C98 98 108 92 120 92 L206 92 C218 92 222 102 222 114 L226 202 C246 218 304 228 344 262 C376 288 382 320 370 328 Z";
  return (
    <g transform={flip ? "translate(400 0) scale(-1 1)" : undefined}>
      <Part d={upper} fill={c} uid={uid} tex={false} />
      <path d="M98 118 H222 L224 140 H98 Z" fill={darken(c, 0.15)} />
      <Stitch d="M100 128 H222" color={c2} w={1.6} />
      {v === 1 && <path d="M100 176 H226" stroke={c2} strokeWidth={5} />}
      <path d="M150 92 L210 92 L218 210 L156 216 Z" fill={lighten(c, 0.1)} opacity={0.35} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <circle cx={166 + i * 4} cy={124 + i * 15} r={3.2} fill={i < 3 ? darken(c, 0.5) : dk2} stroke={c2} strokeWidth={0.8} />
          <circle cx={208 + i * 2} cy={124 + i * 16} r={3.2} fill={dk2} stroke={c2} strokeWidth={0.8} />
          <path d={`M${168 + i * 4} ${124 + i * 15} L${208 + i * 2} ${124 + i * 16}`} stroke={v === 1 ? c2 : lighten(c, 0.5)} strokeWidth={3.4} strokeLinecap="round" />
        </g>
      ))}
      <path d="M100 250 C170 236 230 246 300 290" stroke={dk} strokeWidth={2} fill="none" opacity={0.6} />
      <Stitch d="M104 260 C172 246 228 256 292 296" color={c2} w={1.5} />
      <path d="M96 298 H340" stroke={dk} strokeWidth={1.4} opacity={0.4} />
      <path d="M52 346 C52 328 66 322 84 322 L332 322 C370 322 388 332 388 346 C388 360 372 366 352 366 L80 366 C62 366 52 360 52 346 Z" fill="#e2d6bd" />
      <path d="M52 346 C52 328 66 322 84 322 L332 322 C370 322 388 332 388 346 C388 360 372 366 352 366 L80 366 C62 366 52 360 52 346 Z" fill={`url(#${uid}-shade)`} />
      <path d="M58 358 L384 358" stroke="#3a3429" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
      <path d="M96 322 L98 344" stroke={dk2} strokeWidth={0} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* CAP                                                                  */
/* ------------------------------------------------------------------ */
export function Cap({ c, c2, v, mark, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.5);
  const ink = luminance(c2) > 0.4 || luminance(c) < 0.3 ? c2 : inkFor(c);
  const brimC = v === 2 ? c2 : darken(c, 0.14);
  return (
    <g transform="translate(-34 22)">
      {/* brim */}
      <path d="M296 282 C334 276 378 288 402 316 C404 326 394 330 382 328 C346 322 316 320 296 320 Z" fill={brimC} />
      <path d="M296 282 C334 276 378 288 402 316 C404 326 394 330 382 328 C346 322 316 320 296 320 Z" fill={`url(#${uid}-shade)`} />
      <path d="M300 296 C336 292 372 302 394 320" stroke={dk2} strokeWidth={1.4} fill="none" opacity={0.55} />
      <Stitch d="M304 308 C338 304 366 312 388 324" color={dk2} w={1.1} />
      {/* crown */}
      <Part d="M88 302 C80 194 132 130 206 126 C264 124 304 160 312 232 L312 302 Z" fill={c} uid={uid} fab={fab === "denim" ? "plain" : fab} />
      <path d="M206 126 C190 180 186 250 190 302 M206 126 C240 172 262 232 264 302" stroke={dk} strokeWidth={2} fill="none" opacity={0.55} />
      <path d="M206 126 C284 130 306 196 312 262" stroke={dk} strokeWidth={1.6} fill="none" opacity={0.4} />
      <circle cx={206} cy={126} r={8} fill={darken(c, 0.12)} stroke={dk2} strokeWidth={1.2} />
      <circle cx={162} cy={158} r={3.2} fill={dk2} opacity={0.7} />
      {/* headband */}
      <path d="M88 288 H312 V304 H88 Z" fill={dk2} opacity={0.55} />
      {/* strap at back */}
      <path d="M90 262 L70 268 L70 296 L92 300 Z" fill={darken(c, 0.2)} stroke={dk2} strokeWidth={1.2} />
      <rect x={72} y={272} width={12} height={16} rx={2} fill={c2} opacity={0.9} />
      {/* front mark */}
      {v === 0 || v === 1 ? (
        <text x={266} y={236} textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight={800} fontSize={mark && mark.length > 2 ? 20 : 36} letterSpacing={2} fill={ink} opacity={0.95}>{mark || "N"}</text>
      ) : v === 2 ? (
        <path d="M244 236 h44 M256 220 v32 M276 220 v32" stroke={ink} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <path d="M244 246 q22 -40 44 0" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* BAGS                                                                 */
/* ------------------------------------------------------------------ */
export function Cross({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.55);
  const back = view === "back";
  return (
    <g>
      <path d="M116 196 C114 74 286 74 284 196" fill="none" stroke={dk} strokeWidth={22} strokeLinecap="round" />
      <path d="M116 196 C114 74 286 74 284 196" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" />
      <path d="M116 196 C114 74 286 74 284 196" fill="none" stroke={`url(#${uid}-shade)`} strokeWidth={16} strokeLinecap="round" />
      <path d="M116 196 C114 80 286 80 284 196" fill="none" stroke={c2} strokeWidth={1.4} strokeDasharray="4 3" opacity={0.7} />
      <Part d="M90 196 Q90 178 108 178 L292 178 Q310 178 310 196 L310 356 Q310 376 290 376 L110 376 Q90 376 90 356 Z" fill={c} uid={uid} fab={fab} />
      <Part d="M90 200 Q90 178 112 178 L288 178 Q310 178 310 200 L310 262 Q200 306 90 262 Z" fill={darken(c, 0.06)} uid={uid} fab={fab} />
      <path d="M96 258 Q200 300 304 258" stroke={dk} strokeWidth={2} fill="none" opacity={0.55} />
      <Stitch d="M100 250 Q200 292 300 250" color={c2} />
      {v === 1 ? (
        <>
          <path d="M104 296 H296" stroke={dk2} strokeWidth={3} opacity={0.6} />
          <rect x={190} y={286} width={20} height={14} rx={3} fill={c2} stroke={dk2} strokeWidth={1} />
        </>
      ) : (
        <>
          <rect x={184} y={252} width={32} height={30} rx={7} fill={c2} stroke={dk2} strokeWidth={1.5} />
          <circle cx={200} cy={267} r={5} fill={dk2} opacity={0.8} />
        </>
      )}
      {back && <path d="M110 300 H290" stroke={dk} strokeWidth={2} opacity={0.4} />}
      <circle cx={112} cy={192} r={6} fill={c2} stroke={dk2} strokeWidth={1} />
      <circle cx={288} cy={192} r={6} fill={c2} stroke={dk2} strokeWidth={1} />
    </g>
  );
}

export function Tote({ c, c2, v, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3);
  return (
    <g>
      <path d="M124 214 C122 90 278 90 276 214" fill="none" stroke={dk} strokeWidth={20} strokeLinecap="round" />
      <path d="M124 214 C122 90 278 90 276 214" fill="none" stroke={c === "#f0e9d8" ? darken(c, 0.08) : lighten(c, 0.06)} strokeWidth={15} strokeLinecap="round" />
      <Part d="M78 204 L322 204 L342 436 L58 436 Z" fill={c} uid={uid} fab={fab} />
      <path d="M78 204 L322 204" stroke={dk} strokeWidth={3} opacity={0.5} />
      <Stitch d="M84 216 H316" color={c2} w={1.4} />
      <path d="M58 436 L342 436" stroke={dk} strokeWidth={4} opacity={0.4} />
      <path d="M110 204 v20 M290 204 v20" stroke={dk} strokeWidth={3} opacity={0.4} />
      {v === 0 ? (
        <text x={200} y={330} textAnchor="middle" fontFamily="Inter Variable, sans-serif" fontWeight={800} fontSize={34} letterSpacing={6} fill={c2} opacity={0.85}>ATELIER</text>
      ) : (
        <g fill="none" stroke={c2} strokeWidth={5} opacity={0.85}><circle cx={200} cy={318} r={34} /><path d="M160 318 h80" /></g>
      )}
    </g>
  );
}

export function Pack({ c, c2, v, view, uid, fab }: GarmentProps) {
  const dk = darken(c, 0.3), dk2 = darken(c, 0.55);
  const back = view === "back";
  return (
    <g>
      <path d="M170 124 C170 84 230 84 230 124" fill="none" stroke={dk} strokeWidth={10} strokeLinecap="round" />
      <Part d="M104 140 C104 96 296 96 296 140 L306 424 Q200 446 94 424 Z" fill={c} uid={uid} fab={fab === "denim" ? "plain" : fab} />
      <path d="M106 150 Q200 176 294 150" stroke={dk} strokeWidth={2} fill="none" opacity={0.6} />
      <Part d="M120 296 L280 296 L286 404 Q200 420 114 404 Z" fill={darken(c, 0.08)} uid={uid} fab={fab === "denim" ? "plain" : fab} />
      <path d="M120 296 Q200 316 280 296" stroke={dk} strokeWidth={2} fill="none" opacity={0.55} />
      <Stitch d="M124 306 Q200 326 276 306" color={c2} w={1.3} />
      <path d="M130 174 Q200 196 270 174" stroke={dk2} strokeWidth={3} fill="none" opacity={0.7} />
      <rect x={192} y={170} width={16} height={22} rx={4} fill={c2} stroke={dk2} strokeWidth={1} />
      <path d="M200 196 V232" stroke={c2} strokeWidth={4} />
      <path d="M200 296 v14" stroke={dk2} strokeWidth={4} />
      {v === 1 && <rect x={150} y={232} width={100} height={30} rx={5} fill={c2} opacity={0.85} />}
      {back && <><path d="M150 150 C140 260 140 340 150 420 M250 150 C260 260 260 340 250 420" stroke={dk} strokeWidth={26} fill="none" opacity={0.6} strokeLinecap="round" /></>}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* ACCESSORIES                                                          */
/* ------------------------------------------------------------------ */
export function Sunglasses({ c, c2, uid }: GarmentProps) {
  const dk = darken(c, 0.35);
  const lens = "M76 240 L184 240 C190 292 162 326 130 326 C98 326 70 292 76 240 Z";
  return (
    <g>
      <path d="M76 246 L40 232 L34 246" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M324 246 L360 232 L366 246" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M182 254 Q200 236 218 254" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" />
      {[0, 1].map((k) => (
        <g key={k} transform={k ? "translate(400 0) scale(-1 1)" : undefined}>
          <path d={lens} fill="#1d2a2a" stroke={c} strokeWidth={13} strokeLinejoin="round" />
          <path d={lens} fill={`url(#${uid}-lens)`} />
          <path d="M92 252 L128 252 L100 300 Z" fill="#fff" opacity={0.18} />
        </g>
      ))}
      <path d="M76 244 H184 M216 244 H324" stroke={lighten(c, 0.3)} strokeWidth={2} opacity={0.35} />
      <circle cx={70} cy={246} r={4} fill={c2} /><circle cx={330} cy={246} r={4} fill={c2} />
      <rect x={0} y={0} width={0} height={0} fill={dk} />
    </g>
  );
}

export function Belt({ c, c2, uid }: GarmentProps) {
  const dk = darken(c, 0.32);
  return (
    <g transform="rotate(-6 200 250)">
      <Part d="M96 232 H372 Q384 232 384 246 V266 Q384 280 372 280 H96 Z" fill={c} uid={uid} tex={false} />
      <path d="M96 240 H384 M96 272 H384" stroke={dk} strokeWidth={1.4} strokeDasharray="4 3" opacity={0.7} />
      {[170, 200, 230, 260, 290, 320].map((x) => (<circle key={x} cx={x} cy={256} r={5.4} fill={darken(c, 0.55)} stroke={dk} strokeWidth={1} />))}
      <path d="M384 246 L366 256 L384 266 Z" fill={darken(c, 0.15)} />
      <rect x={24} y={206} width={90} height={100} rx={12} fill="none" stroke={c2} strokeWidth={13} />
      <rect x={24} y={206} width={90} height={100} rx={12} fill="none" stroke={`url(#${uid}-shade)`} strokeWidth={13} />
      <path d="M62 256 H150" stroke={c2} strokeWidth={7} strokeLinecap="round" />
      <rect x={130} y={228} width={26} height={56} rx={6} fill={darken(c, 0.15)} stroke={dk} strokeWidth={1.4} />
    </g>
  );
}

export function Watch({ c, c2, uid }: GarmentProps) {
  const dk = darken(c, 0.3);
  const ticks = Array.from({ length: 12 });
  return (
    <g>
      <Part d="M162 30 L238 30 L246 170 L154 170 Z" fill={c} uid={uid} tex={false} />
      <Part d="M154 330 L246 330 L238 470 L162 470 Z" fill={c} uid={uid} tex={false} />
      {[52, 72, 92].map((y) => (<circle key={y} cx={200} cy={y + 340} r={4.4} fill={dk} opacity={0.8} />))}
      <Stitch d="M166 40 L172 166 M234 40 L228 166" color={darken(c, 0.5)} w={1.2} />
      <circle cx={200} cy={250} r={96} fill="#b9b4a8" />
      <circle cx={200} cy={250} r={96} fill={`url(#${uid}-shade)`} />
      <circle cx={200} cy={250} r={82} fill={c2} stroke="#8d887d" strokeWidth={3} />
      {ticks.map((_, i) => {
        const a = (i * Math.PI) / 6;
        return <path key={i} d={`M${200 + Math.sin(a) * 68} ${250 - Math.cos(a) * 68} L${200 + Math.sin(a) * (i % 3 === 0 ? 56 : 62)} ${250 - Math.cos(a) * (i % 3 === 0 ? 56 : 62)}`} stroke="#2a2925" strokeWidth={i % 3 === 0 ? 4 : 2} strokeLinecap="round" />;
      })}
      <path d="M200 250 L200 204" stroke="#2a2925" strokeWidth={5} strokeLinecap="round" />
      <path d="M200 250 L232 268" stroke="#2a2925" strokeWidth={4} strokeLinecap="round" />
      <path d="M200 250 L176 198" stroke="#a63a2b" strokeWidth={1.6} />
      <circle cx={200} cy={250} r={5} fill="#2a2925" />
      <rect x={294} y={244} width={14} height={12} rx={3} fill="#a7a296" />
    </g>
  );
}

export const GARMENTS = {
  tee: Tee, shirt: Shirt, hoodie: Hoodie, trucker: Trucker, bomber: Bomber, puffer: Puffer, jeans: Jeans,
  sneaker: Sneaker, boot: Boot, cap: Cap, tote: Tote, cross: Cross, pack: Pack, sunglasses: Sunglasses, belt: Belt, watch: Watch,
} as const satisfies Record<string, (p: GarmentProps) => ReactNode>;
