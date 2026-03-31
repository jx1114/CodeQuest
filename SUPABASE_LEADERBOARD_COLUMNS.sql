-- Add per-language level progress columns used by Profile + Leaderboard
ALTER TABLE public.leaderboard_stats
  ADD COLUMN IF NOT EXISTS python_levels_done INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS java_levels_done INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpp_levels_done INTEGER NOT NULL DEFAULT 0;
