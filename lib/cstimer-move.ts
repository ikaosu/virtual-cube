/**
 * Translate cstimer's internal move representation `[start, end, axis, power]`
 * into clean WCA notation (e.g., "R", "U'", "Rw2", "y", "M", "E'").
 *
 * cstimer's own `move2str` produces non-WCA tokens for slice / rotation moves
 * on 3x3 (e.g., "2-2Lw'") which cubing.js's parser does not accept.
 *
 * Specialised for 3x3 (dimension=3, oSl=oSr=1).
 */

export type CstimerMove = [number, number, string, number];

export function cstimerMoveToWca(move: CstimerMove): string {
  const [start, end, axis, power] = move;
  const absPower = Math.abs(power);
  const sign = Math.sign(power);

  if (start === 1 && end === 1) {
    return axis + powerSuffix(sign, absPower);
  }

  if (start === 1 && end === 2) {
    return axis + "w" + powerSuffix(sign, absPower);
  }

  if (start === 1 && end === 3) {
    const inverted = "DLB".includes(axis) ? -1 : 1;
    const realSign = sign * inverted;
    const xyz = axis === "U" || axis === "D" ? "y" : axis === "R" || axis === "L" ? "x" : "z";
    return xyz + powerSuffix(realSign, absPower);
  }

  if (start === 2 && end === 2) {
    const inverted = "RUF".includes(axis) ? -1 : 1;
    const realSign = sign * inverted;
    const mes = axis === "L" || axis === "R" ? "M" : axis === "U" || axis === "D" ? "E" : "S";
    return mes + powerSuffix(realSign, absPower);
  }

  throw new Error(`Unsupported cstimer move for 3x3: [${move.join(", ")}]`);
}

function powerSuffix(sign: number, absPower: number): string {
  if (absPower === 2) return "2";
  return sign < 0 ? "'" : "";
}
