import { Alg } from "cubing/alg";
import type { KPuzzle } from "cubing/kpuzzle";
import { countSolutionMoves } from "./moves";

let _kpuzzlePromise: Promise<KPuzzle> | null = null;

/** Server-only 3x3x3 KPuzzle for solution verification. */
function get3x3KPuzzle(): Promise<KPuzzle> {
  if (!_kpuzzlePromise) {
    _kpuzzlePromise = import("cubing/puzzles").then((m) => m.cube3x3x3.kpuzzle());
  }
  return _kpuzzlePromise;
}

export interface SolveSubmission {
  scramble: string;
  solution: string[];
  timeMs: number;
  displayName: string;
}

export type ValidationFailure = {
  ok: false;
  status: number;
  reason: string;
};

export type ValidationSuccess = {
  ok: true;
  scramble: string;
  solutionStr: string;
  moveCount: number;
  timeMs: number;
  displayName: string;
};

export type ValidationResult = ValidationFailure | ValidationSuccess;

const MIN_MS_PER_MOVE = 50; // <50ms per move is physically implausible
const MAX_TIME_MS = 600_000; // 10 minutes hard cap
const MAX_MOVES = 1000; // sanity cap on solution length

export async function validateSolve(input: unknown): Promise<ValidationResult> {
  if (!input || typeof input !== "object") {
    return { ok: false, status: 400, reason: "body must be a JSON object" };
  }
  const { scramble, solution, timeMs, displayName } = input as Partial<SolveSubmission>;

  if (typeof scramble !== "string" || scramble.length === 0 || scramble.length > 500) {
    return { ok: false, status: 400, reason: "invalid scramble" };
  }
  if (!Array.isArray(solution) || solution.length === 0 || solution.length > MAX_MOVES) {
    return { ok: false, status: 400, reason: "invalid solution length" };
  }
  if (!solution.every((m) => typeof m === "string" && m.length > 0 && m.length < 8)) {
    return { ok: false, status: 400, reason: "invalid move in solution" };
  }
  if (typeof timeMs !== "number" || !Number.isFinite(timeMs) || timeMs <= 0 || timeMs > MAX_TIME_MS) {
    return { ok: false, status: 400, reason: "invalid timeMs" };
  }
  if (typeof displayName !== "string") {
    return { ok: false, status: 400, reason: "displayName required" };
  }
  const trimmedName = displayName.trim();
  if (trimmedName.length < 1 || trimmedName.length > 32) {
    return { ok: false, status: 400, reason: "displayName must be 1-32 chars" };
  }
  if (timeMs < solution.length * MIN_MS_PER_MOVE) {
    return {
      ok: false,
      status: 400,
      reason: `timeMs too small for ${solution.length} moves (min ${solution.length * MIN_MS_PER_MOVE}ms)`,
    };
  }

  const kpuzzle = await get3x3KPuzzle();
  let pattern;
  try {
    pattern = kpuzzle.defaultPattern().applyAlg(new Alg(scramble));
  } catch (err) {
    return { ok: false, status: 400, reason: "could not parse scramble: " + (err as Error).message };
  }

  for (const move of solution) {
    try {
      pattern = pattern.applyMove(move);
    } catch (err) {
      return { ok: false, status: 400, reason: `could not apply move "${move}": ` + (err as Error).message };
    }
  }

  const solved = pattern.experimentalIsSolved({
    ignorePuzzleOrientation: true,
    ignoreCenterOrientation: true,
  });
  if (!solved) {
    return { ok: false, status: 400, reason: "solution does not solve the scramble" };
  }

  return {
    ok: true,
    scramble,
    solutionStr: solution.join(" "),
    // Excludes cube rotations (x/y/z), since they don't change cube state.
    moveCount: countSolutionMoves(solution),
    timeMs: Math.round(timeMs),
    displayName: trimmedName,
  };
}
