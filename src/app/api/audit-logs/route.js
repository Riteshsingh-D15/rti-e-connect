import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/data-store";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  const { errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
