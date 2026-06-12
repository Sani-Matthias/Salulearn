-- Liga (League) System for SaluLearn
-- Run this SQL in your Supabase SQL Editor after schema.sql

-- ============================================
-- LEAGUE GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS league_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silber', 'gold', 'platin', 'diamant')),
  member_count INTEGER DEFAULT 0,
  season_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE league_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "League groups are publicly readable" ON league_groups
  FOR SELECT USING (true);

-- ============================================
-- ADD LEAGUE COLUMNS TO USER_PROGRESS
-- ============================================
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS league_tier TEXT DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS league_group_id UUID REFERENCES league_groups(id),
  ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_progress_league_group ON user_progress(league_group_id);
CREATE INDEX IF NOT EXISTS idx_league_groups_tier ON league_groups(tier);

-- ============================================
-- RPC: GET LEAGUE LEADERBOARD
-- Returns sorted leaderboard for a group (bypasses RLS via SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION get_league_leaderboard(p_group_id UUID)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  weekly_xp INTEGER,
  position BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    up.user_id,
    COALESCE(p.display_name, split_part(p.email, '@', 1), 'Anonym')::TEXT AS display_name,
    p.avatar_url,
    COALESCE(up.weekly_xp, 0) AS weekly_xp,
    ROW_NUMBER() OVER (ORDER BY up.weekly_xp DESC) AS position
  FROM user_progress up
  JOIN profiles p ON p.id = up.user_id
  WHERE up.league_group_id = p_group_id
  ORDER BY up.weekly_xp DESC;
$$;

-- ============================================
-- RPC: GET OR JOIN LEAGUE GROUP
-- Ensures user is in an active group; creates one if needed
-- ============================================
CREATE OR REPLACE FUNCTION get_or_join_league_group(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
  v_tier TEXT;
  v_weekly_xp INTEGER;
  v_season_end TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get user's current league info
  SELECT league_tier, league_group_id, weekly_xp
  INTO v_tier, v_group_id, v_weekly_xp
  FROM user_progress
  WHERE user_id = p_user_id;

  IF v_tier IS NULL THEN
    v_tier := 'bronze';
  END IF;

  -- Check if user already has an active (non-expired) group
  IF v_group_id IS NOT NULL THEN
    SELECT season_end INTO v_season_end
    FROM league_groups
    WHERE id = v_group_id AND season_end > v_now;

    IF v_season_end IS NOT NULL THEN
      RETURN json_build_object(
        'tier', v_tier,
        'group_id', v_group_id,
        'weekly_xp', COALESCE(v_weekly_xp, 0),
        'season_end', v_season_end
      );
    END IF;
  END IF;

  -- Find an open group for this tier (prefer filling existing groups)
  SELECT id INTO v_group_id
  FROM league_groups
  WHERE tier = v_tier
    AND season_end > v_now
    AND member_count < 30
  ORDER BY member_count DESC
  LIMIT 1;

  -- Create new group if none available
  IF v_group_id IS NULL THEN
    INSERT INTO league_groups (tier, season_end)
    VALUES (v_tier, v_now + INTERVAL '7 days')
    RETURNING id, season_end INTO v_group_id, v_season_end;
  ELSE
    SELECT season_end INTO v_season_end FROM league_groups WHERE id = v_group_id;
  END IF;

  -- Assign user to group and reset weekly XP
  UPDATE user_progress
  SET
    league_group_id = v_group_id,
    league_tier = v_tier,
    weekly_xp = 0
  WHERE user_id = p_user_id;

  UPDATE league_groups
  SET member_count = member_count + 1
  WHERE id = v_group_id;

  RETURN json_build_object(
    'tier', v_tier,
    'group_id', v_group_id,
    'weekly_xp', 0,
    'season_end', v_season_end
  );
END;
$$;

-- ============================================
-- RPC: INCREMENT WEEKLY XP
-- ============================================
CREATE OR REPLACE FUNCTION increment_league_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE user_progress
  SET weekly_xp = COALESCE(weekly_xp, 0) + p_xp
  WHERE user_id = p_user_id;
$$;

-- ============================================
-- RPC: PROCESS SEASON END IF NEEDED
-- Calculates rank, promotes/demotes user, joins new group for next season
-- ============================================
CREATE OR REPLACE FUNCTION process_season_end_if_needed(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
  v_tier TEXT;
  v_rank BIGINT;
  v_result TEXT;
  v_new_tier TEXT;
  v_season_end TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get user's current group and tier
  SELECT up.league_group_id, up.league_tier, lg.season_end
  INTO v_group_id, v_tier, v_season_end
  FROM user_progress up
  LEFT JOIN league_groups lg ON lg.id = up.league_group_id
  WHERE up.user_id = p_user_id;

  -- Nothing to process if no group or season hasn't ended
  IF v_group_id IS NULL OR v_season_end IS NULL OR v_season_end > v_now THEN
    RETURN json_build_object('result', NULL, 'new_tier', NULL);
  END IF;

  -- Get user's rank in the group
  SELECT position INTO v_rank
  FROM get_league_leaderboard(v_group_id)
  WHERE user_id = p_user_id;

  IF v_rank IS NULL THEN v_rank := 999; END IF;

  -- Determine promotion/stay/relegation
  IF v_rank <= 10 THEN
    v_new_tier := CASE v_tier
      WHEN 'bronze'  THEN 'silber'
      WHEN 'silber'  THEN 'gold'
      WHEN 'gold'    THEN 'platin'
      WHEN 'platin'  THEN 'diamant'
      ELSE 'diamant'
    END;
    IF v_tier = 'diamant' THEN
      v_result := 'stayed'; v_new_tier := 'diamant';
    ELSE
      v_result := 'promoted';
    END IF;
  ELSIF v_rank <= 20 THEN
    v_result := 'stayed';
    v_new_tier := v_tier;
  ELSE
    v_new_tier := CASE v_tier
      WHEN 'diamant' THEN 'platin'
      WHEN 'platin'  THEN 'gold'
      WHEN 'gold'    THEN 'silber'
      WHEN 'silber'  THEN 'bronze'
      ELSE 'bronze'
    END;
    IF v_tier = 'bronze' THEN
      v_result := 'stayed'; v_new_tier := 'bronze';
    ELSE
      v_result := 'relegated';
    END IF;
  END IF;

  -- Update user's tier and clear old group assignment
  UPDATE user_progress
  SET league_tier = v_new_tier, league_group_id = NULL
  WHERE user_id = p_user_id;

  -- Join a new group for the next season
  PERFORM get_or_join_league_group(p_user_id);

  RETURN json_build_object('result', v_result, 'new_tier', v_new_tier);
END;
$$;
