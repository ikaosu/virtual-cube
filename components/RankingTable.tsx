import Link from "next/link";
import { formatTime } from "@/lib/format-time";

export interface RankingRow {
  rank: number;
  display_name: string;
  time_ms: number;
  move_count: number;
  created_at: string;
}

interface RankingTableProps {
  rows: RankingRow[];
}

const RANK_BADGE: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
  2: "bg-gray-200 text-gray-700 ring-1 ring-gray-300",
  3: "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
};

export default function RankingTable({ rows }: RankingTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center p-8">
        まだ登録されたソルブはありません。
      </div>
    );
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 text-xs">
          <th className="text-right px-3 py-3 w-14">#</th>
          <th className="text-left px-3 py-3">表示名</th>
          <th className="text-right px-3 py-3 w-24">タイム</th>
          <th className="text-right px-3 py-3 w-16 hidden sm:table-cell">手数</th>
          <th className="text-right px-3 py-3 w-32 hidden sm:table-cell">日付</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={`${row.rank}-${row.display_name}`}
            className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
          >
            <td className="text-right px-3 py-3">
              <span
                className={`inline-block w-7 text-center font-mono text-xs font-bold rounded-full px-1 py-0.5 ${
                  RANK_BADGE[row.rank] ?? "text-gray-400"
                }`}
              >
                {row.rank}
              </span>
            </td>
            <td className="text-left px-3 py-3 truncate max-w-[12em]">
              <Link
                href={`/u/${encodeURIComponent(row.display_name)}`}
                className="text-gray-800 hover:text-indigo-600 hover:underline"
              >
                {row.display_name}
              </Link>
            </td>
            <td className="text-right px-3 py-3 font-mono font-bold tabular-nums text-gray-900">
              {formatTime(row.time_ms)}
            </td>
            <td className="text-right px-3 py-3 font-mono text-gray-500 hidden sm:table-cell">
              {row.move_count}
            </td>
            <td className="text-right px-3 py-3 text-xs text-gray-400 hidden sm:table-cell">
              {new Date(row.created_at).toLocaleDateString("ja-JP")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
