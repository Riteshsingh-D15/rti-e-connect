import { NextResponse } from "next/server";
import {
  listApplications,
  getApplicationByReference,
} from "@/lib/data-store";
import { submitRTIApplication } from "@/services/applications";
import { rtiSubmissionSchema } from "@/validations/application";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");
    const isCitizen = session.user.role === "CITIZEN";

    if (ref) {
      const app = await getApplicationByReference(ref);
      if (!app) {
        return NextResponse.json(
          { error: "Application not found with that reference number" },
          { status: 404 }
        );
      }
      if (isCitizen && app.citizenId !== session.user.id) {
        return NextResponse.json(
          { error: "You are only authorized to inspect your own RTI filings." },
          { status: 403 }
        );
      }
      // Hide confidential internal officer notes from citizens
      if (isCitizen) {
        const { internalNotes, ...citizenView } = app;
        return NextResponse.json(citizenView);
      }
      return NextResponse.json(app);
    }

    const citizenId = isCitizen
      ? session.user.id
      : searchParams.get("citizenId") || undefined;
    const department = searchParams.get("department") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const applications = await listApplications({
      citizenId,
      department,
      status,
      search,
    });

    if (isCitizen) {
      return NextResponse.json(
        applications.map(({ internalNotes, ...rest }) => rest)
      );
    }

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve applications" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireApiAuth([
    "CITIZEN",
    "ADMINISTRATOR",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const validation = rtiSubmissionSchema.safeParse(body);
    if (!validation.success) {
      const issues =
        validation.error.issues || validation.error.errors || [];
      const errorMsg =
        issues.map((e) => e.message).join(", ") || "Validation failed";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const newApp = await submitRTIApplication(body, {
      id: session.user.id,
      name: body.fullName || session.user.name,
      email: body.email || session.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        referenceNumber: newApp.referenceNumber,
        application: newApp,
        message: "RTI application submitted and categorized successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
