/**
 * PAYMENT PROVIDERS — modular by design.
 * Each provider implements `PaymentProvider`. To add a real gateway (Easypaisa,
 * JazzCash, Stripe, PayFast…), add a provider here that calls YOUR server route
 * (which holds the secret key) and returns `requires-action` with a redirect URL
 * — never call a gateway with secret keys from the browser.
 */
import { siteConfig } from "@/lib/config";
import type { PaymentMethodId } from "@/lib/types";

export type PaymentResult =
  | { ok: true; status: "pending" | "paid" | "awaiting-verification"; instructions?: string }
  | { ok: true; status: "requires-action"; gateway: "demo" }
  | { ok: false; error: string; retryable: boolean };

export interface PaymentContext { orderId: string; amount: number; email: string }

export interface PaymentProvider {
  id: PaymentMethodId;
  label: string;
  description: string;
  badge?: string;
  available: boolean;
  initiate(ctx: PaymentContext): Promise<PaymentResult>;
}

const cod: PaymentProvider = {
  id: "cod",
  label: "Cash on Delivery",
  description: "Pay in cash when your parcel arrives. Please keep the exact amount ready.",
  available: true,
  async initiate() { return { ok: true, status: "pending" }; },
};

const bank: PaymentProvider = {
  id: "bank-transfer",
  label: "Bank Transfer",
  description: "Transfer to our account and share the receipt. We confirm once payment is verified.",
  available: true,
  async initiate() {
    const b = siteConfig.payments.bankTransfer;
    return {
      ok: true,
      status: "awaiting-verification",
      instructions: `${b.bankName} · ${b.accountTitle} · A/C ${b.accountNumber} · IBAN ${b.iban}`,
    };
  },
};

const online: PaymentProvider = {
  id: "online",
  label: "Online Payment",
  description: "Card / wallet via a secure payment gateway.",
  badge: siteConfig.payments.onlineMode === "demo" ? "Demo gateway" : undefined,
  available: siteConfig.payments.onlineMode !== "off",
  async initiate() {
    if (siteConfig.payments.onlineMode === "demo") return { ok: true, status: "requires-action", gateway: "demo" };
    return { ok: false, error: "Online payment isn't configured yet.", retryable: false };
  },
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [cod, bank, online].filter((p) => p.available);
export const getProvider = (id: PaymentMethodId) => PAYMENT_PROVIDERS.find((p) => p.id === id);
