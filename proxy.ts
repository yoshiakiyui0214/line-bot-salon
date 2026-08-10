import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const adminUser = process.env.ADMIN_BASIC_AUTH_USER;
  const adminPassword = process.env.ADMIN_BASIC_AUTH_PASSWORD;

  if (!adminUser || !adminPassword) {
    return new NextResponse("Admin Basic Auth is not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  const decoded = Buffer.from(authHeader.slice("Basic ".length), "base64").toString("utf-8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return unauthorized();
  }

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  if (!safeCompare(user, adminUser) || !safeCompare(password, adminPassword)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
