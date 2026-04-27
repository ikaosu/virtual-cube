import RankingTable, { type RankingRow } from "@/components/RankingTable";
import { getAdminSupabase, type SolveRow } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function fetchRankings(): Promise<RankingRow[]> {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("solves")
      .select("display_name, time_ms, move_count, created_at")
      .eq("event", "333")
      .order("time_ms", { ascending: true })
      .limit(500);

    if (error) {
      console.error("[rankings] supabase error", error);
      return [];
    }

    const seen = new Set<string>();
    const ranked: RankingRow[] = [];
    for (const row of (data ?? []) as SolveRow[]) {
      if (seen.has(row.display_name)) continue;
      seen.add(row.display_name);
      ranked.push({
        rank: ranked.length + 1,
        display_name: row.display_name,
        time_ms: row.time_ms,
        move_count: row.move_count,
        created_at: row.created_at,
      });
      if (ranked.length >= 100) break;
    }
    return ranked;
  } catch (err) {
    console.error("[rankings] fetch failed", err);
    return [];
  }
}

export default async function RankingsPage() {
  const rows = await fetchRankings();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-gray-800">全国ランキング</div>
        <p className="text-gray-500 text-sm">
          3x3 のベストタイム (表示名ごとに最速 1 件)
        </p>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <RankingTable rows={rows} />
      </div>
    </div>
  );
}
