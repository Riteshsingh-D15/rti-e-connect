import { NextResponse } from "next/server";
import {
  addAuditLog,
  addDepartment,
  deleteDepartment,
  getDepartments,
  listApplications,
} from "@/lib/data-store";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const departments = await getDepartments();
    const applications = await listApplications();

    const deptsWithStats = departments.map((dept) => {
      const deptApps = applications.filter(
        (a) => a.department.toLowerCase() === dept.name.toLowerCase()
      );
      return {
        ...dept,
        totalApplications: deptApps.length,
        pending: deptApps.filter(
          (a) => !["Response Sent", "Completed", "Withdrawn"].includes(a.status)
        ).length,
        resolved: deptApps.filter((a) =>
          ["Response Sent", "Completed"].includes(a.status)
        ).length,
      };
    });

    return NextResponse.json(deptsWithStats);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { name, code, contactEmail, isStateLevel = true } = body;

    if (!name?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: "Department name and code are required." },
        { status: 400 }
      );
    }

    const existing = await getDepartments();
    if (
      existing.some(
        (d) =>
          d.name.toLowerCase() === name.trim().toLowerCase() ||
          d.code.toLowerCase() === code.trim().toLowerCase()
      )
    ) {
      return NextResponse.json(
        { error: "A department with this name or code already exists." },
        { status: 409 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const dept = {
      id: `dept-${Date.now()}`,
      name: name.trim(),
      code: cleanCode,
      isStateLevel: Boolean(isStateLevel),
      contactEmail:
        contactEmail?.trim() || `pio.${cleanCode.toLowerCase()}@gov.in`,
    };

    await addDepartment(dept);

    await addAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "CREATE_DEPARTMENT",
      entityType: "Department",
      entityId: dept.id,
      details: `Registered department ${dept.name} (${dept.code}).`,
    });

    return NextResponse.json(
      {
        success: true,
        department: {
          ...dept,
          totalApplications: 0,
          pending: 0,
          resolved: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { session, errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Department id is required" },
        { status: 400 }
      );
    }

    const removed = await deleteDepartment(id);
    if (!removed) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    await addAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "DELETE_DEPARTMENT",
      entityType: "Department",
      entityId: id,
      details: `Removed department ${id} from registry.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
