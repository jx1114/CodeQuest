import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type LanguageKey = "python" | "java" | "cpp"

interface ChallengeProgressRow {
	user_id: string
	level_id: string
	language: string | null
}

interface UserRow {
	id: string
	username: string
}

interface LeaderboardStatsRow {
	user_id: string
	total_points: number | null
	python_levels_done?: number | null
	java_levels_done?: number | null
	cpp_levels_done?: number | null
}

const normalizeChallengeLanguage = (value: string): LanguageKey | null => {
	const normalized = value.trim().toLowerCase()
	if (normalized === "python") return "python"
	if (normalized === "java") return "java"
	if (normalized === "c++" || normalized === "cpp") return "cpp"
	return null
}

const parseStoredLanguages = (value: unknown): Array<LanguageKey> => {
	if (typeof value !== "string") return []
	const parts = value
		.split(/[,|]/)
		.map((item) => normalizeChallengeLanguage(item))
		.filter((item): item is LanguageKey => Boolean(item))
	return Array.from(new Set(parts))
}

export async function GET() {
	try {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
		const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
		const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

		if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
			return NextResponse.json(
				{
					error:
						"Missing Supabase env vars. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
				},
				{ status: 500 }
			)
		}

		const admin = createClient(supabaseUrl, serviceRoleKey || anonKey || "")

		const [usersResult, leaderboardStatsResult, challengeResult] = await Promise.all([
			admin.from("users").select("id,username"),
			admin.from("leaderboard_stats").select("user_id,total_points,python_levels_done,java_levels_done,cpp_levels_done"),
			admin.from("challenge_level_progress").select("user_id,level_id,language").eq("completed", true),
		])

		let challengeRows = challengeResult.data as ChallengeProgressRow[] | null
		let challengeError = challengeResult.error

		// Fallback for schemas without `completed` column
		if (challengeError) {
			const fallback = await admin.from("challenge_level_progress").select("user_id,level_id,language")
			challengeRows = fallback.data as ChallengeProgressRow[] | null
			challengeError = fallback.error
		}

		if (challengeError) {
			return NextResponse.json({ error: challengeError.message }, { status: 500 })
		}

		const users = (usersResult.data ?? []) as UserRow[]
		let statsRows = (leaderboardStatsResult.data ?? []) as LeaderboardStatsRow[]

		if (leaderboardStatsResult.error) {
			const statsFallback = await admin.from("leaderboard_stats").select("user_id,total_points")
			statsRows = (statsFallback.data ?? []) as LeaderboardStatsRow[]
		}

		const statsXpByUser = new Map<string, number>()
		const statsLevelsByUser = new Map<string, { python: number; java: number; cpp: number }>()
		for (const row of statsRows) {
			const points = Number(row.total_points ?? 0)
			statsXpByUser.set(row.user_id, Number.isFinite(points) ? points : 0)

			const python = Number(row.python_levels_done)
			const java = Number(row.java_levels_done)
			const cpp = Number(row.cpp_levels_done)
			if (Number.isFinite(python) && Number.isFinite(java) && Number.isFinite(cpp)) {
				statsLevelsByUser.set(row.user_id, { python, java, cpp })
			}
		}

		// Same dedup model as profile-level progress: per user => per level => solved languages set
		const userLevelLanguageMap = new Map<string, Map<string, Set<LanguageKey>>>()
		for (const row of challengeRows ?? []) {
			if (!row.user_id || !row.level_id) continue
			const langs = parseStoredLanguages(row.language)
			if (langs.length === 0) continue

			if (!userLevelLanguageMap.has(row.user_id)) {
				userLevelLanguageMap.set(row.user_id, new Map())
			}

			const levelMap = userLevelLanguageMap.get(row.user_id)!
			if (!levelMap.has(row.level_id)) {
				levelMap.set(row.level_id, new Set())
			}

			const levelLangs = levelMap.get(row.level_id)!
			for (const lang of langs) {
				levelLangs.add(lang)
			}
		}

		const usersForLeaderboard: UserRow[] =
			users.length > 0
				? users
				: Array.from(
						new Set<string>([
							...statsRows.map((row) => row.user_id),
							...Array.from(userLevelLanguageMap.keys()),
						])
				  ).map((id) => ({
						id,
						username: `User ${id.slice(0, 8)}`,
				  }))

		const players = usersForLeaderboard.map((user) => {
			const levelMap = userLevelLanguageMap.get(user.id) ?? new Map<string, Set<LanguageKey>>()

			let python = 0
			let java = 0
			let cpp = 0
			let calculatedXP = 0

			for (const langs of levelMap.values()) {
				if (langs.has("python")) python += 1
				if (langs.has("java")) java += 1
				if (langs.has("cpp")) cpp += 1
				calculatedXP += langs.size * 50
			}

			const statsXP = statsXpByUser.get(user.id)
			const storedLevels = statsLevelsByUser.get(user.id)

			return {
				userId: user.id,
				username: user.username,
				totalXP: typeof statsXP === "number" ? statsXP : calculatedXP,
				levels: {
					python: storedLevels ? storedLevels.python : python,
					java: storedLevels ? storedLevels.java : java,
					cpp: storedLevels ? storedLevels.cpp : cpp,
				},
			}
		})

		return NextResponse.json({ players })
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 })
	}
}
