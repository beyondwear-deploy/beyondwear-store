import type { Metadata } from "next";
import { DepartmentPage } from "@/components/shop/DepartmentPage";
import { DEPARTMENTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Men's Preloved Shoes",
  description: DEPARTMENTS.men.blurb,
  alternates: { canonical: "/men" },
};

export default function Page() {
  return <DepartmentPage dept="men" />;
}
