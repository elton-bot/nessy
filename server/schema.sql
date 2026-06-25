-- Nessy production schema: per-household isolation enforced by Postgres RLS.

CREATE TABLE IF NOT EXISTS households (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  text NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name          text NOT NULL,
  pin_hash      text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, name)
);

CREATE TABLE IF NOT EXISTS sessions (
  token         text PRIMARY KEY,
  member_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  household_id  text NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_name   text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS household_state (
  household_id  text PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
  version       integer NOT NULL DEFAULT 1,
  state         jsonb   NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id            bigserial PRIMARY KEY,
  household_id  text NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  actor         text NOT NULL,
  type          text NOT NULL,
  payload       jsonb,
  at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_household_idx ON events (household_id, id DESC);

-- ---------- Row-Level Security ----------
-- household-scoped tables are filtered to current_setting('app.household_id').
-- FORCE so even the table owner (the app role) is subject to the policy.
ALTER TABLE household_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_state FORCE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          FORCE ROW LEVEL SECURITY;
ALTER TABLE members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE members         FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hs_isolation ON household_state;
CREATE POLICY hs_isolation ON household_state
  USING (household_id = current_setting('app.household_id', true))
  WITH CHECK (household_id = current_setting('app.household_id', true));

DROP POLICY IF EXISTS ev_isolation ON events;
CREATE POLICY ev_isolation ON events
  USING (household_id = current_setting('app.household_id', true))
  WITH CHECK (household_id = current_setting('app.household_id', true));

DROP POLICY IF EXISTS mem_isolation ON members;
CREATE POLICY mem_isolation ON members
  USING (household_id = current_setting('app.household_id', true))
  WITH CHECK (household_id = current_setting('app.household_id', true));
