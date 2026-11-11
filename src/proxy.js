import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET =
  process.env.NEXTAUTH_SECRET || "rti-connect-secret-key-32-chars-long!!";

const ROUTE_ROLE_RULES = [
  { prefix: "/citizen", allowed: ["CITIZEN"] },
  { prefix: "/officer", allowed: ["GOVERNMENT OFFICER"] },
  { prefix: "/admin", allowed: ["ADMINISTRATOR"] },
];

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  const matchedRule = ROUTE_ROLE_RULES.find((rule) =>
    pathname.startsWith(rule.prefix)
  );

  if (!matchedRule) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!matchedRule.allowed.includes(token.role)) {
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    unauthorizedUrl.searchParams.set("required", matchedRule.allowed[0]);
    unauthorizedUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/citizen/:path*", "/officer/:path*", "/admin/:path*"],
};
