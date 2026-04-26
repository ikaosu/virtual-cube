-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- to create the `solves` table used by the virtual-cube app.

CREATE TABLE IF NOT EXISTS solves (
  id BIGSERIAL PRIMARY KEY,
  display_name TEXT NOT NULL,
  event TEXT NOT NULL DEFAULT '333',
  time_ms INTEGER NOT NULL,
  scramble TEXT NOT NULL,
  solution TEXT NOT NULL,
  move_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solves_event_time ON solves (event, time_ms ASC);
CREATE INDEX IF NOT EXISTS idx_solves_recent ON solves (created_at DESC);

-- Lock down the public role: writes go through the server (using the
-- SERVICE_ROLE key), and reads are also done server-side.
ALTER TABLE solves ENABLE ROW LEVEL SECURITY;
-- (No policies created → anon/public clients have zero access; only
--  the service_role key bypasses RLS, which is what the API routes use.)
