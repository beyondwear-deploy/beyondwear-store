"use client";
import { useState } from "react";
import { cn } from "@/lib/format";

const TABS = ["Adults", "Kids", "Clothing"] as const;
type Tab = (typeof TABS)[number];

const Table = ({ head, rows }: { head: string[]; rows: (string | number)[][] }) => (
  <div className="overflow-x-auto rounded-2xl border border-line">
    <table className="w-full min-w-[420px] text-left text-sm">
      <caption className="sr-only">Size chart</caption>
      <thead className="bg-soft text-[11px] uppercase tracking-[0.12em] text-muted"><tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">
        {rows.map((r, i) => (<tr key={i} className="hover:bg-soft/60">{r.map((c, j) => (j === 0 ? <th key={j} scope="row" className="px-4 py-3 font-semibold">{c}</th> : <td key={j} className="px-4 py-3 tabular-nums text-muted">{c}</td>))}</tr>))}
      </tbody>
    </table>
  </div>
);

export function SizeGuideContent() {
  const [tab, setTab] = useState<Tab>("Adults");
  return (
    <div>
      <div role="tablist" aria-label="Size guide categories" className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
        {TABS.map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition", tab === t ? "bg-fg text-bg" : "border border-line-strong hover:bg-soft")}>{t}</button>
        ))}
      </div>
      <div role="tabpanel" className="space-y-4">
        {tab === "Adults" && (<>
          <Table head={["UK", "EU", "US (men's)", "US (women's)", "Foot length"]} rows={[[3, 36, 4, 5.5, "22.5 cm"], [4, 37, 5, 6.5, "23.3 cm"], [5, 38, 6, 7.5, "24.0 cm"], [6, 39.5, 7, 8.5, "24.8 cm"], [7, 41, 8, 9.5, "25.7 cm"], [8, 42, 9, 10.5, "26.5 cm"], [9, 43, 10, 11.5, "27.3 cm"], [10, 44.5, 11, 12.5, "28.2 cm"], [11, 46, 12, 13.5, "29.0 cm"]]} />
          <p className="text-xs text-muted">Brands vary by up to half a size. We list the insole length of every pair so you can compare it with a pair you already own.</p>
        </>)}
        {tab === "Kids" && (<>
          <Table head={["UK (youth)", "EU", "US (youth)", "Foot length"]} rows={[[1, 33, 1.5, "20.5 cm"], [2, 34, 2.5, "21.3 cm"], [3, 35.5, 3.5, "22.2 cm"], [4, 37, 4.5, "23.0 cm"]]} />
          <p className="text-xs text-muted">Kids grow fast — if between sizes, size up for longer wear.</p>
        </>)}
        {tab === "Clothing" && (
          <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em]">Coming soon</p>
            <p className="mt-2 text-sm text-muted">Clothing size charts will appear here when jackets, tops and jeans launch.</p>
          </div>
        )}
        <div className="rounded-2xl bg-soft p-5 text-sm">
          <h3 className="mb-2 !font-sans text-sm font-bold !tracking-normal">How to measure your foot</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>Stand on a sheet of paper against a wall and mark the tip of your longest toe.</li>
            <li><strong className="text-fg">Foot length:</strong> measure from the wall to the mark, in cm.</li>
            <li>Compare it with the <strong className="text-fg">insole length</strong> on the product page — not the size on the label.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
