import { DatabaseZap } from "lucide-react";

/** Shown wherever a dashboard section needs data but Supabase isn't connected yet. */
export function NotConfigured({ what = "This dashboard" }: { what?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-elev px-6 py-14 text-center">
      <DatabaseZap className="size-8 text-accent" aria-hidden />
      <p className="max-w-md text-sm font-medium text-fg">{what} needs your free database connected.</p>
      <p className="max-w-md text-xs text-subtle">
        Set <code className="rounded bg-soft px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code className="rounded bg-soft px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
        <code className="rounded bg-soft px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> in your environment variables, run{" "}
        <code className="rounded bg-soft px-1 py-0.5">supabase/schema.sql</code>, then redeploy. Full steps are in{" "}
        <code className="rounded bg-soft px-1 py-0.5">ADMIN_SETUP.md</code>.
      </p>
    </div>
  );
}
