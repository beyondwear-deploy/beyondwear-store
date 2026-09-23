"use client";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

export const inputCls =
  "h-12 w-full rounded-xl border border-line bg-elev px-4 text-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-subtle hover:border-line-strong focus:border-fg focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_28%,transparent)] aria-[invalid=true]:border-danger disabled:opacity-60";

interface FieldShell { label: string; error?: string; hint?: string; required?: boolean; className?: string }

function Shell({ id, label, error, hint, required, className, children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted">
        {label}{required && <span className="text-accent" aria-hidden> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-subtle">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
const describe = (id: string, error?: string, hint?: string) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export const TextField = forwardRef<HTMLInputElement, FieldShell & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, error, hint, required, className, ...rest }, ref,
) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <input ref={ref} id={id} required={required} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={inputCls} {...rest} />
    </Shell>
  );
});

export const TextAreaField = forwardRef<HTMLTextAreaElement, FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextAreaField(
  { label, error, hint, required, className, ...rest }, ref,
) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea ref={ref} id={id} required={required} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={cn(inputCls, "h-auto min-h-32 resize-y py-3")} {...rest} />
    </Shell>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, FieldShell & SelectHTMLAttributes<HTMLSelectElement>>(function SelectField(
  { label, error, hint, required, className, children, ...rest }, ref,
) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <select ref={ref} id={id} required={required} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={cn(inputCls, "appearance-none pr-10")} {...rest}>{children}</select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
      </div>
    </Shell>
  );
});

export function CheckboxField({ label, checked, onChange, className, name }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; className?: string; name?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input id={id} name={name} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-line-strong bg-elev transition peer-checked:border-fg peer-checked:bg-fg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
        <svg viewBox="0 0 14 14" className="size-3 text-bg transition"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="text-muted">{label}</span>
    </label>
  );
}

/** Honeypot + submit-time guard that every public form can share. */
export const Honeypot = () => (
  <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
    <label>Leave this field empty<input type="text" name="company_website" tabIndex={-1} autoComplete="off" /></label>
  </div>
);

/** Shared sanitiser: trims, strips control chars and angle brackets, caps length. */
export const clean = (v: string, max = 200) => v.replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
