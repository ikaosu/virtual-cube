# Virtual Cube

ブラウザで 3x3 ルービックキューブを解いて、タイムを全国ランキングに登録できる Web アプリ。

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- Cube renderer: vendored from [cstimer](https://github.com/cs0x7f/cstimer) (GPLv3)
- Solve verification: [cubing.js](https://js.cubing.net/cubing/) (`cubing/kpuzzle`)
- Ranking storage: Supabase (Postgres)

## License

This project is licensed under **GPLv3** (see [LICENSE](LICENSE)).

The cube renderer under [`vendor/cstimer/`](vendor/cstimer/) is derived from [cstimer](https://github.com/cs0x7f/cstimer) by cs0x7f, also licensed under GPLv3. See [`vendor/cstimer/README.md`](vendor/cstimer/README.md) for the source commit and any modifications.

## Development

```sh
npm install
cp .env.example .env.local  # then fill in Supabase credentials
npm run dev
```

### Supabase setup (one-time)

1. Create a new project at <https://supabase.com>.
2. Open the SQL Editor and run the contents of [`scripts/setup-supabase.sql`](scripts/setup-supabase.sql) to create the `solves` table.
3. From Project Settings → API, copy `Project URL` and `service_role` key into `.env.local`:

   ```
   SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=ey...
   ```

4. Restart `npm run dev`.
