"use client";

import { useState } from "react";

interface MobileKeypadProps {
  onMove: (wca: string) => void;
  disabled?: boolean;
}

type TabKey = "basic" | "wide" | "rotation";

const TABS: Record<TabKey, { label: string; rows: string[][] }> = {
  basic: {
    label: "面",
    rows: [
      ["U", "U'", "U2"],
      ["R", "R'", "R2"],
      ["L", "L'", "L2"],
      ["F", "F'", "F2"],
      ["D", "D'", "D2"],
      ["B", "B'", "B2"],
    ],
  },
  wide: {
    label: "ワイド/中層",
    rows: [
      ["Rw", "Rw'", "M", "M'"],
      ["Lw", "Lw'", "Uw", "Uw'"],
      ["Fw", "Fw'", "Dw", "Dw'"],
      ["E", "E'", "S", "S'"],
    ],
  },
  rotation: {
    label: "持ち替え",
    rows: [
      ["x", "x'", "x2"],
      ["y", "y'", "y2"],
      ["z", "z'", "z2"],
    ],
  },
};

export default function MobileKeypad({ onMove, disabled }: MobileKeypadProps) {
  const [tab, setTab] = useState<TabKey>("basic");
  const tabKeys = Object.keys(TABS) as TabKey[];
  const cols = TABS[tab].rows[0]?.length ?? 3;

  return (
    <div className="sm:hidden w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
      <div className="flex gap-1 mb-2">
        {tabKeys.map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              tab === k
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {TABS[k].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {TABS[tab].rows.map((row, ri) => (
          <div
            key={ri}
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {row.map((move) => (
              <button
                key={move}
                onClick={() => onMove(move)}
                disabled={disabled}
                className="py-2.5 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-indigo-100 active:from-indigo-200 active:to-indigo-300 border border-gray-200 rounded-lg font-mono text-base font-bold text-gray-800 transition-colors disabled:opacity-50 select-none"
              >
                {move}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
