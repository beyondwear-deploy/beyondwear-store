import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrderClient } from "@/components/orders/TrackOrderClient";
import { Skeleton } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Follow your order from placed to delivered using your order number and email or phone.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><Skeleton className="mx-auto h-72 max-w-2xl rounded-3xl" /></div>}>
      <TrackOrderClient />
    </Suspense>
  );
}
