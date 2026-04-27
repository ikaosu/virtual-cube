import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getServerSupabase, type SolveRow } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("solves")
    .select("id, display_name, event, time_ms, scramble, solution, move_count, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/solves GET] supabase error", error);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
  return NextResponse.json({ solves: (data ?? []) as SolveRow[] });
}
