-- Fixes schema drift: the original schema.sql's user_progress definition was
-- never fully applied to this project, so cloud sync has been silently
-- failing on every save (missing columns -> PGRST204 error, swallowed by
-- the client). Run this once in the Supabase SQL Editor.

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_lessons TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS claimed_missions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_heart_regen_at TIMESTAMPTZ;
