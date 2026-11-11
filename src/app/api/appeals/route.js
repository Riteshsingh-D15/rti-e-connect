import { NextResponse } from "next/server";
import {
  listAppeals,
  addAppeal,
  updateAppeal,
  getApplicationById,
  updateApplication,
  addAuditLog,
  addNotification,
} from "@/lib/data-store";
import { appealSubmissionSchema } from "@/validations/application";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    let appeals = await listAppeals();

    if (session.user.role === "CITIZEN") {
      appeals = appeals.filter((a) => a.citizenId === session.user.id);
    } else {
      const citizenId = searchParams.get("citizenId");
      if (citizenId) {
        appeals = appeals.filter((a) => a.citizenId === citizenId);
      }
    }

    return NextResponse.json(appeals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireApiAuth(["CITIZEN"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const validation = appealSubmissionSchema.safeParse(body);
    if (!validation.success) {
      const issues =
        validation.error.issues || validation.error.errors || [];
      const errorMsg = issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const app = await getApplicationById(body.applicationId);
    if (!app) {
      return NextResponse.json(
        { error: "Original RTI application not found" },
        { status: 404 }
      );
    }

    if (app.citizenId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only file appeals for your own RTI applications." },
        { status: 403 }
      );
    }

    const citizenUser = session.user;
    const appealNumber = `APP-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newAppeal = {
      id: `appeal-${Date.now()}`,
      appealNumber,
      applicationId: app.id,
      applicationReferenceNumber: app.referenceNumber,
      citizenId: citizenUser.id,
      citizenName: citizenUser.name,
      groundOfAppeal: body.groundOfAppeal,
      reliefSought: body.reliefSought,
      supportingDocuments: Array.isArray(body.supportingDocuments)
        ? body.supportingDocuments
        : [],
      status: "Submitted",
      appellateOfficerName: `First Appellate Authority (${app.department})`,
      decisionRemarks: null,
      hearingDate: null,
      filedAt: new Date().toISOString(),
      resolvedAt: null,
    };

    await addAppeal(newAppeal);

    await updateApplication(app.id, {
      status: "Appeal Filed",
      statusHistory: [
        ...(app.statusHistory || []),
        {
          id: `sh-${Date.now()}`,
          status: "Appeal Filed",
          remarks: `First Appeal ${appealNumber} preferred under Section 19(1). Ground: ${body.groundOfAppeal}`,
          updatedBy: citizenUser.name,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    await addAuditLog({
      userId: citizenUser.id,
      userName: citizenUser.name,
      action: "FILE_APPEAL",
      entityType: "Appeal",
      entityId: newAppeal.id,
      details: `First Appeal filed against ${app.referenceNumber}. Appeal No: ${appealNumber}.`,
    });

    await addNotification({
      userId: app.assignedOfficerId || "user-officer-1",
      title: "First Appeal Filed",
      message: `Citizen filed First Appeal ${appealNumber} for application ${app.referenceNumber}.`,
      type: "warning",
      link: `/officer/appeals`,
    });

    return NextResponse.json(
      { success: true, appeal: newAppeal },
      { status: 201 }
    );
  } catch (error) {
    console.error("File appeal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { session, errorResponse } = await requireApiAuth([
    "GOVERNMENT OFFICER",
    "ADMINISTRATOR",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, status, decisionRemarks, hearingDate } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Appeal ID and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateAppeal(id, {
      status,
      decisionRemarks,
      hearingDate: hearingDate || null,
      decidedBy: session.user.name,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Appeal record not found" },
        { status: 404 }
      );
    }

    await addAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "APPEAL_DECISION",
      entityType: "Appeal",
      entityId: id,
      details: `First Appeal ${updated.appealNumber} marked '${status}'.`,
    });

    await addNotification({
      userId: updated.citizenId,
      title: `Appeal Order: ${status}`,
      message: `Your First Appeal ${updated.appealNumber} status is now '${status}'. Remarks: ${decisionRemarks || "Order passed."}`,
      type: status === "Allowed" ? "success" : "info",
      link: `/citizen/appeals`,
    });

    return NextResponse.json({ success: true, appeal: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
