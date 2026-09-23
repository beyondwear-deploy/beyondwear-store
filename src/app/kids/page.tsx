import type { Metadata } from "next";
import { DepartmentPage } from "@/components/shop/DepartmentPage";
import { DEPARTMENTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Kids' Preloved Shoes",
  description: DEPARTMENTS.kids.blurb,
  alternates: { canonical: "/kids" },
};

export default function Page() {
  return <DepartmentPage dept="kids" />;
}
