import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTime } from "@/lib/format-time";
import { computeStats } from "@/lib/stats";
import { getAdminSupabase, type SolveRow } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ name: string }>;
}

async function fetchSolves(name: string): Promise<SolveRow[]> {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("solves")
      .select("id, display_name, event, time_ms, scramble, solution, move_count, created_at")
      .eq("display_name", name)
      .eq("event", "333")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[/u] supabase error", error);
      return [];
    }
    return (data ?? []) as SolveRow[];
  } catch (err) {
    console.error("[/u] fetch failed", err);
    return [];
  }
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex flex-col items-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-mono font-bold text-lg text-gray-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}

function StatGroup({
  title,
  ao5,
  ao12,
  ao100,
}: {
  title: string;
  ao5: number | null;
  ao12: number | null;
  ao100: number | null;
}) {
  const fmt = (v: number | null) => (v === null ? "—" : formatTime(v));
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
      <div className="text-xs text-gray-500 mb-2">{title}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-gray-400">ao5</div>
          <div className="font-mono font-bold text-base text-gray-900 tabular-nums">
            {fmt(ao5)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400">ao12</div>
          <div className="font-mono font-bold text-base text-gray-900 tabular-nums">
            {fmt(ao12)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400">ao100</div>
          <div className="font-mono font-bold text-base text-gray-900 tabular-nums">
            {fmt(ao100)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const { name: rawName } = await params;
  if (!rawName) notFound();
  // Defensive: some hosting paths deliver the param still URL-encoded.
  // decodeURIComponent is a no-op on already-decoded UTF-8 input.
  let name: string;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    name = rawName;
  }

  const solves = await fetchSolves(name);
  const times = solves.map((s) => s.time_ms);
  const stats = computeStats(times);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-gray-900 truncate">{name}</h1>
        <Link
          href="/rankings"
          className="text-xs text-gray-500 hover:text-indigo-600 hover:underline whitespace-nowrap"
        >
          ← ランキング
        </Link>
      </div>

      {!stats ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          このユーザーのソルブはまだありません。
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox label="PB" value={formatTime(stats.pb)} />
            <StatBox label="平均" value={formatTime(stats.mean)} />
            <StatBox label="ワースト" value={formatTime(stats.worst)} />
            <StatBox label="ソルブ数" value={String(stats.count)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <StatGroup
              title="ベスト平均"
              ao5={stats.bestAo5}
              ao12={stats.bestAo12}
              ao100={stats.bestAo100}
            />
            <StatGroup
              title="現在の平均"
              ao5={stats.currentAo5}
              ao12={stats.currentAo12}
              ao100={stats.currentAo100}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
              最近のソルブ ({Math.min(solves.length, 50)} 件)
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-right px-3 py-2 w-10">#</th>
                  <th className="text-right px-3 py-2 w-20">タイム</th>
                  <th className="text-right px-3 py-2 w-12 hidden sm:table-cell">手数</th>
                  <th className="text-left px-3 py-2 hidden sm:table-cell">scramble</th>
                  <th className="text-right px-3 py-2 w-28">日時</th>
                </tr>
              </thead>
              <tbody>
                {solves.slice(0, 50).map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                  >
                    <td className="text-right px-3 py-2 font-mono text-xs text-gray-400">
                      {i + 1}
                    </td>
                    <td className="text-right px-3 py-2 font-mono font-bold tabular-nums text-gray-900">
                      {formatTime(s.time_ms)}
                    </td>
                    <td className="text-right px-3 py-2 font-mono text-gray-500 hidden sm:table-cell">
                      {s.move_count}
                    </td>
                    <td className="text-left px-3 py-2 font-mono text-xs text-gray-500 truncate max-w-[20em] hidden sm:table-cell">
                      {s.scramble}
                    </td>
                    <td className="text-right px-3 py-2 text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
