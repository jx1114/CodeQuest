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
  learningCompleted: number
  learningTotal: number
  challengeCompleted: number
  challengeTotal: number
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

const DAY_IN_MS = 24 * 60 * 60 * 1000

const normalizeChallengeLanguage = (value: string): "Python" | "Java" | "C++" | null => {
  const normalized = value.trim().toLowerCase()
  if (normalized === "python") return "Python"
  if (normalized === "java") return "Java"
  if (normalized === "c++" || normalized === "cpp") return "C++"
  return null
}

const parseStoredLanguages = (value: unknown): Array<"Python" | "Java" | "C++"> => {
  if (typeof value !== "string") return []
  const parts = value
    .split(/[,|]/)
    .map((item) => normalizeChallengeLanguage(item))
    .filter((item): item is "Python" | "Java" | "C++" => Boolean(item))
  return Array.from(new Set(parts))
}

const toUtcDayNumber = (value: Date | string) => {
  const date = new Date(value)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export async function updateLoginStreak(userId: string) {
  try {
    const now = new Date()
    const today = toUtcDayNumber(now)

    const { data: existing, error: readError } = await supabase
      .from("user_stats")
      .select("current_streak,updated_at")
      .eq("user_id", userId)
      .maybeSingle()

    if (readError) {
      console.warn("Failed to read current streak", readError)
      return
    }

    if (!existing) {
      await supabase.from("user_stats").upsert(
        {
          user_id: userId,
          current_streak: 1,
          updated_at: now.toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      return
    }

    const previousStreak = Math.max(1, Number(existing.current_streak ?? 1))
    const lastLoginDay = existing.updated_at ? toUtcDayNumber(existing.updated_at) : null

    // Same day login: keep streak unchanged
    if (lastLoginDay === today) {
      return
    }

    const dayGap = lastLoginDay === null ? Number.POSITIVE_INFINITY : Math.floor((today - lastLoginDay) / DAY_IN_MS)
    const nextStreak = dayGap === 1 ? previousStreak + 1 : 1

    await supabase
      .from("user_stats")
      .update({
        current_streak: nextStreak,
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId)
  } catch (error) {
    console.warn("Failed to update login streak", error)
  }
}

const defaultSnapshot: ProfileProgressSnapshot = {
  python: {
    completed: 0,
    total: LEARNING_TOTAL_PER_LANGUAGE + CHALLENGE_TOTALS.python,
    learningCompleted: 0,
    learningTotal: LEARNING_TOTAL_PER_LANGUAGE,
    challengeCompleted: 0,
    challengeTotal: CHALLENGE_TOTALS.python,
    xp: 0,
  },
  java: {
    completed: 0,
    total: LEARNING_TOTAL_PER_LANGUAGE + CHALLENGE_TOTALS.java,
    learningCompleted: 0,
    learningTotal: LEARNING_TOTAL_PER_LANGUAGE,
    challengeCompleted: 0,
    challengeTotal: CHALLENGE_TOTALS.java,
    xp: 0,
  },
  cpp: {
    completed: 0,
    total: LEARNING_TOTAL_PER_LANGUAGE + CHALLENGE_TOTALS.cpp,
    learningCompleted: 0,
    learningTotal: LEARNING_TOTAL_PER_LANGUAGE,
    challengeCompleted: 0,
    challengeTotal: CHALLENGE_TOTALS.cpp,
    xp: 0,
  },
  totalXP: 0,
  currentStreak: 1,
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
    // Check existing row for this challenge level
    const { data: existing, error: checkError } = await supabase
      .from("challenge_level_progress")
      .select("level_id,language")
      .eq("user_id", userId)
      .eq("level_id", levelId)
      .maybeSingle()

    if (checkError) {
      console.warn("Failed to check challenge progress", checkError)
      return
    }

    const existingLanguages = existing ? parseStoredLanguages(existing.language) : []

    // If already completed with this language, don't re-award XP
    if (existingLanguages.includes(language)) {
      return
    }

    if (existing) {
      // Legacy schema: single row per level. Keep all solved languages in comma-separated language field.
      const nextLanguages = Array.from(new Set([...existingLanguages, language]))
      const { error: updateError } = await supabase
        .from("challenge_level_progress")
        .update({
          language: nextLanguages.join(","),
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("level_id", levelId)

      if (updateError) {
        console.warn("Failed to store challenge level progress", updateError)
        return
      }
    } else {
      // Preferred schema: one row per level+language
      const primaryUpsert = await supabase.from("challenge_level_progress").upsert(
        {
          user_id: userId,
          level_id: levelId,
          language,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,level_id,language",
        }
      )

      // Fallback for legacy schemas that only have user_id,level_id unique constraint
      if (primaryUpsert.error) {
        const fallbackUpsert = await supabase.from("challenge_level_progress").upsert(
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

        if (fallbackUpsert.error) {
          console.warn("Failed to store challenge level progress", fallbackUpsert.error)
          return
        }
      }
    }

    // Get all completions
    let { data: allCompletions, error: readCompletionsError } = await supabase
      .from("challenge_level_progress")
      .select("level_id,language")
      .eq("user_id", userId)
      .eq("completed", true)

    // Fallback for schemas without `completed` column
    if (readCompletionsError) {
      const fallbackRead = await supabase
        .from("challenge_level_progress")
        .select("level_id,language")
        .eq("user_id", userId)

      allCompletions = fallbackRead.data
      readCompletionsError = fallbackRead.error
    }

    if (readCompletionsError) {
      console.warn("Failed to read challenge level progress", readCompletionsError)
      return
    }

    // Count unique levels, per-language level counts, and total XP
    let totalXP = 0
    const uniqueLevels = new Set<string>()
    const perLanguageLevels = {
      python: new Set<string>(),
      java: new Set<string>(),
      cpp: new Set<string>(),
    }

    for (const completion of allCompletions ?? []) {
      uniqueLevels.add(completion.level_id)
      const solvedLanguages = parseStoredLanguages(completion.language)
      totalXP += solvedLanguages.length * 50 // 50 XP per language per level

      for (const solvedLanguage of solvedLanguages) {
        const key = LANGUAGE_NAME_TO_KEY[String(solvedLanguage).toLowerCase()]
        if (!key) continue
        perLanguageLevels[key].add(completion.level_id)
      }
    }

    const uniqueLevelsCompleted = uniqueLevels.size
    const extendedUpdate = await supabase
      .from("leaderboard_stats")
      .update({
        challenges_completed: uniqueLevelsCompleted,
        total_points: totalXP,
        python_levels_done: perLanguageLevels.python.size,
        java_levels_done: perLanguageLevels.java.size,
        cpp_levels_done: perLanguageLevels.cpp.size,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    // Fallback for DB schemas that do not yet have per-language columns.
    if (extendedUpdate.error) {
      await supabase
        .from("leaderboard_stats")
        .update({
          challenges_completed: uniqueLevelsCompleted,
          total_points: totalXP,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
    }
  } catch (error) {
    console.warn("Failed to store challenge level progress", error)
  }
}

export async function getCompletedChallengeLevels(userId: string): Promise<Set<string>> {
  try {
    let { data, error } = await supabase
      .from("challenge_level_progress")
      .select("level_id,language")
      .eq("user_id", userId)
      .eq("completed", true)

    // Fallback for schemas without `completed` column
    if (error) {
      const fallbackRead = await supabase
        .from("challenge_level_progress")
        .select("level_id,language")
        .eq("user_id", userId)

      data = fallbackRead.data
      error = fallbackRead.error
    }

    if (error) {
      console.warn("Failed to read challenge progress", error)
      return new Set()
    }

    // Return format: "level_1_Python", "level_1_Java", etc.
    const completed = new Set<string>()
    for (const row of data ?? []) {
      const languages = parseStoredLanguages(row.language)
      for (const lang of languages) {
        completed.add(`${row.level_id}_${lang}`)
      }
    }
    return completed
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
        .select("language,level_id")
        .eq("user_id", userId)
        .eq("completed", true),
      supabase
        .from("user_stats")
        .select("current_streak")
        .eq("user_id", userId)
        .maybeSingle(),
    ])

    let challengeRows = challengeResult.data
    let challengeError = challengeResult.error

    let leaderboardStats: {
      total_points: number | null
      python_levels_done?: number | null
      java_levels_done?: number | null
      cpp_levels_done?: number | null
    } | null = null

    const leaderboardStatsWithLevels = await supabase
      .from("leaderboard_stats")
      .select("total_points,python_levels_done,java_levels_done,cpp_levels_done")
      .eq("user_id", userId)
      .maybeSingle()

    if (!leaderboardStatsWithLevels.error && leaderboardStatsWithLevels.data) {
      leaderboardStats = leaderboardStatsWithLevels.data
    } else {
      const leaderboardStatsFallback = await supabase
        .from("leaderboard_stats")
        .select("total_points")
        .eq("user_id", userId)
        .maybeSingle()

      if (!leaderboardStatsFallback.error && leaderboardStatsFallback.data) {
        leaderboardStats = leaderboardStatsFallback.data
      }
    }

    // Fallback for schemas without `completed` column
    if (challengeError) {
      const fallbackChallengeRead = await supabase
        .from("challenge_level_progress")
        .select("language,level_id")
        .eq("user_id", userId)

      challengeRows = fallbackChallengeRead.data
      challengeError = fallbackChallengeRead.error
    }

    if (!learningResult.error) {
      for (const row of learningResult.data ?? []) {
        const key = LANGUAGE_ID_TO_KEY[String(row.language_id)]
        if (!key) continue
        snapshot[key].completed += 1
        snapshot[key].learningCompleted += 1
      }
    }

    if (!challengeError) {
      // Count unique levels and total language-level combinations
      const levelLanguageMap = new Map<string, Set<string>>()
      for (const row of challengeRows ?? []) {
        const rowLanguages = parseStoredLanguages(row.language)
        if (!levelLanguageMap.has(row.level_id)) {
          levelLanguageMap.set(row.level_id, new Set())
        }
        for (const lang of rowLanguages) {
          levelLanguageMap.get(row.level_id)?.add(lang)
        }
      }

      // Total XP is challenge-based only: 50 XP per completed level-language pair
      let totalChallengeXP = 0
      for (const [, languages] of levelLanguageMap.entries()) {
        totalChallengeXP += languages.size * 50
      }
      snapshot.totalXP = totalChallengeXP

      // Add language-specific progress using deduplicated level-language pairs
      for (const [, languages] of levelLanguageMap.entries()) {
        for (const lang of languages) {
          const key = LANGUAGE_NAME_TO_KEY[String(lang).toLowerCase()]
          if (!key) continue
          snapshot[key].completed += 1
          snapshot[key].challengeCompleted += 1
          snapshot[key].xp += 50
        }
      }
    }

    if (!statsResult.error && statsResult.data) {
      snapshot.currentStreak = Math.max(1, Number(statsResult.data.current_streak ?? 1))
    }

    // Prefer DB-stored per-language level progress when available.
    const dbPythonLevels = Number(leaderboardStats?.python_levels_done)
    const dbJavaLevels = Number(leaderboardStats?.java_levels_done)
    const dbCppLevels = Number(leaderboardStats?.cpp_levels_done)
    const hasStoredLanguageLevels = Number.isFinite(dbPythonLevels) && Number.isFinite(dbJavaLevels) && Number.isFinite(dbCppLevels)

    if (hasStoredLanguageLevels) {
      snapshot.python.challengeCompleted = dbPythonLevels
      snapshot.java.challengeCompleted = dbJavaLevels
      snapshot.cpp.challengeCompleted = dbCppLevels

      snapshot.python.xp = dbPythonLevels * 50
      snapshot.java.xp = dbJavaLevels * 50
      snapshot.cpp.xp = dbCppLevels * 50

      snapshot.python.completed = snapshot.python.learningCompleted + snapshot.python.challengeCompleted
      snapshot.java.completed = snapshot.java.learningCompleted + snapshot.java.challengeCompleted
      snapshot.cpp.completed = snapshot.cpp.learningCompleted + snapshot.cpp.challengeCompleted
    }

    // Keep total XP aligned with challenge-only XP model
    const dbTotalPoints = Number(leaderboardStats?.total_points)
    if (Number.isFinite(dbTotalPoints)) {
      snapshot.totalXP = dbTotalPoints
    } else if (snapshot.totalXP === 0) {
      snapshot.totalXP = snapshot.python.xp + snapshot.java.xp + snapshot.cpp.xp
    }

    // Calculate total unique challenges for achievements
    const levelLanguageMap = new Map<string, Set<string>>()
    for (const row of challengeRows ?? []) {
      const rowLanguages = parseStoredLanguages(row.language)
      if (!levelLanguageMap.has(row.level_id)) {
        levelLanguageMap.set(row.level_id, new Set())
      }
      for (const lang of rowLanguages) {
        levelLanguageMap.get(row.level_id)?.add(lang)
      }
    }
    const totalChallengeCompleted = levelLanguageMap.size

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
