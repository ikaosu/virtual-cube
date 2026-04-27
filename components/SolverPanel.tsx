"use client";

import { useEffect, useRef } from "react";
import VirtualCube, { type VirtualCubeHandle } from "./VirtualCube";
import Timer from "./Timer";
import ScrambleDisplay from "./ScrambleDisplay";
import KeyMapHelp from "./KeyMapHelp";
import SubmitForm from "./SubmitForm";
import { useSolverSession } from "@/lib/use-solver-session";
import { countSolutionMoves } from "@/lib/moves";

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
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 w-full flex flex-col items-center gap-1">
        <ScrambleDisplay scramble={session.scramble} />
        <Timer ms={session.elapsedMs} active={session.state === "solving"} />
        <div
          className={`text-xs font-medium min-h-[1em] ${STATUS_COLOR[session.state]}`}
        >
          {STATUS_LABEL[session.state]}
        </div>
      </div>

      <div className="w-full max-w-[340px] aspect-square bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5">
        <VirtualCube
          ref={cubeRef}
          onMove={session.recordMove}
          onSolved={session.markSolved}
        />
      </div>

      <div className="flex gap-2 justify-center w-full max-w-[340px]">
        <button
          className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => session.newScramble()}
          disabled={session.state === "solving"}
        >
          次のスクランブル
        </button>
        <button
          className="px-3 py-2 bg-white border-2 border-gray-300 hover:border-indigo-400 text-gray-700 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            session.reset();
            cubeRef.current?.reset();
          }}
          disabled={session.state === "idle"}
        >
          Reset
        </button>
      </div>

      <details className="text-xs w-full max-w-[340px]">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
          手数 / ソリューション ({countSolutionMoves(session.solution)} 手, 持ち替え除く)
        </summary>
        <div className="font-mono break-words mt-2 text-gray-800 bg-slate-100 p-3 rounded-xl">
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
