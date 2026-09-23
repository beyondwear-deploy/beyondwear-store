import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { Button } from "./Button";

interface Action { label: string; href?: string; onClick?: () => void; variant?: "primary" | "outline" | "accent" }

export function EmptyState({
  icon: Icon, title, message, primary, secondary, tone = "neutral", className, children,
}: {
  icon: LucideIcon; title: string; message: string; primary?: Action; secondary?: Action; tone?: "neutral" | "danger"; className?: string; children?: ReactNode;
}) {
  return (
    <div role={tone === "danger" ? "alert" : undefined} className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center", className)}>
      <div className={cn("mb-6 grid size-20 place-items-center rounded-full", tone === "danger" ? "bg-danger-soft text-danger" : "bg-soft text-fg")}>
        <Icon className="size-8" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
      {children}
      {(primary || secondary) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {primary && (primary.href ? <Button href={primary.href} variant={primary.variant ?? "primary"} arrow>{primary.label}</Button> : <Button onClick={primary.onClick} variant={primary.variant ?? "primary"}>{primary.label}</Button>)}
          {secondary && (secondary.href ? <Button href={secondary.href} variant="outline">{secondary.label}</Button> : <Button onClick={secondary.onClick} variant="outline">{secondary.label}</Button>)}
        </div>
      )}
    </div>
  );
}
