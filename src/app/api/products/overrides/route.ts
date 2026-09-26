import { NextResponse } from "next/server";
import { fetchAllProductOverrides } from "@/lib/productOverrides";

export const runtime = "nodejs";

/** Public: lets the client pick up any admin-edited product details after hydration. No secrets here — same data every visitor's page already rendered with. */
export async function GET() {
  const overrides = await fetchAllProductOverrides();
  return NextResponse.json({ overrides });
}
