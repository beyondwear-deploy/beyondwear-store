import { NextResponse } from "next/server";
import { fetchCustomProducts } from "@/lib/customProducts";

export const runtime = "nodejs";

/** Public: lets the client pick up admin-added ("Add new product") listings after hydration. */
export async function GET() {
  const products = await fetchCustomProducts();
  return NextResponse.json({ products });
}
