import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { addAuditLog, getUserById, updateUser } from "@/lib/data-store";

export async function GET() {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User record not found" }, { status: 404 });
  }

  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(request) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { name, phone, state, district, address, preferredLanguage } = body;

    if (!name || String(name).trim().length < 2) {
      return NextResponse.json(
        { error: "Full name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const updated = await updateUser(session.user.id, {
      name: String(name).trim(),
      phone: String(phone ?? "").trim(),
      state: String(state ?? "").trim(),
      district: String(district ?? "").trim(),
      address: String(address ?? "").trim(),
      preferredLanguage: preferredLanguage || "English",
    });

    if (!updated) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await addAuditLog({
      userId: session.user.id,
      userName: updated.name,
      action: "UPDATE_PROFILE",
      entityType: "User",
      entityId: session.user.id,
      details: "Updated contact particulars and communication preferences.",
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
