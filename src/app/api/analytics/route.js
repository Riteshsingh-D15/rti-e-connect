import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/data-store";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  const { errorResponse } = await requireApiAuth([
    "GOVERNMENT OFFICER",
    "ADMINISTRATOR",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
