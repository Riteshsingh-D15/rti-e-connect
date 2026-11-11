import { NextResponse } from "next/server";
import {
  addAuditLog,
  addUser,
  getUserByEmail,
  getUsers,
  updateUser,
} from "@/lib/data-store";
import { requireApiAuth } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const { errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role = "GOVERNMENT OFFICER",
      phone,
      designation,
      department,
      employeeId,
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    if (!["CITIZEN", "GOVERNMENT OFFICER", "ADMINISTRATOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid user role." }, { status: 400 });
    }

    const existing = await getUserByEmail(email.trim());
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      phone: phone || "",
      designation:
        designation ||
        (role === "GOVERNMENT OFFICER"
          ? "Public Information Officer (PIO)"
          : ""),
      department: department || "",
      employeeId:
        employeeId ||
        (role === "GOVERNMENT OFFICER"
          ? `GOV-PIO-${Math.floor(1000 + Math.random() * 9000)}`
          : ""),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addUser(newUser);

    await addAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "CREATE_USER_ACCOUNT",
      entityType: "User",
      entityId: newUser.id,
      details: `Created ${role} account for ${newUser.name} (${newUser.email}).`,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { session, errorResponse } = await requireApiAuth(["ADMINISTRATOR"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, isActive, department, designation, role } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (id === session.user.id && isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own active admin account." },
        { status: 400 }
      );
    }

    const updates = {};
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (department !== undefined) updates.department = department;
    if (designation !== undefined) updates.designation = designation;
    if (role && ["CITIZEN", "GOVERNMENT OFFICER", "ADMINISTRATOR"].includes(role)) {
      updates.role = role;
    }

    const updated = await updateUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await addAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "UPDATE_USER_ACCESS",
      entityType: "User",
      entityId: id,
      details: `Updated user ${updated.email} access/assignment settings.`,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
