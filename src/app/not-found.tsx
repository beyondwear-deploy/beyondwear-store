import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="container-x py-24">
      <EmptyState icon={Compass} title="This page has gone preloved" message="The page you're looking for doesn't exist or has moved. Let's get you back to something worth wearing." primary={{ label: "Back to home", href: "/" }} secondary={{ label: "Shop all", href: "/shop" }} />
    </div>
  );
}
