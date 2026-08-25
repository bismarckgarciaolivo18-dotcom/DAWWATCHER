/*
# Create songs and activity_events tables (single-tenant, no auth)

## Purpose
Stores songs detected from watched DAW project folders, plus an audit log of events per song.

## New Tables

### songs
- `id` (uuid, primary key)
- `cst_id` (text, unique, not null) — immutable identifier like "CST-2026-000001"
- `title` (text, not null) — the song title, derived from project filename or edited by user
- `title_status` (text, not null) — "preliminary" | "definitive"; controls whether title is editable and whether the confirmation prompt appears
- `artist` (text, nullable) — free-text artist name
- `status` (text, not null) — "idea" | "in_progress" | "ready"
- `notes` (text, nullable) — free-text multiline notes
- `project_path` (text, not null) — the folder path of the DAW project (used for de-duplication)
- `project_file` (text, nullable) — the specific project file that was detected (e.g. "MySong.als")
- `daw` (text, nullable) — detected DAW: "ableton" | "fl_studio" | "logic" | "unknown"
- `last_seen_at` (timestamptz, not null) — last time the watcher detected a change to this project
- `created_at` (timestamptz, not null, default now())
- `updated_at` (timestamptz, not null, default now())

### activity_events
- `id` (uuid, primary key)
- `song_id` (uuid, foreign key → songs.id ON DELETE CASCADE)
- `type` (text, not null) — "PROJECT_DETECTED" | "SONG_UPDATED" | "TITLE_LOCKED"
- `created_at` (timestamptz, not null, default now())

## Security
- RLS enabled on both tables.
- Single-tenant app with no sign-in screen, so all CRUD is allowed for anon + authenticated roles (data is intentionally shared/local).
*/

CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cst_id text UNIQUE NOT NULL,
  title text NOT NULL,
  title_status text NOT NULL DEFAULT 'preliminary' CHECK (title_status IN ('preliminary', 'definitive')),
  artist text,
  status text NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'in_progress', 'ready')),
  notes text,
  project_path text NOT NULL,
  project_file text,
  daw text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('PROJECT_DETECTED', 'SONG_UPDATED', 'TITLE_LOCKED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_songs_project_path ON songs(project_path);
CREATE INDEX IF NOT EXISTS idx_songs_title_status ON songs(title_status);
CREATE INDEX IF NOT EXISTS idx_activity_events_song_id ON activity_events(song_id);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_songs" ON songs;
CREATE POLICY "anon_select_songs" ON songs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_songs" ON songs;
CREATE POLICY "anon_insert_songs" ON songs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_songs" ON songs;
CREATE POLICY "anon_update_songs" ON songs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_songs" ON songs;
CREATE POLICY "anon_delete_songs" ON songs FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_activity_events" ON activity_events;
CREATE POLICY "anon_select_activity_events" ON activity_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_events" ON activity_events;
CREATE POLICY "anon_insert_activity_events" ON activity_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activity_events" ON activity_events;
CREATE POLICY "anon_update_activity_events" ON activity_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activity_events" ON activity_events;
CREATE POLICY "anon_delete_activity_events" ON activity_events FOR DELETE
  TO anon, authenticated USING (true);