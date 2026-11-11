import { NextResponse } from "next/server";
import {
  getApplicationById,
  updateApplication,
  addAuditLog,
  addNotification,
} from "@/lib/data-store";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("applicationId");

    if (!appId) {
      return NextResponse.json(
        { error: "Provide applicationId to query response" },
        { status: 400 }
      );
    }

    const app = await getApplicationById(appId);
    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "CITIZEN" &&
      app.citizenId !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(app.officialResponse || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireApiAuth([
    "GOVERNMENT OFFICER",
    "ADMINISTRATOR",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      applicationId,
      subject,
      responseText,
      pointWiseResponse,
      legalProvisions,
      status = "Draft",
    } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId is mandatory" },
        { status: 400 }
      );
    }

    if (!["Draft", "Approved", "Sent"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid response status" },
        { status: 400 }
      );
    }

    const app = await getApplicationById(applicationId);
    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const officerUser = session.user;
    const isApproved = status === "Approved" || status === "Sent";
    const isSent = status === "Sent";

    const officialResponse = {
      id: app.officialResponse?.id || `resp-${Date.now()}`,
      subject: subject || app.subject,
      responseText: responseText || "",
      pointWiseResponse: pointWiseResponse || "",
      legalProvisions: legalProvisions || "RTI Act 2005 - Section 7(1)",
      status,
      approvedBy: isApproved ? officerUser.name : null,
      missingInfoFlag: Boolean(body.missingInfoFlag),
      approvedAt: isApproved
        ? app.officialResponse?.approvedAt || new Date().toISOString()
        : null,
      sentAt: isSent ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    const newAppStatus = isSent
      ? "Response Sent"
      : isApproved
      ? "Awaiting Approval"
      : "Draft Prepared";

    const newHistoryEntry = {
      id: `sh-${Date.now()}`,
      status: newAppStatus,
      remarks: isSent
        ? "Official response approved and dispatched to applicant."
        : isApproved
        ? "Response reviewed and marked as approved by PIO."
        : "Draft response saved for officer review.",
      updatedBy: officerUser.name,
      createdAt: new Date().toISOString(),
    };

    const updated = await updateApplication(applicationId, {
      status: newAppStatus,
      officialResponse,
      statusHistory: [...(app.statusHistory || []), newHistoryEntry],
    });

    await addAuditLog({
      userId: officerUser.id,
      userName: officerUser.name,
      action: isSent
        ? "DISPATCH_RESPONSE"
        : isApproved
        ? "APPROVE_RESPONSE"
        : "SAVE_DRAFT_RESPONSE",
      entityType: "OfficialResponse",
      entityId: officialResponse.id,
      details: `Official response ${status} for application ${app.referenceNumber}.`,
    });

    if (isApproved) {
      await addNotification({
        userId: app.citizenId,
        title: isSent ? "Official Response Issued" : "RTI Response Approved",
        message: isSent
          ? `The Public Information Officer has issued a formal response for your RTI application ${app.referenceNumber}. You may now view and download the official letter.`
          : `The response for your RTI application ${app.referenceNumber} has been approved and queued for dispatch.`,
        type: "success",
        link: `/citizen/track?ref=${app.referenceNumber}`,
      });
    }

    return NextResponse.json({
      success: true,
      officialResponse,
      application: updated,
    });
  } catch (error) {
    console.error("Save response error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
