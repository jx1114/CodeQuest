import { supabase } from "./supabase"

export interface LearningChapterProgressInput {
  userId: string
  languageId: string
  courseId: string
  chapterId: string
}

export interface ChallengeLevelProgressInput {
  userId: string
  levelId: string
  language: "Python" | "Java" | "C++"
}

export interface ProfileCourseStats {
  completed: number
  total: number
  xp: number
}

export interface ProfileAchievement {
  id: string
  name: string
  icon: string
  description: string
  current: number
  target: number
  unlocked: boolean
}

export interface ProfileProgressSnapshot {
  python: ProfileCourseStats
  java: ProfileCourseStats
  cpp: ProfileCourseStats
  totalXP: number
  currentStreak: number
  achievements: ProfileAchievement[]
}

const LANGUAGE_ID_TO_KEY: Record<string, "python" | "java" | "cpp"> = {
  "1": "python",
  "2": "java",
  "3": "cpp",
}

const LANGUAGE_NAME_TO_KEY: Record<string, "python" | "java" | "cpp"> = {
  python: "python",
  java: "java",
  "c++": "cpp",
}

const CHALLENGE_TOTALS = {
  python: 5,
  java: 5,
  cpp: 5,
}

const LEARNING_TOTAL_PER_LANGUAGE = 5

const defaultSnapshot: ProfileProgressSnapshot = {
  python: { completed: 0, total: LEARNING_TOTAL_PER_LANGUAGE + CHALLENGE_TOTALS.python, xp: 0 },
  java: { completed: 0, total: LEARNING_TOTAL_PER_LANGUAGE + CHALLENGE_TOTALS.java, xp: 0 },
  cpp: { completed: 0, total: LEARNING_TOTAL_PER_LANGUAGE + CHALLENGE_TOTALS.cpp, xp: 0 },
  totalXP: 0,
  currentStreak: 0,
  achievements: [],
}

export async function markLearningChapterComplete({ userId, languageId, courseId, chapterId }: LearningChapterProgressInput) {
  try {
    await supabase.from("learning_chapter_progress").upsert(
      {
        user_id: userId,
        language_id: languageId,
        course_id: courseId,
        chapter_id: chapterId,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,language_id,course_id,chapter_id",
      }
    )
  } catch (error) {
    console.warn("Failed to store learning chapter progress", error)
  }
}

export async function getCompletedChaptersForCourse(userId: string, languageId: string, courseId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("learning_chapter_progress")
      .select("chapter_id")
      .eq("user_id", userId)
      .eq("language_id", languageId)
      .eq("course_id", courseId)
      .eq("completed", true)

    if (error) {
      console.warn("Failed to read learning progress", error)
      return new Set()
    }

    return new Set((data ?? []).map((row) => row.chapter_id as string))
  } catch (error) {
    console.warn("Failed to read learning progress", error)
    return new Set()
  }
}

export async function markChallengeLevelComplete({ userId, levelId, language }: ChallengeLevelProgressInput) {
  try {
    await supabase.from("challenge_level_progress").upsert(
      {
        user_id: userId,
        level_id: levelId,
        language,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,level_id",
      }
    )

    const { count } = await supabase
      .from("challenge_level_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true)

    const completedLevels = count ?? 0

    await supabase
      .from("leaderboard_stats")
      .update({
        challenges_completed: completedLevels,
        total_points: completedLevels * 100,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
  } catch (error) {
    console.warn("Failed to store challenge level progress", error)
  }
}

export async function getCompletedChallengeLevels(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("challenge_level_progress")
      .select("level_id")
      .eq("user_id", userId)
      .eq("completed", true)

    if (error) {
      console.warn("Failed to read challenge progress", error)
      return new Set()
    }

    return new Set((data ?? []).map((row) => row.level_id as string))
  } catch (error) {
    console.warn("Failed to read challenge progress", error)
    return new Set()
  }
}

export async function getProfileProgressSnapshot(userId: string): Promise<ProfileProgressSnapshot> {
  const snapshot: ProfileProgressSnapshot = {
    ...defaultSnapshot,
    python: { ...defaultSnapshot.python },
    java: { ...defaultSnapshot.java },
    cpp: { ...defaultSnapshot.cpp },
    achievements: [],
  }

  try {
    const [learningResult, challengeResult, statsResult] = await Promise.all([
      supabase
        .from("learning_chapter_progress")
        .select("language_id")
        .eq("user_id", userId)
        .eq("completed", true),
      supabase
        .from("challenge_level_progress")
        .select("language")
        .eq("user_id", userId)
        .eq("completed", true),
      supabase
        .from("user_stats")
        .select("current_streak")
        .eq("user_id", userId)
        .maybeSingle(),
    ])

    if (!learningResult.error) {
      for (const row of learningResult.data ?? []) {
        const key = LANGUAGE_ID_TO_KEY[String(row.language_id)]
        if (!key) continue
        snapshot[key].completed += 1
        snapshot[key].xp += 25
      }
    }

    if (!challengeResult.error) {
      for (const row of challengeResult.data ?? []) {
        const key = LANGUAGE_NAME_TO_KEY[String(row.language).toLowerCase()]
        if (!key) continue
        snapshot[key].completed += 1
        snapshot[key].xp += 100
      }
    }

    if (!statsResult.error && statsResult.data) {
      snapshot.currentStreak = Number(statsResult.data.current_streak ?? 0)
    }

    snapshot.totalXP = snapshot.python.xp + snapshot.java.xp + snapshot.cpp.xp

    const totalChallengeCompleted = (challengeResult.data ?? []).length

    snapshot.achievements = [
      {
        id: "first-steps",
        name: "First Steps",
        icon: "🎯",
        description: "Complete your first coding challenge",
        current: Math.min(totalChallengeCompleted, 1),
        target: 1,
        unlocked: totalChallengeCompleted >= 1,
      },
      {
        id: "rising-star",
        name: "Rising Star",
        icon: "⭐",
        description: "Earn 500 XP points",
        current: snapshot.totalXP,
        target: 500,
        unlocked: snapshot.totalXP >= 500,
      },
      {
        id: "code-master",
        name: "Code Master",
        icon: "👑",
        description: "Complete 10 coding challenges",
        current: totalChallengeCompleted,
        target: 10,
        unlocked: totalChallengeCompleted >= 10,
      },
      {
        id: "streak-warrior",
        name: "Streak Warrior",
        icon: "🔥",
        description: "Maintain 7 consecutive day streaks",
        current: snapshot.currentStreak,
        target: 7,
        unlocked: snapshot.currentStreak >= 7,
      },
    ]
  } catch (error) {
    console.warn("Failed to build profile progress snapshot", error)
  }

  return snapshot
}
