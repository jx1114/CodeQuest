"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Lock, CheckCircle, X, ChevronLeft } from "lucide-react"
import { getCompletedChallengeLevels, markChallengeLevelComplete } from "@/lib/progress"

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
  title: string
  scenario: string
  requirements: string[]
  starter_code: string
  expected_output: string
  chapter_hint: string
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
  const [executionOutput, setExecutionOutput] = useState("")
  const [executionError, setExecutionError] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    loadLevels()
    if (parsedUser?.id) {
      void loadCompletedLevels(parsedUser.id)
    }
  }, [router])

  const loadCompletedLevels = async (userId: string) => {
    const completed = await getCompletedChallengeLevels(userId)
    setCompletedLevels(completed)
  }

  const loadLevels = () => {
    const mockLevels: ChallengeLevel[] = [
      { id: "1", level_number: 1, title: "Python: Intro & Setup", difficulty: "easy", language: "Python" },
      { id: "2", level_number: 2, title: "Python: Variables", difficulty: "easy", language: "Python" },
      { id: "3", level_number: 3, title: "Python: Control Flow", difficulty: "easy", language: "Python" },
      { id: "4", level_number: 4, title: "Python: Functions", difficulty: "medium", language: "Python" },
      { id: "5", level_number: 5, title: "Python: Data Structures", difficulty: "medium", language: "Python" },
      { id: "6", level_number: 6, title: "Java: Intro & Setup", difficulty: "easy", language: "Java" },
      { id: "7", level_number: 7, title: "Java: Variables", difficulty: "easy", language: "Java" },
      { id: "8", level_number: 8, title: "Java: Control Flow", difficulty: "medium", language: "Java" },
      { id: "9", level_number: 9, title: "Java: Functions", difficulty: "medium", language: "Java" },
      { id: "10", level_number: 10, title: "Java: Data Structures", difficulty: "hard", language: "Java" },
      { id: "11", level_number: 11, title: "C++: Intro & Setup", difficulty: "easy", language: "C++" },
      { id: "12", level_number: 12, title: "C++: Variables", difficulty: "easy", language: "C++" },
      { id: "13", level_number: 13, title: "C++: Control Flow", difficulty: "medium", language: "C++" },
      { id: "14", level_number: 14, title: "C++: Functions", difficulty: "medium", language: "C++" },
      { id: "15", level_number: 15, title: "C++: Data Structures", difficulty: "hard", language: "C++" },
    ]
    setLevels(mockLevels)
  }

  const loadChallenges = (levelId: string) => {
    const challengeByLevel: Record<string, Challenge> = {
      "1": {
        id: "c1",
        level_id: "1",
        title: "Warehouse Receipt Generator",
        scenario:
          "You are building a warehouse tool. Print a receipt for one order with item, quantity, and total units to ship.",
        requirements: [
          "Use variables for item name and quantity",
          "Print exactly 3 lines in the expected format",
          "Do not print extra text",
        ],
        starter_code: "item = \"USB Cable\"\nquantity = 4\n# Write code below",
        expected_output: "Order Item: USB Cable\nQuantity: 4\nUnits to Ship: 4",
        chapter_hint: "Learning > Python > Chapter 1: Introduction & Setup",
      },
      "2": {
        id: "c2",
        level_id: "2",
        title: "Daily Sales Summary",
        scenario:
          "A cafe wants a quick daily summary. Calculate revenue using fixed values and print rounded to 2 decimals.",
        requirements: [
          "Set cups_sold = 27 and price = 3.5",
          "Compute revenue",
          "Print: Revenue: 94.50",
        ],
        starter_code: "cups_sold = 27\nprice = 3.5\n# Write code below",
        expected_output: "Revenue: 94.50",
        chapter_hint: "Learning > Python > Chapter 2: Variables & Data Types",
      },
      "3": {
        id: "c3",
        level_id: "3",
        title: "Shipping Priority Decision",
        scenario:
          "An e-commerce system chooses shipping mode by package weight.",
        requirements: [
          "Set weight = 7",
          "If weight > 5 print Express, else Standard",
          "Output must be exactly one line",
        ],
        starter_code: "weight = 7\n# Write code below",
        expected_output: "Shipping Mode: Express",
        chapter_hint: "Learning > Python > Chapter 3: Control Flow",
      },
      "4": {
        id: "c4",
        level_id: "4",
        title: "Invoice Discount Function",
        scenario:
          "Create a function to apply a fixed discount and print the final invoice total.",
        requirements: [
          "Create function apply_discount(amount, discount)",
          "Call with 250 and 30",
          "Print exactly: Final Total: 220",
        ],
        starter_code: "# Write code below",
        expected_output: "Final Total: 220",
        chapter_hint: "Learning > Python > Chapter 4: Functions",
      },
      "5": {
        id: "c5",
        level_id: "5",
        title: "Inventory Lookup Report",
        scenario:
          "Use a dictionary to store stock and print stock for pen and notebook.",
        requirements: [
          "Create dictionary stock with pen=12 and notebook=5",
          "Print two lines in expected order",
          "Match spacing and casing exactly",
        ],
        starter_code: "# Write code below",
        expected_output: "pen: 12\nnotebook: 5",
        chapter_hint: "Learning > Python > Chapter 5: Data Structures",
      },
      "6": {
        id: "c6",
        level_id: "6",
        title: "Ticket Confirmation (Java)",
        scenario:
          "Create a Java program that prints a confirmation message for a booked ticket.",
        requirements: [
          "Program must compile and run",
          "Print two lines exactly",
          "Use class Main",
        ],
        starter_code: "public class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        expected_output: "Booking Confirmed\nSeat: A12",
        chapter_hint: "Learning > Java > Chapter 1: Introduction & Setup",
      },
      "7": {
        id: "c7",
        level_id: "7",
        title: "Water Bill (Java)",
        scenario: "Calculate total bill using usage and per-unit price.",
        requirements: [
          "usage = 18, unitPrice = 1.75",
          "Print one line: Bill: 31.50",
          "Use formatted output",
        ],
        starter_code: "public class Main {\n  public static void main(String[] args) {\n    int usage = 18;\n    double unitPrice = 1.75;\n    // Write code here\n  }\n}",
        expected_output: "Bill: 31.50",
        chapter_hint: "Learning > Java > Chapter 2: Variables & Data Types",
      },
      "8": {
        id: "c8",
        level_id: "8",
        title: "Loan Risk Flag (Java)",
        scenario: "Flag high risk when credit score is below threshold.",
        requirements: [
          "score = 580",
          "If score < 600 print Risk: High else Risk: Low",
          "Single-line output only",
        ],
        starter_code: "public class Main {\n  public static void main(String[] args) {\n    int score = 580;\n    // Write code here\n  }\n}",
        expected_output: "Risk: High",
        chapter_hint: "Learning > Java > Chapter 3: Control Flow",
      },
      "9": {
        id: "c9",
        level_id: "9",
        title: "Delivery ETA Function (Java)",
        scenario: "Write a function that adds preparation and travel minutes.",
        requirements: [
          "Function: eta(int prep, int travel)",
          "Call eta(12, 18)",
          "Print: ETA Minutes: 30",
        ],
        starter_code: "public class Main {\n  // Write function here\n  public static void main(String[] args) {\n    // Call function and print\n  }\n}",
        expected_output: "ETA Minutes: 30",
        chapter_hint: "Learning > Java > Chapter 4: Functions",
      },
      "10": {
        id: "c10",
        level_id: "10",
        title: "Store Price Lookup (Java)",
        scenario: "Use HashMap to print prices for rice and milk.",
        requirements: [
          "Use HashMap<String, Integer>",
          "Set rice=12, milk=8",
          "Print two lines in order",
        ],
        starter_code: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        expected_output: "rice: 12\nmilk: 8",
        chapter_hint: "Learning > Java > Chapter 5: Data Structures",
      },
      "11": {
        id: "c11",
        level_id: "11",
        title: "Route Planner Start (C++)",
        scenario: "Print a route planning start message for a logistics app.",
        requirements: [
          "Use iostream",
          "Print two lines exactly",
          "Program must include main",
        ],
        starter_code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "Route Ready\nTruck: T-17",
        chapter_hint: "Learning > C++ > Chapter 1: Introduction & Setup",
      },
      "12": {
        id: "c12",
        level_id: "12",
        title: "Fuel Cost (C++)",
        scenario: "Calculate simple fuel cost and print with 2 decimals.",
        requirements: [
          "liters = 14, pricePerLiter = 2.4",
          "Print exactly: Fuel Cost: 33.60",
          "Use fixed precision formatting",
        ],
        starter_code: "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  int liters = 14;\n  double pricePerLiter = 2.4;\n  // Write code here\n  return 0;\n}",
        expected_output: "Fuel Cost: 33.60",
        chapter_hint: "Learning > C++ > Chapter 2: Variables & Data Types",
      },
      "13": {
        id: "c13",
        level_id: "13",
        title: "Temperature Alert (C++)",
        scenario: "Classify temperature as Hot or Normal.",
        requirements: [
          "temp = 33",
          "If temp >= 30 print Alert: Hot else Alert: Normal",
          "One output line",
        ],
        starter_code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int temp = 33;\n  // Write code here\n  return 0;\n}",
        expected_output: "Alert: Hot",
        chapter_hint: "Learning > C++ > Chapter 3: Control Flow",
      },
      "14": {
        id: "c14",
        level_id: "14",
        title: "Packing Time Function (C++)",
        scenario: "Create function to compute packing time for boxes.",
        requirements: [
          "Function: packingTime(int boxes)",
          "Each box takes 3 minutes",
          "For boxes=6 print: Packing Minutes: 18",
        ],
        starter_code: "#include <iostream>\nusing namespace std;\n\n// Write function here\n\nint main() {\n  // Call function and print\n  return 0;\n}",
        expected_output: "Packing Minutes: 18",
        chapter_hint: "Learning > C++ > Chapter 4: Functions",
      },
      "15": {
        id: "c15",
        level_id: "15",
        title: "Exam Score Lookup (C++)",
        scenario: "Use map to store and print score for Bob.",
        requirements: [
          "Create map<string, int> scores",
          "Insert Bob=88",
          "Print exactly: Bob: 88",
        ],
        starter_code: "#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "Bob: 88",
        chapter_hint: "Learning > C++ > Chapter 5: Data Structures",
      },
    }

    const selectedChallenge = challengeByLevel[levelId]
    setChallenges(selectedChallenge ? [selectedChallenge] : [])
    setCurrentChallengeIndex(0)
    setFeedback(null)
    setExecutionOutput("")
    setExecutionError("")
    setUserAnswer(selectedChallenge?.starter_code ?? "")
  }

  const normalizeOutput = (value: string) =>
    value
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim()

  const submitAnswer = async () => {
    if (!currentChallenge || !selectedLevel) return

    setIsRunning(true)
    setExecutionError("")
    setExecutionOutput("")

    let isCorrect = false

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLevel.language,
          code: userAnswer,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setExecutionError(result?.error ?? "Execution failed")
        setFeedback({
          correct: false,
          message: "Execution failed.",
        })
        return
      }

      const output = (result?.output ?? "").toString()
      setExecutionOutput(output || "(no output)")

      isCorrect = normalizeOutput(output) === normalizeOutput(currentChallenge.expected_output)
      setFeedback({
        correct: isCorrect,
        message: isCorrect
          ? "Correct output! Great solution."
          : "Output does not match expected output.",
      })
    } catch {
      setExecutionError("Execution failed. Please try again.")
      setFeedback({
        correct: false,
        message: "Execution failed.",
      })
      return
    } finally {
      setIsRunning(false)
    }

    if (isCorrect && currentChallengeIndex === challenges.length - 1) {
      if (selectedLevel) {
        setCompletedLevels((prev) => new Set(prev).add(selectedLevel.id))
        if (user?.id) {
          await markChallengeLevelComplete({
            userId: user.id,
            levelId: selectedLevel.id,
            language: selectedLevel.language,
          })
        }
      }
    }
  }

  const goToLearningChapter = (chapterHint: string) => {
    // Parse chapter_hint: "Learning > Python > Chapter 2: Variables & Data Types"
    const parts = chapterHint.split(">")
    if (parts.length < 3) return

    const language = parts[1].trim() // e.g., "Python"
    const chapterText = parts[2].trim() // e.g., "Chapter 2: Variables & Data Types"
    const chapterNumber = parseInt(chapterText.split(":")[0].replace("Chapter", "").trim())

    // Store navigation info in sessionStorage
    sessionStorage.setItem(
      "learningNavigation",
      JSON.stringify({
        language,
        chapterNumber,
      })
    )

    // Navigate to learning page
    router.push("/learning")
  }

  const nextChallenge = () => {
    if (!selectedLevel) return

    const nextLevel = levels.find((level) => level.level_number === selectedLevel.level_number + 1)

    if (nextLevel) {
      setSelectedLevel(nextLevel)
      loadChallenges(nextLevel.id)
      return
    }

    setSelectedLevel(null)
    setChallenges([])
    setCurrentChallengeIndex(0)
    setExecutionOutput("")
    setExecutionError("")
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{currentChallenge.title}</h4>
                <p className="text-slate-700">{currentChallenge.scenario}</p>
                <ul className="mt-3 space-y-1 list-disc list-inside text-sm text-slate-600">
                  {currentChallenge.requirements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Expected Output</p>
                <pre className="rounded-md bg-slate-900 p-3 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
                  <code>{currentChallenge.expected_output}</code>
                </pre>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Write your code</p>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your solution code here"
                  className="min-h-48 w-full rounded-md border border-slate-300 bg-white p-3 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {(executionOutput || executionError) && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Your Output</p>
                  <pre className="rounded-md bg-slate-900 p-3 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
                    <code>{executionError || executionOutput}</code>
                  </pre>
                </div>
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
                  <Button onClick={() => void submitAnswer()} disabled={!userAnswer || isRunning} className="w-full bg-blue-600 text-white hover:bg-blue-700" size="lg">
                    {isRunning ? "Running..." : "Submit Code"}
                  </Button>
                ) : (
                  <>
                    {feedback.correct ? (
                      <Button onClick={nextChallenge} className="w-full bg-blue-600 text-white hover:bg-blue-700" size="lg">
                        Next Challenge Level
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={() => {
                            setFeedback(null)
                            setExecutionOutput("")
                            setExecutionError("")
                          }}
                          className="w-full bg-slate-700 text-white hover:bg-slate-800"
                          size="lg"
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={() => goToLearningChapter(currentChallenge.chapter_hint)}
                          className="w-full bg-amber-600 text-white hover:bg-amber-700"
                          size="lg"
                        >
                          Continue Learning
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}