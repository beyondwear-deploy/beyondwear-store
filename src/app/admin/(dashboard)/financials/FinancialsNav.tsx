"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

const TABS = [
  { href: "/admin/financials", label: "Overview" },
  { href: "/admin/financials/pnl", label: "P&L" },
  { href: "/admin/financials/balance-sheet", label: "Balance sheet" },
  { href: "/admin/financials/cash-flow", label: "Cash flow" },
  { href: "/admin/financials/inventory", label: "Inventory" },
  { href: "/admin/financials/expenses", label: "Expenses" },
  { href: "/admin/financials/settings", label: "Settings" },
];

export function FinancialsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1.5 overflow-x-auto border-b border-line pb-3">
      {TABS.map((t) => {
        const active = t.href === "/admin/financials" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href} href={t.href}
            className={cn("shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition", active ? "bg-accent text-accent-fg" : "text-muted hover:bg-soft hover:text-fg")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
