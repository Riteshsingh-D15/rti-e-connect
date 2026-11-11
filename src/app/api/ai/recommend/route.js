import { NextResponse } from "next/server";
import { recommendDepartment } from "@/services/ai/department";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request) {
  const { errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const payload = await request.json();
    const { text = "", category = "" } = payload;

    const result = recommendDepartment(text, category);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Department recommendation failed" },
      { status: 500 }
    );
  }
}
