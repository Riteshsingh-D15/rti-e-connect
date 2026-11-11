import { NextResponse } from "next/server";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/data-store";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const notifications = await getNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { session, errorResponse } = await requireApiAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      const updatedCount = await markAllNotificationsRead(session.user.id);
      return NextResponse.json({ success: true, updatedCount });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Notification id required" },
        { status: 400 }
      );
    }

    const updated = await markNotificationRead(id, session.user.id);
    if (!updated) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
