-- Challenge Level Progress Table
-- This table tracks which challenge levels have been completed by each user in each language
CREATE TABLE IF NOT EXISTS challenge_level_progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('Python', 'Java', 'C++')),
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure one user can only have one record per level per language
  UNIQUE(user_id, level_id, language)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_challenge_level_progress_user_id 
  ON challenge_level_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_level_progress_user_completed 
  ON challenge_level_progress(user_id, completed);

-- Enable RLS (Row Level Security)
ALTER TABLE challenge_level_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own challenge progress
CREATE POLICY "Users can view their own challenge progress" 
  ON challenge_level_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert/update their own challenge progress
CREATE POLICY "Users can insert/update their own challenge progress" 
  ON challenge_level_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" 
  ON challenge_level_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Learning Chapter Progress Table (if not already created)
CREATE TABLE IF NOT EXISTS learning_chapter_progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, language_id, course_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_chapter_progress_user_id 
  ON learning_chapter_progress(user_id);

ALTER TABLE learning_chapter_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning progress" 
  ON learning_chapter_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own learning progress" 
  ON learning_chapter_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" 
  ON learning_chapter_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
