import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("solves").delete().eq("id", numericId);
  if (error) {
    console.error("[admin/solves DELETE] supabase error", error);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
