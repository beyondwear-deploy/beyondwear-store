"use client";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="container-x py-24">
      <EmptyState tone="danger" icon={WifiOff} title="Something went wrong" message="We couldn't load this page. Check your connection and try again — if it keeps happening, message us on WhatsApp." primary={{ label: "Try again", onClick: reset }} secondary={{ label: "Back to home", href: "/" }} />
    </div>
  );
}
