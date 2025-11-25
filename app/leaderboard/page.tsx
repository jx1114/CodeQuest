"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  levelsCompleted: number
  userId: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
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
    const mockEntries: LeaderboardEntry[] = [
      { rank: 1, username: "CodeMaster", xp: 2500, levelsCompleted: 25, userId: "user1" },
      { rank: 2, username: "PythonPro", xp: 2300, levelsCompleted: 23, userId: "user2" },
      { rank: 3, username: "JavaGuru", xp: 2100, levelsCompleted: 21, userId: "user3" },
      { rank: 4, username: "CppNinja", xp: 1900, levelsCompleted: 19, userId: "user4" },
      { rank: 5, username: "DevExpert", xp: 1700, levelsCompleted: 17, userId: "user5" },
      { rank: 6, username: "WebWizard", xp: 1500, levelsCompleted: 15, userId: "user6" },
      { rank: 7, username: "BugHunter", xp: 1300, levelsCompleted: 13, userId: "user7" },
      { rank: 8, username: "AlgoAce", xp: 1100, levelsCompleted: 11, userId: "user8" },
      { rank: 9, username: "DataDev", xp: 900, levelsCompleted: 9, userId: "user9" },
      { rank: 10, username: "StackMaster", xp: 700, levelsCompleted: 7, userId: "user10" },
    ]
    setEntries(mockEntries)
    setLoading(false)
  }

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </>
    )
  }

  const userEntry = entries.find((e) => e.username === currentUser?.username)

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Leaderboard</h2>
            <p className="text-gray-600">Top performers • Resets daily at 12:00 AM</p>
          </div>

          {/* User's Current Rank Card */}
          {userEntry && (
            <div className="bg-blue-500 rounded-xl shadow-lg p-6 mb-8 text-white">
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
                  <p className="text-blue-100 mb-1 text-sm">Total XP</p>
                  <p className="text-3xl font-bold">{userEntry.xp}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 mb-1 text-sm">Levels Completed</p>
                  <p className="text-3xl font-bold">{userEntry.levelsCompleted}</p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Entries Yet</h3>
                <p className="text-gray-600">Complete challenges to appear on the leaderboard!</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0 m-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Player</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">XP</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Levels</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entries.map((entry) => {
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{entry.xp.toLocaleString()}</span>
                              <span className="text-xs text-gray-500 ml-1">XP</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                {entry.levelsCompleted} levels
                              </span>
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