import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function requireApiAuth(allowedRoles = null) {
  const session = await getAuthSession();

  if (!session?.user) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      ),
    };
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(session.user.role)
  ) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          error: `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
