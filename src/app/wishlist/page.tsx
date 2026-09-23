import type { Metadata } from "next";
import { WishlistClient } from "@/components/account/WishlistClient";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: true }, alternates: { canonical: "/wishlist" } };

export default function WishlistPage() {
  return <WishlistClient />;
}
