/**
 * Cube rotation moves (x/y/z and their prime/double variants) don't change
 * the cube state in any meaningful way — they just reorient the solver's
 * grip. They shouldn't count toward the displayed move count.
 */
export function isRotation(move: string): boolean {
  if (move.length === 0) return false;
  const head = move[0];
  return head === "x" || head === "y" || head === "z";
}

/** Number of "real" moves in a solution (face turns, slices, wide turns). */
export function countSolutionMoves(moves: string[]): number {
  let n = 0;
  for (const m of moves) {
    if (!isRotation(m)) n++;
  }
  return n;
}
