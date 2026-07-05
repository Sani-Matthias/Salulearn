-- SaluLearn Pro Subscription + Shop System
-- Run this SQL in your Supabase SQL Editor after schema.sql / liga_system.sql

-- ============================================
-- PRO SUBSCRIPTION STATUS (on profiles)
-- ============================================
-- Written ONLY by the Stripe webhook (server-side, service_role key), never
-- by the client. Existing RLS policies on `profiles` already restrict
-- updates to `auth.uid() = id`, and the client's updateProfile() never
-- includes these fields, so a user cannot grant themselves Pro.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- ============================================
-- SHOP INVENTORY / EQUIPPED COSMETICS (on user_progress)
-- ============================================
-- Client-owned, written the same way as coins/points via saveCloudProgress().
-- Existing RLS policies on `user_progress` (auth.uid() = user_id) already
-- cover these new columns.
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS inventory TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipped_frame TEXT,
  ADD COLUMN IF NOT EXISTS equipped_theme TEXT;

-- ============================================
-- INDEX
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
