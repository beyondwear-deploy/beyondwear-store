/**
 * In-memory holder for the currently-known product overrides, read
 * synchronously by src/lib/catalog.ts. Deliberately a plain module (no
 * "use client", no React, no Zustand) so it can be safely imported by both
 * Server Components and Client Components without crossing any RSC
 * boundary weirdness.
 *
 * - On the server, src/app/layout.tsx populates this once per request
 *   (before the page renders) from the database, so pages render with
 *   accurate prices/photos/stock from the start.
 * - On the client, src/store/index.ts's hydrateStores() populates its own
 *   copy of this cache right after mount, so client-side reads (cart totals,
 *   quick view, search) stay correct as the visitor browses.
 *
 * Known tradeoff (same class as the rest of this free-stack app): this is a
 * shared module-level value, not per-request-safe under heavy concurrent
 * traffic on a single warm server instance. Fine for this store's scale —
 * see ADMIN_SETUP.md.
 */
import type { ProductPatch } from "./productPatch";

let cache: Record<string, ProductPatch> = {};

export function setProductOverrideCache(overrides: Record<string, ProductPatch>): void {
  cache = overrides ?? {};
}

export function getProductOverrideCache(): Record<string, ProductPatch> {
  return cache;
}
