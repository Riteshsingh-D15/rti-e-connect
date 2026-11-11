import { NextResponse } from "next/server";
import {
  addAuditLog,
  addNotification,
  getApplicationById,
  updateApplication,
} from "@/lib/data-store";
import { updateApplicationStatus } from "@/services/applications";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request, { params }) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "CITIZEN" &&
      application.citizenId !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (session.user.role === "CITIZEN") {
      const { internalNotes, ...citizenSafe } = application;
      return NextResponse.json(citizenSafe);
    }

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const app = await getApplicationById(id);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const user = session.user;

    // Citizen self-service actions: clarification reply or withdrawal only
    if (user.role === "CITIZEN") {
      if (app.citizenId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      if (body.clarificationReply && app.status === "Awaiting Clarification") {
        const replyText = String(body.clarificationReply).trim();
        if (replyText.length < 10) {
          return NextResponse.json(
            { error: "Clarification text must be at least 10 characters." },
            { status: 400 }
          );
        }

        const updated = await updateApplication(id, {
          status: "Under Review",
          clarificationResponse: replyText,
          statusHistory: [
            ...(app.statusHistory || []),
            {
              id: `sh-${Date.now()}`,
              status: "Under Review",
              remarks: `Citizen submitted clarification: ${replyText}`,
              updatedBy: user.name,
              createdAt: new Date().toISOString(),
            },
          ],
        });

        await addNotification({
          userId: app.assignedOfficerId || "user-officer-1",
          title: "Citizen Clarification Received",
          message: `Applicant responded to clarification request for ${app.referenceNumber}.`,
          type: "info",
          link: `/officer/applications?id=${app.id}`,
        });

        await addAuditLog({
          userId: user.id,
          userName: user.name,
          action: "SUBMIT_CLARIFICATION",
          entityType: "RTIApplication",
          entityId: id,
          details: `Citizen provided clarification on ${app.referenceNumber}.`,
        });

        return NextResponse.json({ success: true, application: updated });
      }

      if (body.action === "withdraw") {
        if (["Response Sent", "Completed", "Withdrawn"].includes(app.status)) {
          return NextResponse.json(
            { error: "Closed or dispatched applications cannot be withdrawn." },
            { status: 400 }
          );
        }
        const updated = await updateApplicationStatus(
          id,
          "Withdrawn",
          body.remarks || "Application voluntarily withdrawn by citizen applicant.",
          user
        );
        return NextResponse.json({ success: true, application: updated });
      }

      return NextResponse.json(
        { error: "Citizens cannot alter official processing fields." },
        { status: 403 }
      );
    }

    // Officer & Administrator actions
    if (body.aiOverride) {
      const { category, department, note } = body.aiOverride;
      const updated = await updateApplication(id, {
        category: category || app.category,
        department: department || app.department,
        aiAnalysis: {
          ...(app.aiAnalysis || {}),
          predictedCategory: category || app.aiAnalysis?.predictedCategory,
          recommendedDepartment:
            department || app.aiAnalysis?.recommendedDepartment,
          isOverridden: true,
          verifiedBy: user.name,
          verifiedAt: new Date().toISOString(),
        },
        statusHistory: [
          ...(app.statusHistory || []),
          {
            id: `sh-${Date.now()}`,
            status: app.status,
            remarks:
              note ||
              `Officer reviewed AI classification (${category || app.category} / ${department || app.department}).`,
            updatedBy: user.name,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      await addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "VERIFY_AI_CLASSIFICATION",
        entityType: "RTIApplication",
        entityId: id,
        details: `Verified/updated AI classification for ${app.referenceNumber} -> ${category || app.category}.`,
      });

      return NextResponse.json({ success: true, application: updated });
    }

    if (body.status) {
      const updated = await updateApplicationStatus(
        id,
        body.status,
        body.remarks,
        user
      );
      return NextResponse.json({ success: true, application: updated });
    }

    if (body.internalNotes !== undefined) {
      const updated = await updateApplication(id, {
        internalNotes: body.internalNotes,
      });
      await addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "UPDATE_INTERNAL_NOTES",
        entityType: "RTIApplication",
        entityId: id,
        details: `Updated confidential officer notes on ${app.referenceNumber}.`,
      });
      return NextResponse.json({ success: true, application: updated });
    }

    if (body.department) {
      const updated = await updateApplication(id, {
        department: body.department,
        status: "Transferred",
        statusHistory: [
          ...(app.statusHistory || []),
          {
            id: `sh-${Date.now()}`,
            status: "Transferred",
            remarks: `Application transferred to ${body.department} under Section 6(3) of RTI Act, 2005.`,
            updatedBy: user.name,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      await addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "TRANSFER_SECTION_6_3",
        entityType: "RTIApplication",
        entityId: id,
        details: `Transferred ${app.referenceNumber} to ${body.department}.`,
      });

      await addNotification({
        userId: app.citizenId,
        title: "RTI Transferred Under Section 6(3)",
        message: `Your application ${app.referenceNumber} has been transferred to ${body.department}.`,
        type: "info",
        link: `/citizen/track?ref=${app.referenceNumber}`,
      });

      return NextResponse.json({ success: true, application: updated });
    }

    if (body.assignedOfficerId && user.role === "ADMINISTRATOR") {
      const updated = await updateApplication(id, {
        assignedOfficerId: body.assignedOfficerId,
        assignedOfficerName: body.assignedOfficerName || "Designated PIO",
        status: app.status === "Submitted" ? "Officer Assigned" : app.status,
      });
      await addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "REASSIGN_OFFICER",
        entityType: "RTIApplication",
        entityId: id,
        details: `Reassigned ${app.referenceNumber} to ${body.assignedOfficerName}.`,
      });
      return NextResponse.json({ success: true, application: updated });
    }

    return NextResponse.json(
      { error: "No supported update fields supplied." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
