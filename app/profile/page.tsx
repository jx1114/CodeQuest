"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, BookOpen, Flame, Award, Mail, Calendar, Edit, Target, Code } from "lucide-react"

interface CourseStats {
  completed: number
  total: number
  xp: number
}

interface UserProgressType {
  python: CourseStats
  java: CourseStats
  cpp: CourseStats
  totalXP: number
  currentStreak: number
  achievements: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  const [userProgress] = useState<UserProgressType>({
    python: { completed: 3, total: 5, xp: 150 },
    java: { completed: 2, total: 5, xp: 100 },
    cpp: { completed: 1, total: 5, xp: 50 },
    totalXP: 300,
    currentStreak: 5,
    achievements: ["First Steps", "Rising Star"],
  })

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const languages = [
    { name: "Python", key: "python" as const, icon: "/Python-Logo.png", color: "from-yellow-400 to-yellow-600" },
    { name: "Java", key: "java" as const, icon: "/Java-Logo.png", color: "from-orange-400 to-red-600" },
    { name: "C++", key: "cpp" as const, icon: "/C++-Logo.png", color: "from-blue-400 to-blue-600" },
  ]

  if (!user) {
    return null
  }

  const totalCompleted = userProgress.python.completed + userProgress.java.completed + userProgress.cpp.completed
  const totalLevels = userProgress.python.total + userProgress.java.total + userProgress.cpp.total
  const overallProgress = (totalCompleted / totalLevels) * 100

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-slate-100">
        {/* Profile Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-blue-400 flex items-center justify-center text-5xl font-bold text-white shadow-lg">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 transition border border-gray-200">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-slate-900">{user.username || "Player"}</h1>
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 w-fit mx-auto md:mx-0">
                      Level {Math.floor(userProgress.totalXP / 100)}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined November 2024</span>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{userProgress.totalXP}</div>
                      <div className="text-sm text-slate-500">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{totalCompleted}</div>
                      <div className="text-sm text-slate-500">Levels Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{userProgress.currentStreak}</div>
                      <div className="text-sm text-slate-500">Day Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{userProgress.achievements.length}</div>
                      <div className="text-sm text-slate-500">Achievements</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
          {/* Overall Progress Card */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Target className="w-5 h-5 text-blue-600" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Levels</span>
                  <span className="font-semibold">{totalCompleted} / {totalLevels}</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-xs text-gray-500 text-right">{Math.round(overallProgress)}% Complete</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Languages Progress */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-6 h-6 text-blue-600" />
                Learning Progress
              </h2>
              
              {languages.map((lang) => {
                const progress = userProgress[lang.key]
                const percentage = (progress.completed / progress.total) * 100

                return (
                  <Card key={lang.name} className="overflow-hidden bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                    <div className={`h-2 ${lang.color}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={lang.icon} alt={lang.name} className="w-16 h-16 object-contain" />
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{lang.name}</h3>
                            <p className="text-sm text-slate-500">
                              {progress.completed} of {progress.total} levels completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{progress.xp}</div>
                          <div className="text-xs text-slate-500">XP Earned</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{Math.round(percentage)}% complete</span>
                          <span>{progress.total - progress.completed} levels remaining</span>
                        </div>
                      </div>

                      <Button 
                        className={`w-full mt-4 ${percentage === 100 ? "bg-green-600 hover:bg-green-700" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
                        variant={percentage === 100 ? "default" : "default"}
                      >
                        {percentage === 100 ? "View Certificate" : "Continue Learning"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Right Column - Stats & Achievements */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-slate-700">Total XP</span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">{userProgress.totalXP}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-slate-700">Current Streak</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{userProgress.currentStreak} days</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-slate-700">Levels Done</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{totalCompleted}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-slate-700">Achievements</span>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">{userProgress.achievements.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                    <Award className="w-5 h-5 text-blue-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-50 p-4 rounded-lg text-center border border-amber-100">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-xs font-semibold text-slate-700">First Steps</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="text-xs font-semibold text-slate-700">Rising Star</div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg text-center border border-slate-200 opacity-50">
                      <div className="text-3xl mb-2">🔒</div>
                      <div className="text-xs font-semibold text-slate-500">Locked</div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg text-center border border-slate-200 opacity-50">
                      <div className="text-3xl mb-2">🔒</div>
                      <div className="text-xs font-semibold text-slate-500">Locked</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
