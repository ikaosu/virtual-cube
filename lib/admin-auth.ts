/** Server-side admin auth. Returns null on success, or a NextResponse on failure. */
import { NextResponse } from "next/server";

export function checkAdmin(req: Request): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 4) {
    return NextResponse.json(
      { error: "admin disabled (ADMIN_PASSWORD not configured)" },
      { status: 503 }
    );
  }
  const header = req.headers.get("x-admin-password") ?? "";
  if (header !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
