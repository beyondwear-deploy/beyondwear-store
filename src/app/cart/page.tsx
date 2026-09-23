import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = { title: "Your Bag", robots: { index: false, follow: true }, alternates: { canonical: "/cart" } };

export default function CartPage() {
  return <CartPageClient />;
}
