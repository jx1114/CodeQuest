"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Flame, Award, Mail, Calendar, Edit, Target, Code } from "lucide-react"
import { getProfileProgressSnapshot, type ProfileProgressSnapshot } from "@/lib/progress"
import { supabase } from "@/lib/supabase"

interface CourseStats {
  completed: number
  total: number
  xp: number
}

interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  current: number
  target: number
  unlocked: boolean
}

interface UserProgressType extends ProfileProgressSnapshot {}

interface GeneratedCertificate {
  id: string
  languageId: string
  languageName: string
  userName: string
  issuedAt: string
  totalChapters: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [certificates, setCertificates] = useState<Map<string, GeneratedCertificate>>(new Map())
  const [selectedCertificate, setSelectedCertificate] = useState<GeneratedCertificate | null>(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [joinedDateLabel, setJoinedDateLabel] = useState("Joined date unavailable")
  const [userProgress, setUserProgress] = useState<UserProgressType>({
    python: { completed: 0, total: 10, learningCompleted: 0, learningTotal: 5, challengeCompleted: 0, challengeTotal: 5, xp: 0 },
    java: { completed: 0, total: 10, learningCompleted: 0, learningTotal: 5, challengeCompleted: 0, challengeTotal: 5, xp: 0 },
    cpp: { completed: 0, total: 10, learningCompleted: 0, learningTotal: 5, challengeCompleted: 0, challengeTotal: 5, xp: 0 },
    totalXP: 0,
    currentStreak: 1,
    achievements: [],
  })

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    if (parsedUser?.id) {
      void loadProfileProgress(parsedUser.id)
      void loadJoinedDate(parsedUser.id)
      loadCertificates(parsedUser.id)
    }
  }, [router])

  const loadJoinedDate = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("created_at")
        .eq("id", userId)
        .maybeSingle()

      if (error || !data?.created_at) {
        setJoinedDateLabel("Joined date unavailable")
        return
      }

      const joinedDate = new Date(data.created_at)
      if (Number.isNaN(joinedDate.getTime())) {
        setJoinedDateLabel("Joined date unavailable")
        return
      }

      setJoinedDateLabel(
        `Joined ${joinedDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      )
    } catch {
      setJoinedDateLabel("Joined date unavailable")
    }
  }

  const loadProfileProgress = async (userId: string) => {
    const snapshot = await getProfileProgressSnapshot(userId)
    setUserProgress(snapshot)
  }

  const loadCertificates = (userId: string) => {
    const savedCertificates = localStorage.getItem(`codequest-certificates-${userId}`)
    if (!savedCertificates) {
      setCertificates(new Map())
      return
    }

    try {
      const parsed: GeneratedCertificate[] = JSON.parse(savedCertificates)
      const certMap = new Map<string, GeneratedCertificate>()
      parsed.forEach((certificate) => {
        certMap.set(certificate.languageName.toLowerCase(), certificate)
      })
      setCertificates(certMap)
    } catch (error) {
      console.error("Failed to parse certificates", error)
      setCertificates(new Map())
    }
  }

  const openCertificateByLanguage = (languageName: string) => {
    const certificate = certificates.get(languageName.toLowerCase())
    if (!certificate) return
    setSelectedCertificate(certificate)
    setShowCertificateModal(true)
  }

  const languages = [
    { name: "Python", key: "python" as const, icon: "/Python-Logo.png", color: "from-yellow-400 to-yellow-600" },
    { name: "Java", key: "java" as const, icon: "/Java-Logo.png", color: "from-orange-400 to-red-600" },
    { name: "C++", key: "cpp" as const, icon: "/C++-Logo.png", color: "from-blue-400 to-blue-600" },
  ]

  if (!user) {
    return null
  }

  const statsTotalXP = userProgress.totalXP
  const unlockedAchievements = userProgress.achievements.filter((achievement) => achievement.unlocked).length
  const badgeTiers = [
    {
      name: "Bronze",
      minXP: 0,
      color: "bg-amber-100 text-amber-800 border-amber-300",
      fillColor: "bg-blue-600",
      icon: "🥉",
    },
    {
      name: "Silver",
      minXP: 500,
      color: "bg-slate-100 text-slate-700 border-slate-300",
      fillColor: "bg-blue-600",
      icon: "🥈",
    },
    {
      name: "Gold",
      minXP: 1500,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      fillColor: "bg-blue-600",
      icon: "🥇",
    },
    {
      name: "Platinum",
      minXP: 3000,
      color: "bg-cyan-100 text-cyan-800 border-cyan-300",
      fillColor: "bg-blue-600",
      icon: "💎",
    },
  ] as const
  const currentTierIndex = badgeTiers.reduce((acc, tier, index) => (userProgress.totalXP >= tier.minXP ? index : acc), 0)
  const currentTier = badgeTiers[currentTierIndex]
  const nextTier = currentTierIndex < badgeTiers.length - 1 ? badgeTiers[currentTierIndex + 1] : null
  const currentTierStart = currentTier.minXP
  const currentTierEnd = nextTier ? nextTier.minXP : currentTier.minXP + 1000
  const tierRange = Math.max(1, currentTierEnd - currentTierStart)
  const tierProgress = Math.min(100, Math.max(0, ((userProgress.totalXP - currentTierStart) / tierRange) * 100))
  const xpRemaining = nextTier ? Math.max(0, nextTier.minXP - userProgress.totalXP) : 0

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
                    <span className={`px-3 py-1 rounded-full text-sm border font-semibold ${currentTier.color} self-center md:self-auto`}>
                      {currentTier.name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{joinedDateLabel}</span>
                    </div>
                  </div>
                  
                  {/* Badge Progress */}
                  <div className="mt-6 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-full rounded-full bg-gray-300 overflow-hidden">
                          <div
                            className={`h-full ${currentTier.fillColor} transition-all duration-500`}
                            style={{ width: `${tierProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 whitespace-nowrap">{userProgress.totalXP} XP</span>
                      </div>
                      <p className="text-xs text-slate-500 text-right">
                        {nextTier ? `${xpRemaining} XP remaining to ${nextTier.name}` : "Max tier reached"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Languages Progress */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Level Progress
              </h2>

              {languages.map((lang) => {
                const progress = userProgress[lang.key]
                const levelPercentage = progress.challengeTotal > 0 ? (progress.challengeCompleted / progress.challengeTotal) * 100 : 0

                return (
                  <Card key={`level-progress-${lang.name}`} className="overflow-hidden bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                    <div className={`h-2 ${lang.color}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={lang.icon} alt={lang.name} className="w-16 h-16 object-contain" />
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{lang.name}</h3>
                            <p className="text-sm text-slate-500">
                              {progress.challengeCompleted} of {progress.challengeTotal} levels completed
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Progress value={levelPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{Math.round(levelPercentage)}% complete</span>
                          <span>{progress.challengeTotal - progress.challengeCompleted} levels remaining</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-6 h-6 text-blue-600" />
                Learning Progress
              </h2>
              
              {languages.map((lang) => {
                const progress = userProgress[lang.key]
                const percentage = progress.learningTotal > 0 ? (progress.learningCompleted / progress.learningTotal) * 100 : 0

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
                              {progress.learningCompleted} of {progress.learningTotal} chapters completed
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{Math.round(percentage)}% complete</span>
                          <span>{progress.learningTotal - progress.learningCompleted} chapters remaining</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          if (percentage === 100) {
                            openCertificateByLanguage(lang.name)
                            return
                          }
                          router.push("/learning")
                        }}
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-700 text-white"
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
                    <span className="text-xl font-bold text-amber-600">{statsTotalXP}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-slate-700">Current Streak</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{userProgress.currentStreak} days</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-slate-700">Achievements</span>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">{unlockedAchievements}</span>
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
                  <div className="grid grid-cols-1 gap-3">
                    {userProgress.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all ${
                          achievement.unlocked
                            ? "bg-linear-to-r from-amber-50 to-amber-100 border-amber-200 hover:shadow-md"
                            : "bg-slate-50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-3xl shrink-0 ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{achievement.name}</h3>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <p className="text-sm text-slate-600">{achievement.description}</p>
                              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                                ({achievement.current}/{achievement.target})
                              </span>
                            </div>
                            {!achievement.unlocked && (
                              <div className="mt-3">
                                <Progress value={(achievement.current / achievement.target) * 100} className="h-1.5" />
                                <p className="text-xs text-slate-500 text-right mt-1">{Math.round((achievement.current / achievement.target) * 100)}%</p>
                              </div>
                            )}
                            {achievement.unlocked && (
                              <p className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium inline-block mt-2">
                                ✓ Unlocked
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showCertificateModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="rounded-xl border-4 border-amber-200 bg-linear-to-br from-amber-50 to-white p-8 text-center">
                <Award className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-2">Certificate of Completion</p>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">CodeQuest Achievement</h3>

                <p className="text-slate-600 mb-2">This certifies that</p>
                <p className="text-2xl font-bold text-slate-900 mb-5">{selectedCertificate.userName}</p>

                <p className="text-slate-600 mb-2">has successfully completed all {selectedCertificate.totalChapters} chapters in</p>
                <p className="text-xl font-semibold text-blue-700 mb-6">{selectedCertificate.languageName}</p>

                <div className="text-sm text-slate-500 space-y-1">
                  <p>Certificate ID: {selectedCertificate.id}</p>
                  <p>Issued on: {new Date(selectedCertificate.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={() => setShowCertificateModal(false)}
                  className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300 shadow-md hover:shadow-lg active:translate-y-px active:shadow-sm transition-all"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}