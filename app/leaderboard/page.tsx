"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"

type LeaderboardType = "overall" | "python" | "java" | "cpp"

interface LeaderboardPlayer {
  userId: string
  username: string
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
  value: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [activeBoard, setActiveBoard] = useState<LeaderboardType>("overall")
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

  const loadLeaderboard = () => {
    // Mock data - replace with your API call
    const mockPlayers: LeaderboardPlayer[] = [
      { userId: "user1", username: "CodeMaster", totalXP: 2500, levels: { python: 9, java: 8, cpp: 8 } },
      { userId: "user2", username: "PythonPro", totalXP: 2300, levels: { python: 10, java: 7, cpp: 6 } },
      { userId: "user3", username: "JavaGuru", totalXP: 2100, levels: { python: 6, java: 10, cpp: 5 } },
      { userId: "user4", username: "CppNinja", totalXP: 1900, levels: { python: 5, java: 6, cpp: 8 } },
      { userId: "user5", username: "DevExpert", totalXP: 1700, levels: { python: 6, java: 6, cpp: 5 } },
      { userId: "user6", username: "WebWizard", totalXP: 1500, levels: { python: 5, java: 5, cpp: 5 } },
      { userId: "user7", username: "BugHunter", totalXP: 1300, levels: { python: 4, java: 4, cpp: 5 } },
      { userId: "user8", username: "AlgoAce", totalXP: 1100, levels: { python: 4, java: 4, cpp: 3 } },
      { userId: "user9", username: "DataDev", totalXP: 900, levels: { python: 3, java: 3, cpp: 3 } },
      { userId: "user10", username: "StackMaster", totalXP: 700, levels: { python: 2, java: 2, cpp: 3 } },
    ]
    setPlayers(mockPlayers)
    setLoading(false)
  }

  const getLeaderboardRows = (type: LeaderboardType): LeaderboardRow[] => {
    const sorted = [...players].sort((a, b) => {
      if (type === "overall") return b.totalXP - a.totalXP
      return b.levels[type] - a.levels[type]
    })

    return sorted.map((player, index) => ({
      rank: index + 1,
      userId: player.userId,
      username: player.username,
      value: type === "overall" ? player.totalXP : player.levels[type],
    }))
  }

  const boardRows = getLeaderboardRows(activeBoard)
  const userEntry = boardRows.find((e) => e.username === currentUser?.username)
  const boardTitle =
    activeBoard === "overall"
      ? "Overall Leaderboard"
      : `${activeBoard.charAt(0).toUpperCase()}${activeBoard.slice(1)} Leaderboard`
  const valueHeader = activeBoard === "overall" ? "Total XP" : "Levels Done"

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
        <div className="min-h-screen bg-slate-100radient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Leaderboards</h2>
            <p className="text-slate-600">Top performers • Resets daily at 12:00 AM</p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {([
              { key: "overall", label: "Overall" },
              { key: "python", label: "Python" },
              { key: "java", label: "Java" },
              { key: "cpp", label: "C++" },
            ] as Array<{ key: LeaderboardType; label: string }>).map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveBoard(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  activeBoard === item.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
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
                    {activeBoard === "overall" ? "" : ""}
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
                        const isCurrentUser = entry.username === currentUser?.username
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
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                                  {entry.username.charAt(0).toUpperCase()}
                                </div>
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
                              {activeBoard === "overall" && <span className="text-xs text-gray-500 ml-1">XP</span>}
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