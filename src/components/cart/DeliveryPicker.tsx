"use client";
import { Check } from "lucide-react";
import { siteConfig, type DeliveryId } from "@/lib/config";
import { cn, formatPrice } from "@/lib/format";
import { deliveryFee } from "@/lib/pricing";

export function DeliveryPicker({ value, onChange, subtotal, freeShippingPromo }: { value: DeliveryId; onChange: (v: DeliveryId) => void; subtotal: number; freeShippingPromo?: boolean }) {
  return (
    <fieldset>
      <legend className="sr-only">Delivery method</legend>
      <div className="space-y-2.5">
        {siteConfig.delivery.map((d) => {
          const fee = deliveryFee(d.id, subtotal, freeShippingPromo);
          const on = value === d.id;
          return (
            <label key={d.id} className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]", on ? "border-fg bg-elev shadow-soft" : "border-line hover:border-line-strong")}>
              <input type="radio" name="delivery" value={d.id} checked={on} onChange={() => onChange(d.id)} className="sr-only" />
              <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-full border transition", on ? "border-fg bg-fg text-bg" : "border-line-strong")}>{on && <Check className="size-3.5" />}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{d.label}</span><span className="block text-xs text-muted">{d.eta}</span></span>
              <span className="text-sm font-bold tabular-nums">{fee === 0 ? "Free" : formatPrice(fee)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
