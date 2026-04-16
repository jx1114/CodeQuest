"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Medal, Award, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeaderboardPlayer {
  userId: string
  username: string
  avatarUrl?: string | null
  totalXP: number
  levels: {
    python: number
    java: number
    cpp: number
  }
}

interface LeaderboardRow {
  rank: number
  userId: string
  username: string
  avatarUrl?: string | null
  value: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    setCurrentUser(JSON.parse(userData))
    loadLeaderboard()
  }, [router])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/leaderboard", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Unknown error" }))
        console.warn("Failed to load leaderboard", payload)
        setPlayers([])
        return
      }

      const payload = (await response.json()) as { players?: LeaderboardPlayer[] }
      setPlayers(Array.isArray(payload.players) ? payload.players : [])
    } catch (error) {
      console.warn("Failed to load leaderboard", error)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }

  const getLeaderboardRows = (): LeaderboardRow[] => {
    const sorted = [...players].sort((a, b) => b.totalXP - a.totalXP)

    return sorted.map((player, index) => ({
      rank: index + 1,
      userId: player.userId,
      username: player.username,
      avatarUrl: player.avatarUrl,
      value: player.totalXP,
    }))
  }

  const boardRows = getLeaderboardRows()
  const userEntry = boardRows.find((e) => e.userId === currentUser?.id)
  const valueHeader = "Total XP"

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600">Loading leaderboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-bold text-slate-900">Leaderboards</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadLeaderboard()}
                disabled={loading}
                className="shrink-0 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* User's Current Rank Card */}
          {userEntry && (
            <div className="bg-blue-600 rounded-xl shadow-sm p-6 mb-8 text-white border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {getRankIcon(userEntry.rank)}
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1 text-sm">Your Rank</p>
                    <p className="text-3xl font-bold">#{userEntry.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 mb-1 text-sm">{valueHeader}</p>
                  <p className="text-3xl font-bold">
                    {userEntry.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          {boardRows.length === 0 ? (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Entries Yet</h3>
                <p className="text-slate-600">Complete challenges to appear on the leaderboard!</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden bg-white shadow-sm border-0">
              <CardContent className="p-0 m-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Player</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">{valueHeader}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {boardRows.map((entry) => {
                        const isCurrentUser = entry.userId === currentUser?.id
                        return (
                          <tr
                            key={entry.userId}
                            className={`transition-colors ${
                              isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center w-12">
                                {getRankIcon(entry.rank)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {entry.avatarUrl ? (
                                  <img
                                    src={entry.avatarUrl}
                                    alt={`${entry.username} avatar`}
                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                                    {entry.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {entry.username}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm font-semibold text-gray-900">{entry.value.toLocaleString()}</span>
                              <span className="text-xs text-gray-500 ml-1">XP</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}