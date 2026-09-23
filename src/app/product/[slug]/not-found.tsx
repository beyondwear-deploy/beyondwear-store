import { PackageX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProductNotFound() {
  return (
    <div className="container-x py-24">
      <EmptyState icon={PackageX} title="We couldn't find that product" message="It may have been removed or the link might be out of date. Browse what's available now — new pairs land every week." primary={{ label: "Shop all", href: "/shop" }} secondary={{ label: "New arrivals", href: "/new-arrivals" }} />
    </div>
  );
}
