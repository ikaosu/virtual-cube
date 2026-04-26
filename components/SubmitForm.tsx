"use client";

import { useState } from "react";
import { formatTime } from "@/lib/format-time";
import type { SolveResult } from "@/lib/use-solver-session";

interface SubmitFormProps {
  result: SolveResult;
  onSubmitted?: () => void;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "ok"; id: number }
  | { kind: "error"; message: string };

const NAME_KEY = "virtual-cube:displayName";

export default function SubmitForm({ result, onSubmitted }: SubmitFormProps) {
  const [name, setName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(NAME_KEY) ?? "";
  });
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 32) {
      setState({ kind: "error", message: "表示名は 1〜32 文字で入力してください" });
      return;
    }
    setState({ kind: "submitting" });
    try {
      window.localStorage.setItem(NAME_KEY, trimmed);
      const res = await fetch("/api/solves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scramble: result.scramble,
          solution: result.solution,
          timeMs: result.timeMs,
          displayName: trimmed,
        }),
      });
      const json = (await res.json()) as { id?: number; error?: string };
      if (!res.ok) {
        setState({ kind: "error", message: json.error ?? `HTTP ${res.status}` });
        return;
      }
      setState({ kind: "ok", id: json.id ?? 0 });
      onSubmitted?.();
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  if (state.kind === "ok") {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 w-full max-w-[400px] text-center">
        <div className="text-lg font-bold text-cyan-600 mb-1">登録しました</div>
        <div className="text-sm text-gray-500">
          <span className="font-mono font-bold">{formatTime(result.timeMs)}</span>
          {" 秒 / "}
          {result.solution.length} 手
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 w-full max-w-[400px] flex flex-col gap-3">
      <div className="text-sm text-gray-700">
        <span className="text-gray-500">タイム: </span>
        <span className="font-mono font-bold text-gray-900">
          {formatTime(result.timeMs)}
        </span>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-2">
          {result.solution.length} 手
        </span>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-600 font-medium">表示名 (1〜32 文字)</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          className="border border-gray-300 rounded-2xl px-3 py-2 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          placeholder="例: けいた"
        />
      </label>
      <button
        className="py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        onClick={submit}
        disabled={state.kind === "submitting"}
      >
        {state.kind === "submitting" ? "送信中…" : "ランキングに登録"}
      </button>
      {state.kind === "error" && (
        <div className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">
          {state.message}
        </div>
      )}
    </div>
  );
}
