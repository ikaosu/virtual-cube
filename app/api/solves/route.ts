import { NextResponse } from "next/server";
import { validateSolve } from "@/lib/validate-solve";
import { getAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const result = await validateSolve(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("solves")
    .insert({
      display_name: result.displayName,
      event: "333",
      time_ms: result.timeMs,
      scramble: result.scramble,
      solution: result.solutionStr,
      move_count: result.moveCount,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[api/solves] insert failed", error);
    return NextResponse.json({ error: "db insert failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, timeMs: result.timeMs });
}
