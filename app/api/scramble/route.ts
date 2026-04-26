import { NextResponse } from "next/server";
import { randomScrambleForEvent } from "cubing/scramble";

export const runtime = "nodejs";

export async function GET() {
  const alg = await randomScrambleForEvent("333");
  return NextResponse.json({ scramble: alg.toString() });
}
