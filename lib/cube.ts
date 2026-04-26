import type { KPuzzle } from "cubing/kpuzzle";

let _kpuzzlePromise: Promise<KPuzzle> | null = null;

/** 3x3x3 KPuzzle (shadow state model). Cached after first load. */
export function get3x3KPuzzle(): Promise<KPuzzle> {
  if (!_kpuzzlePromise) {
    _kpuzzlePromise = import("cubing/puzzles").then((m) => m.cube3x3x3.kpuzzle());
  }
  return _kpuzzlePromise;
}

export async function newScramble3x3(): Promise<string> {
  // cubing.js's randomScrambleForEvent spins up a module worker which
  // Turbopack does not currently bundle correctly. Generating the scramble
  // server-side sidesteps the worker issue entirely.
  const res = await fetch("/api/scramble");
  if (!res.ok) throw new Error(`Failed to fetch scramble: ${res.status}`);
  const json = (await res.json()) as { scramble: string };
  return json.scramble;
}
