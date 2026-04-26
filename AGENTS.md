<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: virtual-cube

A 3x3 Rubik's cube speedsolving web app with a national leaderboard.

- The cube renderer is **vendored from cstimer (GPLv3)** under `vendor/cstimer/`. Do NOT replace it with cubing.js TwistyPlayer — TwistyPlayer is animation-based and unsuitable for real-time solve input.
- `cubing/kpuzzle` is used **only as a state model** (no animation): client-side shadow KPattern for solve detection, server-side for submission validation.
- Ranking storage: Supabase (Postgres). Connection via `.env.local` — never commit credentials.
- License: **GPLv3** (because of the vendored cstimer code). Keep `LICENSE` and the README attribution intact. Modified vendored files must include a "Modified from cstimer" header per GPLv3 §5.
