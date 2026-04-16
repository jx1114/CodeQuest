# Database Setup Instructions

## Required Tables for Challenge System

The Challenge system requires the following Supabase tables to be created:

1. **challenge_level_progress** - Tracks completed challenge levels per user per language
2. **learning_chapter_progress** - Tracks completed learning chapters per user
3. **learning_languages** - Stores language cards for the Learning page
4. **learning_courses** - Stores courses for each language
5. **learning_chapters** - Stores chapter content, examples, and practice prompts

## Setup Steps

### Option 1: Use the SQL Schema File (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy the contents of `SUPABASE_SCHEMA.sql`
5. Paste it into the SQL editor
6. Click "Run"

7. Run `SUPABASE_LEARNING_CONTENT.sql` in a second query to create and seed the learning catalog

### Option 2: Manual Table Creation

If you prefer to create tables manually through the Supabase UI:

#### challenge_level_progress Table
- **Columns:**
  - `id` - BIGINT (Primary Key, Auto Increment)
  - `user_id` - UUID (Foreign Key to auth.users)
  - `level_id` - TEXT (e.g., "level_1", "level_2")
  - `language` - TEXT (Enum: 'Python', 'Java', 'C++')
  - `completed` - BOOLEAN (default: true)
  - `completed_at` - TIMESTAMP WITH TIME ZONE
  - `created_at` - TIMESTAMP WITH TIME ZONE
  - `updated_at` - TIMESTAMP WITH TIME ZONE

- **Unique Constraint:** (user_id, level_id, language)

#### learning_chapter_progress Table
- **Columns:**
  - `id` - BIGINT (Primary Key, Auto Increment)
  - `user_id` - UUID (Foreign Key to auth.users)
  - `language_id` - TEXT
  - `course_id` - TEXT
  - `chapter_id` - TEXT
  - `completed` - BOOLEAN (default: true)
  - `completed_at` - TIMESTAMP WITH TIME ZONE
  - `updated_at` - TIMESTAMP WITH TIME ZONE

- **Unique Constraint:** (user_id, language_id, course_id, chapter_id)

### Step 3: Enable Row Level Security (RLS)

After tables are created, ensure RLS is enabled:
1. Go to Supabase Dashboard > Authentication > Policies
2. Enable RLS for `challenge_level_progress`
3. Enable RLS for `learning_chapter_progress`
4. The learning catalog tables can remain public read-only, since the content is not user-specific

Note: `SUPABASE_SERVICE_ROLE_KEY` is not required for the Learning page. The app can read the catalog with `NEXT_PUBLIC_SUPABASE_ANON_KEY` as long as the learning catalog tables are readable.

The policies are already defined in the SQL schema file.

## Testing the Setup

1. Go to Challenges page
2. Solve a challenge level in one language (e.g., Python)
3. Click "Submit Code" and complete the challenge
4. Refresh the page
5. The challenge should show as completed with a green checkmark and ✓

If the completion doesn't persist after refresh, check:
- Browser console for errors
- Supabase logs in the Dashboard
- Ensure tables are created with correct schema
- Verify RLS policies are correct
