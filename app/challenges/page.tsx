"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Lock, CheckCircle, X, ChevronLeft } from "lucide-react"

interface ChallengeLevel {
  id: string
  level_number: number
  title: string
  difficulty: "easy" | "medium" | "hard"
  language: "Python" | "Java" | "C++"
}

interface Challenge {
  id: string
  level_id: string
  type: "multiple_choice" | "fill_blank"
  question: string
  code_snippet?: string
  options?: string[]
  correct_answer: string
  explanation: string
}

export default function ChallengesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [levels, setLevels] = useState<ChallengeLevel[]>([])
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    setUser(JSON.parse(userData))
    loadLevels()
  }, [router])

  const loadLevels = () => {
    // Mock data - replace with your API call
    const mockLevels: ChallengeLevel[] = [
      { id: "1", level_number: 1, title: "Python Basics", difficulty: "easy", language: "Python" },
      { id: "2", level_number: 2, title: "Variables & Data Types", difficulty: "easy", language: "Python" },
      { id: "3", level_number: 3, title: "Control Flow", difficulty: "medium", language: "Java" },
      { id: "4", level_number: 4, title: "Functions", difficulty: "medium", language: "Java" },
      { id: "5", level_number: 5, title: "Object-Oriented Programming", difficulty: "hard", language: "C++" },
    ]
    setLevels(mockLevels)
  }

  const loadChallenges = (levelId: string) => {
    // Mock challenges - replace with your API call
    const mockChallenges: Challenge[] = [
      {
        id: "c1",
        level_id: levelId,
        type: "multiple_choice",
        question: "What is the correct way to print 'Hello World' in Python?",
        options: ["echo 'Hello World'", "print('Hello World')", "console.log('Hello World')", "printf('Hello World')"],
        correct_answer: "print('Hello World')",
        explanation: "In Python, we use the print() function to output text to the console.",
      },
      {
        id: "c2",
        level_id: levelId,
        type: "fill_blank",
        question: "What keyword is used to create a function in Python?",
        code_snippet: "_____ greet():\n    print('Hello')",
        correct_answer: "def",
        explanation: "The 'def' keyword is used to define functions in Python.",
      },
    ]
    setChallenges(mockChallenges)
    setCurrentChallengeIndex(0)
    setFeedback(null)
    setUserAnswer("")
  }

  const submitAnswer = () => {
    if (!currentChallenge) return

    const isCorrect = userAnswer.trim().toLowerCase() === currentChallenge.correct_answer.toLowerCase()

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Correct! Well done!" : currentChallenge.explanation,
    })

    if (isCorrect && currentChallengeIndex === challenges.length - 1) {
      setCompletedLevels((prev) => new Set(prev).add(selectedLevel!.id))
    }
  }

  const nextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex((prev) => prev + 1)
      setUserAnswer("")
      setFeedback(null)
    } else {
      setSelectedLevel(null)
      setChallenges([])
      setCurrentChallengeIndex(0)
    }
  }

  const isLevelUnlocked = (levelNumber: number) => {
    if (levelNumber === 1) return true
    const previousLevel = levels.find((l) => l.level_number === levelNumber - 1)
    return previousLevel ? completedLevels.has(previousLevel.id) : false
  }

  const currentChallenge = challenges[currentChallengeIndex]

  // Level selection view
  if (!selectedLevel) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Challenge Levels</h2>
                <p className="text-slate-600">Test your programming skills with progressive challenges</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((level) => {
                const unlocked = isLevelUnlocked(level.level_number)
                const completed = completedLevels.has(level.id)

                return (
                  <Card
                    key={level.id}
                    className={`cursor-pointer transition-all bg-white shadow-sm border-0 ${
                      unlocked ? "hover:shadow-md" : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => unlocked && (setSelectedLevel(level), loadChallenges(level.id))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            completed ? "bg-green-50 border border-green-200" : unlocked ? "bg-blue-50 border border-blue-200" : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : unlocked ? (
                            <Trophy className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Lock className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            level.language === "Python"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : level.language === "Java"
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {level.language}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Level {level.level_number}</h3>
                      <p className="text-sm text-slate-600">{level.title}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Challenge view
  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Challenges Available</h3>
              <Button onClick={() => setSelectedLevel(null)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                Back to Levels
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLevel(null)
              setChallenges([])
            }}
            className="mb-6 bg-white shadow-sm border-0 hover:shadow-md"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Levels
          </Button>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-slate-900">
                  Level {selectedLevel.level_number}: {selectedLevel.title}
                </CardTitle>
                <span className="text-sm text-slate-600">
                  {currentChallengeIndex + 1} / {challenges.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-700 text-lg">{currentChallenge.question}</p>

              {currentChallenge.code_snippet && (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto border border-slate-700">
                  <code>{currentChallenge.code_snippet}</code>
                </pre>
              )}

              {currentChallenge.type === "multiple_choice" && currentChallenge.options && (
                <div className="space-y-3">
                  {currentChallenge.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setUserAnswer(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        userAnswer === option ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentChallenge.type !== "multiple_choice" && (
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="text-base border-slate-200"
                />
              )}

              {feedback && (
                <div
                  className={`p-4 rounded-lg flex items-start space-x-3 ${
                    feedback.correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  {feedback.correct ? (
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${feedback.correct ? "text-green-900" : "text-red-900"}`}>
                      {feedback.correct ? "Correct!" : "Incorrect"}
                    </p>
                    <p className={feedback.correct ? "text-green-700" : "text-red-700"}>{feedback.message}</p>
                  </div>
                </div>
              )}

              <div>
                {!feedback ? (
                  <Button onClick={submitAnswer} disabled={!userAnswer} className="w-full bg-blue-600 text-white hover:bg-blue-700" size="lg">
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={nextChallenge} className="w-full bg-blue-600 text-white hover:bg-blue-700" size="lg">
                    {currentChallengeIndex < challenges.length - 1 ? "Next Challenge" : "Complete Level"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}