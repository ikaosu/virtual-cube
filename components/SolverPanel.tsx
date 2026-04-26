"use client";

import { useEffect, useRef } from "react";
import VirtualCube, { type VirtualCubeHandle } from "./VirtualCube";
import Timer from "./Timer";
import ScrambleDisplay from "./ScrambleDisplay";
import KeyMapHelp from "./KeyMapHelp";
import SubmitForm from "./SubmitForm";
import { useSolverSession } from "@/lib/use-solver-session";

const STATUS_LABEL: Record<"idle" | "ready" | "solving" | "done", string> = {
  idle: "スクランブルを取得中…",
  ready: "準備完了 — 最初の手でタイマー開始",
  solving: "ソルブ中…",
  done: "完成!",
};

const STATUS_COLOR: Record<"idle" | "ready" | "solving" | "done", string> = {
  idle: "text-gray-400",
  ready: "text-indigo-600",
  solving: "text-red-500",
  done: "text-cyan-600",
};

export default function SolverPanel() {
  const cubeRef = useRef<VirtualCubeHandle>(null);
  const session = useSolverSession();

  // Auto-fetch the first scramble when the page loads.
  useEffect(() => {
    if (session.state === "idle") {
      session.newScramble();
    }
  }, [session.state, session.newScramble]);

  useEffect(() => {
    if (session.state === "ready" && session.scramble && cubeRef.current) {
      cubeRef.current.applyScramble(session.scramble);
    }
  }, [session.state, session.scramble]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 w-full flex flex-col items-center gap-3">
        <ScrambleDisplay scramble={session.scramble} />
        <Timer ms={session.elapsedMs} active={session.state === "solving"} />
        <div className={`text-sm font-medium min-h-[1.5em] ${STATUS_COLOR[session.state]}`}>
          {STATUS_LABEL[session.state]}
        </div>
      </div>

      <div className="w-full max-w-[400px] aspect-square bg-white rounded-3xl border border-gray-200 shadow-sm p-2">
        <VirtualCube ref={cubeRef} onMove={session.recordMove} />
      </div>

      <div className="flex flex-wrap gap-2 justify-center w-full max-w-[400px]">
        <button
          className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => session.newScramble()}
          disabled={session.state === "solving"}
        >
          次のスクランブル
        </button>
        <button
          className="px-4 py-3 bg-white border-2 border-gray-300 hover:border-indigo-400 text-gray-700 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            session.reset();
            cubeRef.current?.reset();
          }}
          disabled={session.state === "idle"}
        >
          Reset
        </button>
      </div>

      <details className="text-xs w-full max-w-[400px]">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
          手数 / ソリューション ({session.solution.length})
        </summary>
        <div className="font-mono break-words mt-2 text-gray-800 bg-slate-100 p-3 rounded-2xl">
          {session.solution.join(" ")}
        </div>
      </details>

      {session.state === "done" && session.lastResult && (
        <SubmitForm result={session.lastResult} />
      )}

      <KeyMapHelp />
    </div>
  );
}
