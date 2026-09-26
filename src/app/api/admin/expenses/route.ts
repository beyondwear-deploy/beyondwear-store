import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { addExpense, getExpenses, type ExpenseInput } from "@/lib/financials";

export const runtime = "nodejs";

function validate(input: Partial<ExpenseInput>): string | null {
  if (!input.date || Number.isNaN(new Date(input.date).getTime())) return "Pick a valid date.";
  if (!input.category?.trim()) return "Category is required.";
  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount < 0) return "Amount looks wrong.";
  return null;
}

/** The full expense log — feeds the P&L and cash flow. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { configured, expenses } = await getExpenses();
  return NextResponse.json({ ok: true, configured, expenses });
}

/** Logs a new expense (rent, packaging, ads, shipping paid out of pocket, etc.). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let input: Partial<ExpenseInput>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const problem = validate(input);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 });

  const result = await addExpense(input as ExpenseInput);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  return NextResponse.json({ ok: true });
}
