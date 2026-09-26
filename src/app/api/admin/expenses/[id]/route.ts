import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { deleteExpense, updateExpense, type ExpenseInput } from "@/lib/financials";

export const runtime = "nodejs";

function validate(input: Partial<ExpenseInput>): string | null {
  if (!input.date || Number.isNaN(new Date(input.date).getTime())) return "Pick a valid date.";
  if (!input.category?.trim()) return "Category is required.";
  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount < 0) return "Amount looks wrong.";
  return null;
}

/** Edits an existing expense log entry. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;

  let input: Partial<ExpenseInput>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const problem = validate(input);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 });

  const result = await updateExpense(Number(id), input as ExpenseInput);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  return NextResponse.json({ ok: true });
}

/** Removes an expense log entry. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const result = await deleteExpense(Number(id));
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  return NextResponse.json({ ok: true });
}
