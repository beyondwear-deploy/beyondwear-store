import { BarChart3, LayoutDashboard, PenSquare, Receipt } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdmin } from "@/lib/adminAuth";
import { siteConfig } from "@/lib/config";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/analytics", label: "Traffic", icon: BarChart3 },
  { href: "/admin/content", label: "Edit content", icon: PenSquare },
] as const;

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-soft">
      <header className="sticky top-0 z-20 border-b border-line bg-elev/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold uppercase tracking-tight">{siteConfig.brand.name}</span>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Admin</span>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-soft hover:text-fg">
                <n.icon className="size-4" aria-hidden />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-medium text-subtle hover:text-fg" target="_blank">View site ↗</Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-5 py-1.5 sm:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-soft hover:text-fg">
              <n.icon className="size-3.5" aria-hidden />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
