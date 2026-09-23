"use client";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";

type Variant = "primary" | "accent" | "outline" | "ghost" | "secondary" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold uppercase tracking-[0.09em] transition-all duration-300 ease-[var(--ease)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 select-none";
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-6 text-xs",
  lg: "h-14 px-8 text-[13px]",
};
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:-translate-y-0.5 hover:shadow-lift",
  accent: "bg-accent text-accent-fg hover:-translate-y-0.5 hover:shadow-lift hover:brightness-110",
  outline: "border border-line-strong text-fg hover:border-fg hover:bg-fg hover:text-bg",
  ghost: "text-fg hover:bg-soft",
  secondary: "bg-soft text-fg hover:bg-line",
  inverse: "bg-inverse-fg text-inverse hover:-translate-y-0.5 hover:shadow-lift",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}
type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & { href: string; onClick?: () => void; "aria-label"?: string; target?: string; rel?: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkProps>(function Button(props, ref) {
  const { variant = "primary", size = "md", arrow, loading, full, icon, className, children, ...rest } = props as CommonProps & Record<string, unknown>;
  const cls = cn(base, sizes[size], variants[variant], full && "w-full", className as string);
  const inner = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      <span>{children}</span>
      {arrow && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />}
    </>
  );
  if ("href" in rest && rest.href) {
    const { href, ...a } = rest as { href: string } & Record<string, unknown>;
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external) return <a href={href} className={cls} {...(a as object)}>{inner}</a>;
    return <Link href={href} className={cls} {...(a as object)}>{inner}</Link>;
  }
  return (
    <button ref={ref} className={cls} disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} type={(rest as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}>
      {inner}
    </button>
  );
});

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      type="button"
      className={cn("tap inline-flex items-center justify-center rounded-full transition-all duration-300 hover:bg-soft active:scale-90", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
