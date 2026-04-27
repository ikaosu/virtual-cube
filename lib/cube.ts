export async function newScramble3x3(): Promise<string> {
  // cubing.js's randomScrambleForEvent spins up a module worker which
  // Turbopack does not currently bundle correctly. Generating the scramble
  // server-side sidesteps the worker issue entirely.
  const res = await fetch("/api/scramble");
  if (!res.ok) throw new Error(`Failed to fetch scramble: ${res.status}`);
  const json = (await res.json()) as { scramble: string };
  return json.scramble;
}
