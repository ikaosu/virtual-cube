# Vendored cstimer (GPLv3)

This directory contains files derived from [cstimer](https://github.com/cs0x7f/cstimer) by cs0x7f, used here to render and interact with the 3x3 virtual Rubik's cube. cstimer is licensed under **GPLv3**, and as a result this entire project is also distributed under GPLv3.

## Source

- Upstream repository: https://github.com/cs0x7f/cstimer
- Imported commit: `fdf0aefebd0b636697436dcc9e9fc3049aa871a4`
- Import date: 2026-04-26

## Files

| File | Upstream path | Modifications |
|------|---------------|---------------|
| `jquery-1.8.0.js` | `src/js/lib/jquery-1.8.0.js` | none |
| `threemin.js` | `src/js/lib/threemin.js` | none (THREE.js, MIT) |
| `pnltri.js` | `src/js/lib/pnltri.js` | none (own license) |
| `utillib.js` | `src/js/lib/utillib.js` | removed automatic ServiceWorker / applicationCache registration (sw.js does not exist here) |
| `isaac.js` | `src/js/lib/isaac.js` | none (own license, embedded in file) |
| `mathlib.js` | `src/js/lib/mathlib.js` | none |
| `cubeutil.js` | `src/js/lib/cubeutil.js` | none |
| `twisty.js` | `src/js/twisty/twisty.js` | none |
| `twistynnn.js` | `src/js/twisty/twistynnn.js` | none |
| `kernel-stub.js` | (new file, replaces `src/js/kernel.js`) | minimal stub returning defaults for `kernel.getProp(key, default)` |

## Load order

The files use script-tag globals and must be loaded in this order:

1. `jquery-1.8.0.js`
2. `threemin.js`
3. `pnltri.js`
4. `utillib.js`
5. `isaac.js` (must be before `mathlib.js` — `mathlib`'s IIFE seeds via `isaac.seed()`)
6. `mathlib.js`
7. `cubeutil.js`
8. `kernel-stub.js`
9. `twisty.js`
10. `twistynnn.js`

After loading, `window.twistyjs.TwistyScene` is available.
