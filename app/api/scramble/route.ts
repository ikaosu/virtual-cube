import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FACES = ["U", "D", "L", "R", "F", "B"] as const;
const SUFFIXES = ["", "'", "2"] as const;
// Axis grouping: parallel faces share an axis. WCA scrambles don't allow
// two consecutive moves on the same axis (they'd coalesce / be redundant).
const AXIS: Record<string, number> = { U: 0, D: 0, L: 1, R: 1, F: 2, B: 2 };

const SCRAMBLE_LENGTH = 20;

function generateScramble(): string {
  const moves: string[] = [];
  let prevAxis = -1;
  let prevPrevAxis = -1;
  while (moves.length < SCRAMBLE_LENGTH) {
    const face = FACES[Math.floor(Math.random() * FACES.length)];
    const axis = AXIS[face];
    // Disallow same-axis-as-previous, and (same axis as previous && same as
    // the one before that) which is fully redundant.
    if (axis === prevAxis) continue;
    if (axis === prevPrevAxis && axis === prevAxis) continue;
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    moves.push(face + suffix);
    prevPrevAxis = prevAxis;
    prevAxis = axis;
  }
  return moves.join(" ");
}

export async function GET() {
  return NextResponse.json({ scramble: generateScramble() });
}
