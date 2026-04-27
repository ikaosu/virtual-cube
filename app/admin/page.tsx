"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/format-time";

interface AdminSolve {
  id: number;
  display_name: string;
  event: string;
  time_ms: number;
  scramble: string;
  solution: string;
  move_count: number;
  created_at: string;
}

const PW_KEY = "virtual-cube:adminPassword";

export default function AdminPage() {
  const [password, setPassword] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [solves, setSolves] = useState<AdminSolve[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, try a saved password.
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(PW_KEY)
        : null;
    if (saved) {
      setPassword(saved);
      void loadSolves(saved);
    }
  }, []);

  async function loadSolves(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/solves", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("パスワードが違います");
        setLoggedIn(false);
        return;
      }
      if (res.status === 503) {
        setError("admin が無効化されています (ADMIN_PASSWORD 未設定)");
        setLoggedIn(false);
        return;
      }
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        setLoggedIn(false);
        return;
      }
      const json = (await res.json()) as { solves: AdminSolve[] };
      setSolves(json.solves);
      setLoggedIn(true);
      window.sessionStorage.setItem(PW_KEY, pw);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSolve(id: number) {
    if (!confirm(`solve #${id} を削除しますか?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/solves/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        setError(`削除失敗: HTTP ${res.status}`);
        return;
      }
      setSolves((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.sessionStorage.removeItem(PW_KEY);
    setPassword("");
    setLoggedIn(false);
    setSolves([]);
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
          <div className="text-xl font-bold text-gray-800">管理者ログイン</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ADMIN_PASSWORD"
            className="border border-gray-300 rounded-2xl px-3 py-2 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") void loadSolves(password);
            }}
          />
          <button
            className="py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold rounded-2xl shadow-md transition-all disabled:opacity-50"
            onClick={() => void loadSolves(password)}
            disabled={loading || password.length === 0}
          >
            {loading ? "確認中…" : "ログイン"}
          </button>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">管理画面</div>
        <button
          className="text-sm text-gray-500 hover:text-gray-800 underline"
          onClick={logout}
        >
          ログアウト
        </button>
      </div>
      <p className="text-xs text-gray-500">
        全 {solves.length} 件 (新しい順、最大 500 件)。削除は元に戻せません。
      </p>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">
          {error}
        </div>
      )}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-right px-2 py-2">id</th>
              <th className="text-left px-2 py-2">表示名</th>
              <th className="text-right px-2 py-2">タイム</th>
              <th className="text-right px-2 py-2">手数</th>
              <th className="text-left px-2 py-2">scramble</th>
              <th className="text-left px-2 py-2">solution</th>
              <th className="text-left px-2 py-2">日時</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {solves.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-indigo-50">
                <td className="text-right px-2 py-2 font-mono text-gray-400">{s.id}</td>
                <td className="text-left px-2 py-2 text-gray-800 font-medium">
                  {s.display_name}
                </td>
                <td className="text-right px-2 py-2 font-mono font-bold tabular-nums">
                  {formatTime(s.time_ms)}
                </td>
                <td className="text-right px-2 py-2 font-mono text-gray-500">
                  {s.move_count}
                </td>
                <td className="text-left px-2 py-2 font-mono text-gray-600 max-w-[16em] truncate">
                  {s.scramble}
                </td>
                <td className="text-left px-2 py-2 font-mono text-gray-600 max-w-[20em] truncate">
                  {s.solution}
                </td>
                <td className="text-left px-2 py-2 text-gray-400">
                  {new Date(s.created_at).toLocaleString("ja-JP")}
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    className="text-xs text-red-600 hover:text-red-800 underline"
                    onClick={() => void deleteSolve(s.id)}
                    disabled={loading}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
