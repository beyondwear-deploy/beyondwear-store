import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountClient } from "@/components/account/AccountClient";
import { Skeleton } from "@/components/ui/LoadingState";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false }, alternates: { canonical: "/account" } };

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><Skeleton className="mx-auto h-96 max-w-md rounded-3xl" /></div>}>
      <AccountClient />
    </Suspense>
  );
}
