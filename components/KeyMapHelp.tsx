/**
 * Keyboard mapping reference for the cstimer-style virtual cube.
 * Source: vendored twistynnn.js `generateCubeKeyMapping` (3x3, oSl=oSr=1, iSi=3).
 */

interface KeyEntry {
  key: string;
  move: string;
}

interface KeyGroup {
  title: string;
  entries: KeyEntry[];
}

const GROUPS: KeyGroup[] = [
  {
    title: "面 (Face turns)",
    entries: [
      { key: "I / K", move: "R / R'" },
      { key: "D / E", move: "L / L'" },
      { key: "J / F", move: "U / U'" },
      { key: "S / L", move: "D / D'" },
      { key: "H / G", move: "F / F'" },
      { key: "W / O", move: "B / B'" },
    ],
  },
  {
    title: "ワイド (Wide turns)",
    entries: [
      { key: "U / M", move: "Rw / Rw'" },
      { key: "V / R", move: "Lw / Lw'" },
      { key: ", / C", move: "Uw / Uw'" },
      { key: "Z / /", move: "Dw / Dw'" },
    ],
  },
  {
    title: "中層 (Slice)",
    entries: [
      { key: "5 / X", move: "M / M'" },
      { key: ". / 6", move: "M' / M" },
      { key: "2 / 9", move: "E / E'" },
      { key: "0 / 1", move: "S / S'" },
    ],
  },
  {
    title: "持ち替え (Rotations)",
    entries: [
      { key: "; / A", move: "y / y'" },
      { key: "Y / N", move: "x / x'" },
      { key: "T / B", move: "x / x'" },
      { key: "P / Q", move: "z / z'" },
    ],
  },
];

export default function KeyMapHelp() {
  return (
    <details className="w-full max-w-[600px] bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50">
        キーマップ (cstimer 互換)
      </summary>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 border-t border-gray-100">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="font-semibold text-xs text-gray-500 mb-1">
              {group.title}
            </div>
            <table className="w-full text-xs font-mono">
              <tbody>
                {group.entries.map((entry, i) => (
                  <tr key={i}>
                    <td className="text-indigo-600 py-0.5 pr-2 whitespace-nowrap">
                      {entry.key}
                    </td>
                    <td className="text-gray-700 py-0.5">{entry.move}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </details>
  );
}
