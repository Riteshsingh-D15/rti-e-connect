import { NextResponse } from "next/server";
import { categorizeRTI } from "@/services/ai/categorize";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request) {
  const { errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const payload = await request.json();
    const { subject = "", question = "" } = payload;

    const result = await categorizeRTI(subject, question);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Categorization failed" },
      { status: 500 }
    );
  }
}
