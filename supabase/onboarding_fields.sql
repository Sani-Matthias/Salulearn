-- Adds onboarding data captured during account creation (username is
-- already stored as display_name). Run this once in the Supabase SQL Editor.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'none'
    CHECK (experience_level IN ('none', 'normal', 'pro')),
  ADD COLUMN IF NOT EXISTS learning_path TEXT DEFAULT 'standard'
    CHECK (learning_path IN ('standard', 'personalized')),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
