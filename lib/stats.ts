/**
 * WCA-style averages.
 * - ao5  : drop 1 best + 1 worst from 5 → mean of middle 3
 * - ao12 : drop 1 best + 1 worst from 12 → mean of middle 10
 * - ao100: drop 5 best + 5 worst from 100 → mean of middle 90
 */

export interface SolveStats {
  count: number;
  pb: number;
  worst: number;
  mean: number;
  bestAo5: number | null;
  bestAo12: number | null;
  bestAo100: number | null;
  currentAo5: number | null;
  currentAo12: number | null;
  currentAo100: number | null;
}

const AO_DEFS: { window: number; trim: number; key: "Ao5" | "Ao12" | "Ao100" }[] =
  [
    { window: 5, trim: 1, key: "Ao5" },
    { window: 12, trim: 1, key: "Ao12" },
    { window: 100, trim: 5, key: "Ao100" },
  ];

function trimmedMean(times: number[], trim: number): number {
  const sorted = [...times].sort((a, b) => a - b);
  const middle = sorted.slice(trim, sorted.length - trim);
  const sum = middle.reduce((a, b) => a + b, 0);
  return sum / middle.length;
}

function bestRollingAo(
  timesOldestFirst: number[],
  window: number,
  trim: number
): number | null {
  if (timesOldestFirst.length < window) return null;
  let best = Infinity;
  for (let i = 0; i + window <= timesOldestFirst.length; i++) {
    const ao = trimmedMean(timesOldestFirst.slice(i, i + window), trim);
    if (ao < best) best = ao;
  }
  return best === Infinity ? null : best;
}

function currentAo(
  timesNewestFirst: number[],
  window: number,
  trim: number
): number | null {
  if (timesNewestFirst.length < window) return null;
  return trimmedMean(timesNewestFirst.slice(0, window), trim);
}

/** `times` ordered NEWEST first. */
export function computeStats(timesNewestFirst: number[]): SolveStats | null {
  if (timesNewestFirst.length === 0) return null;
  const oldestFirst = [...timesNewestFirst].reverse();
  const sum = timesNewestFirst.reduce((a, b) => a + b, 0);
  const stats: SolveStats = {
    count: timesNewestFirst.length,
    pb: Math.min(...timesNewestFirst),
    worst: Math.max(...timesNewestFirst),
    mean: sum / timesNewestFirst.length,
    bestAo5: null,
    bestAo12: null,
    bestAo100: null,
    currentAo5: null,
    currentAo12: null,
    currentAo100: null,
  };
  for (const def of AO_DEFS) {
    const bestKey = `best${def.key}` as keyof SolveStats;
    const curKey = `current${def.key}` as keyof SolveStats;
    (stats[bestKey] as number | null) = bestRollingAo(
      oldestFirst,
      def.window,
      def.trim
    );
    (stats[curKey] as number | null) = currentAo(
      timesNewestFirst,
      def.window,
      def.trim
    );
  }
  return stats;
}
