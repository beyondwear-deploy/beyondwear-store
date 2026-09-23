import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationClient } from "@/components/orders/ConfirmationClient";
import { Skeleton } from "@/components/ui/LoadingState";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><Skeleton className="mx-auto h-64 max-w-2xl rounded-3xl" /></div>}>
      <ConfirmationClient />
    </Suspense>
  );
}
