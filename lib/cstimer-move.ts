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
    // Slice convention: M follows L direction, E follows D, S follows F.
    // So R / U / B (the opposites) need their power sign inverted.
    // (This is the OPPOSITE of cube rotations, where U/R/F are positive
    // because y/x/z follow those axes — easy to mix the two up.)
    const inverted = "RUB".includes(axis) ? -1 : 1;
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

/**
 * Inverse of cstimerMoveToWca: parse WCA notation into cstimer's internal
 * `[start, end, axis, power]` array. Specialised for 3x3 (dimension=3,
 * oSl=oSr=1).
 */
export function wcaToCstimerMove(wca: string): CstimerMove | null {
  const m = /^([xyzMESRLUDFB])(w?)(2|')?$/.exec(wca);
  if (!m) return null;
  const head = m[1];
  const wide = m[2] === "w";
  const suffix = m[3];
  const power = suffix === "'" ? -1 : suffix === "2" ? 2 : 1;

  if (head === "x") return [1, 3, "R", power];
  if (head === "y") return [1, 3, "U", power];
  if (head === "z") return [1, 3, "F", power];

  if (head === "M") return [2, 2, "L", power];
  if (head === "E") return [2, 2, "D", power];
  if (head === "S") return [2, 2, "F", power];

  if ("RLUDFB".includes(head)) {
    if (wide) return [1, 2, head, power];
    return [1, 1, head, power];
  }
  return null;
}
