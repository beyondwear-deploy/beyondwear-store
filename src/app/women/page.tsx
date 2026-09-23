import type { Metadata } from "next";
import { DepartmentPage } from "@/components/shop/DepartmentPage";
import { DEPARTMENTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Women's Preloved Shoes",
  description: DEPARTMENTS.women.blurb,
  alternates: { canonical: "/women" },
};

export default function Page() {
  return <DepartmentPage dept="women" />;
}
