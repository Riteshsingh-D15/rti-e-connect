import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import {
  addAuditLog,
  getSystemConfig,
  updateSystemConfig,
} from "@/lib/data-store";

export async function GET() {
  const { errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const config = await getSystemConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { session, errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const updated = await updateSystemConfig({
      ...(body.aiModelProvider !== undefined && {
        aiModelProvider: body.aiModelProvider,
      }),
      ...(body.similarityCutoff !== undefined && {
        similarityCutoff: Number(body.similarityCutoff),
      }),
      ...(body.statutoryDeadlineDays !== undefined && {
        statutoryDeadlineDays: Number(body.statutoryDeadlineDays),
      }),
      ...(body.lifeLibertyDeadlineHours !== undefined && {
        lifeLibertyDeadlineHours: Number(body.lifeLibertyDeadlineHours),
      }),
      ...(body.defaultFeeAmount !== undefined && {
        defaultFeeAmount: Number(body.defaultFeeAmount),
      }),
      ...(body.enableOcr !== undefined && {
        enableOcr: Boolean(body.enableOcr),
      }),
    });

    await addAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "UPDATE_SYSTEM_CONFIG",
      entityType: "SystemConfig",
      entityId: "system",
      details: `Updated portal AI/statutory settings (Deadline: ${updated.statutoryDeadlineDays}d, Life/Liberty: ${updated.lifeLibertyDeadlineHours}h).`,
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
