"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle, X, ChevronLeft, Lock } from "lucide-react"
import AchievementUnlockModal from "@/components/AchievementUnlockModal"
import {
  getCompletedChallengeLevels,
  getNewlyUnlockedAchievements,
  getProfileProgressSnapshot,
  markChallengeLevelComplete,
  type ProfileAchievement,
  type ProfileProgressSnapshot,
} from "@/lib/progress"

interface ChallengeLevel {
  id: string
  level_number: number
  title: string
  difficulty: "easy" | "medium" | "hard"
}

interface Challenge {
  id: string
  level_id: string
  title: string
  scenario: string
  requirements: string[]
  starter_code_python: string
  starter_code_java: string
  starter_code_cpp: string
  expected_output: string
  chapter_hint: string
}

interface ChallengeTestCase {
  id: string
  variables: Record<string, string | number>
  expectedOutput: string
}

interface ChallengeTestCaseResult {
  id: string
  expectedOutput: string
  userOutput: string
  passed: boolean
}

interface Language {
  id: string
  name: "Python" | "Java" | "C++"
  description: string
  icon: string
}

export default function ChallengesPage() {
  const router = useRouter()
  const pendingAchievementStorageKey = "pendingChallengeAchievementUnlocks"
  const [user, setUser] = useState<any>(null)
  const [levels, setLevels] = useState<ChallengeLevel[]>([])
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<"Python" | "Java" | "C++" | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [executionOutput, setExecutionOutput] = useState("")
  const [executionError, setExecutionError] = useState("")
  const [testCaseResults, setTestCaseResults] = useState<ChallengeTestCaseResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [completedLevels, setCompletedLevels] = useState<Map<string, Set<string>>>(new Map()) // level_id -> Set<languages>
  const [achievementUnlocks, setAchievementUnlocks] = useState<ProfileAchievement[]>([])
  const [showAchievementUnlockModal, setShowAchievementUnlockModal] = useState(false)

  useEffect(() => {
    if (selectedLevel || selectedLanguage || showAchievementUnlockModal || achievementUnlocks.length > 0) {
      return
    }

    const storedUnlocks = sessionStorage.getItem(pendingAchievementStorageKey)
    if (!storedUnlocks) return

    try {
      const parsedUnlocks = JSON.parse(storedUnlocks) as ProfileAchievement[]
      if (Array.isArray(parsedUnlocks) && parsedUnlocks.length > 0) {
        setAchievementUnlocks(parsedUnlocks)
        setShowAchievementUnlockModal(true)
      }
    } catch (error) {
      console.warn("Failed to read pending achievement unlocks", error)
    } finally {
      sessionStorage.removeItem(pendingAchievementStorageKey)
    }
  }, [achievementUnlocks.length, selectedLanguage, selectedLevel, showAchievementUnlockModal])

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
    // Build a map of level_id -> Set<languages>
    const levelLanguageMap = new Map<string, Set<string>>()
    for (const item of completed) {
      // Parse: "level_1_Python" -> ["level_1", "Python"]
      const parts = item.split("_")
      if (parts.length >= 2) {
        const levelId = parts.slice(0, -1).join("_")
        const language = parts[parts.length - 1]
        if (!levelLanguageMap.has(levelId)) {
          levelLanguageMap.set(levelId, new Set())
        }
        levelLanguageMap.get(levelId)?.add(language)
      }
    }
    setCompletedLevels(levelLanguageMap)
  }

  const loadLevels = () => {
    const mockLevels: ChallengeLevel[] = [
      { id: "level_1", level_number: 1, title: "Warehouse Receipt Generator", difficulty: "easy" },
      { id: "level_2", level_number: 2, title: "Daily Sales Summary", difficulty: "easy" },
      { id: "level_3", level_number: 3, title: "Shipping Priority Decision", difficulty: "easy" },
      { id: "level_4", level_number: 4, title: "Invoice Discount Function", difficulty: "medium" },
      { id: "level_5", level_number: 5, title: "Inventory Lookup Report", difficulty: "medium" },
      { id: "level_6", level_number: 6, title: "Ticket Confirmation", difficulty: "medium" },
      { id: "level_7", level_number: 7, title: "Water Bill Calculator", difficulty: "hard" },
      { id: "level_8", level_number: 8, title: "Loan Risk Flag", difficulty: "hard" },
      { id: "level_9", level_number: 9, title: "Delivery ETA Function", difficulty: "hard" },
      { id: "level_10", level_number: 10, title: "Store Price Lookup", difficulty: "hard" },
    ]
    setLevels(mockLevels)
  }

  const loadChallenges = (levelId: string) => {
    const challengeByLevel: Record<string, Challenge> = {
      "level_1": {
        id: "c1",
        level_id: "level_1",
        title: "Warehouse Receipt Generator",
        scenario:
          "You are building a warehouse tool. Print a receipt for one order with item, quantity, and total units to ship.",
        requirements: [
          "Use variables for item name and quantity",
          "Print exactly 3 lines in the expected format",
          "Do not print extra text",
        ],
        starter_code_python: "# Variables 'item' and 'quantity' are provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variables 'item' and 'quantity' are provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Variables 'item' and 'quantity' are provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Order Item: USB Cable\nQuantity: 4\nUnits to Ship: 4",
        chapter_hint: "Learning > Python > Chapter 1: Introduction & Setup",
      },
      "level_2": {
        id: "c2",
        level_id: "level_2",
        title: "Daily Sales Summary",
        scenario:
          "A cafe wants a quick daily summary. Calculate revenue using fixed values and print rounded to 2 decimals.",
        requirements: [
          "Set cups_sold = 27 and price = 3.5",
          "Compute revenue",
          "Print: Revenue: 94.50",
        ],
        starter_code_python: "# Variables 'cups_sold' and 'price' are provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variables 'cups_sold' and 'price' are provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  // Variables 'cups_sold' and 'price' are provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Revenue: 94.50",
        chapter_hint: "Learning > Python > Chapter 2: Variables & Data Types",
      },
      "level_3": {
        id: "c3",
        level_id: "level_3",
        title: "Shipping Priority Decision",
        scenario:
          "An e-commerce system chooses shipping mode by package weight.",
        requirements: [
          "Set weight = 7",
          "If weight > 5 print Express, else Standard",
          "Output must be exactly one line",
        ],
        starter_code_python: "# Variable 'weight' is provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variable 'weight' is provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Variable 'weight' is provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Shipping Mode: Express",
        chapter_hint: "Learning > Python > Chapter 3: Control Flow",
      },
      "level_4": {
        id: "c4",
        level_id: "level_4",
        title: "Invoice Discount Function",
        scenario:
          "Create a function to apply a fixed discount and print the final invoice total.",
        requirements: [
          "Create function apply_discount(amount, discount)",
          "Call with 250 and 30",
          "Print exactly: Final Total: 220",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "public class Main {\n  // Write function here\n  public static void main(String[] args) {\n    // Call function and print\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\n// Write function here\n\nint main() {\n  // Call function and print\n  return 0;\n}",
        expected_output: "Final Total: 220",
        chapter_hint: "Learning > Python > Chapter 4: Functions",
      },
      "level_5": {
        id: "c5",
        level_id: "level_5",
        title: "Inventory Lookup Report",
        scenario:
          "Use a dictionary to store stock and print stock for pen and notebook.",
        requirements: [
          "Create dictionary stock with pen=12 and notebook=5",
          "Print two lines in expected order",
          "Match spacing and casing exactly",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "pen: 12\nnotebook: 5",
        chapter_hint: "Learning > Python > Chapter 5: Data Structures",
      },
      "level_6": {
        id: "c6",
        level_id: "level_6",
        title: "Ticket Confirmation",
        scenario:
          "Create a program that prints a confirmation message for a booked ticket.",
        requirements: [
          "Program must compile and run",
          "Print two lines exactly",
          "Use standard output",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "Booking Confirmed\nSeat: A12",
        chapter_hint: "Learning > Java > Chapter 1: Introduction & Setup",
      },
      "level_7": {
        id: "c7",
        level_id: "level_7",
        title: "Water Bill Calculator",
        scenario: "Calculate total bill using usage and per-unit price.",
        requirements: [
          "usage = 18, unitPrice = 1.75",
          "Print one line: Bill: 31.50",
          "Use formatted output",
        ],
        starter_code_python: "# Variables 'usage' and 'unitPrice' are provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variables 'usage' and 'unitPrice' are provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  // Variables 'usage' and 'unitPrice' are provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Bill: 31.50",
        chapter_hint: "Learning > Java > Chapter 2: Variables & Data Types",
      },
      "level_8": {
        id: "c8",
        level_id: "level_8",
        title: "Loan Risk Flag",
        scenario: "Flag high risk when credit score is below threshold.",
        requirements: [
          "score = 580",
          "If score < 600 print Risk: High else Risk: Low",
          "Single-line output only",
        ],
        starter_code_python: "# Variable 'score' is provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variable 'score' is provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Variable 'score' is provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Risk: High",
        chapter_hint: "Learning > Java > Chapter 3: Control Flow",
      },
      "level_9": {
        id: "c9",
        level_id: "level_9",
        title: "Delivery ETA Function",
        scenario: "Write a function that adds preparation and travel minutes.",
        requirements: [
          "Create function eta(int prep, int travel)",
          "Call eta(12, 18)",
          "Print: ETA Minutes: 30",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "public class Main {\n  // Write function here\n  public static void main(String[] args) {\n    // Call function and print\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\n// Write function here\n\nint main() {\n  // Call function and print\n  return 0;\n}",
        expected_output: "ETA Minutes: 30",
        chapter_hint: "Learning > Java > Chapter 4: Functions",
      },
      "level_10": {
        id: "c10",
        level_id: "level_10",
        title: "Store Price Lookup",
        scenario: "Use a map to store and print prices for rice and milk.",
        requirements: [
          "Use appropriate data structure",
          "Set rice=12, milk=8",
          "Print two lines in order",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "rice: 12\nmilk: 8",
        chapter_hint: "Learning > Java > Chapter 5: Data Structures",
      },
    }

    const selectedChallenge = challengeByLevel[levelId]
    setChallenges(selectedChallenge ? [selectedChallenge] : [])
    setCurrentChallengeIndex(0)
    setFeedback(null)
    setExecutionOutput("")
    setExecutionError("")
    setTestCaseResults([])
    
    // Set starter code based on selected language
    if (selectedChallenge && selectedLanguage) {
      const starterCodeKey = `starter_code_${selectedLanguage.toLowerCase()}`
      const starterCode = selectedChallenge[starterCodeKey as keyof Challenge] as string || ""
      setUserAnswer(starterCode)
    }
  }

  const normalizeOutput = (value: string) =>
    value
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim()

  const formatVariables = (variables: Record<string, string | number>) =>
    Object.entries(variables)
      .map(([key, value]) => `${key}=${typeof value === "string" ? `"${value}"` : value}`)
      .join(", ")

  const getLevelTestCases = (levelId: string): ChallengeTestCase[] => {
    switch (levelId) {
      case "level_1":
        return [
          { id: "tc-1", variables: { item: "USB Cable", quantity: 4 }, expectedOutput: "Order Item: USB Cable\nQuantity: 4\nUnits to Ship: 4" },
          { id: "tc-2", variables: { item: "Mouse", quantity: 2 }, expectedOutput: "Order Item: Mouse\nQuantity: 2\nUnits to Ship: 2" },
          { id: "tc-3", variables: { item: "Keyboard", quantity: 7 }, expectedOutput: "Order Item: Keyboard\nQuantity: 7\nUnits to Ship: 7" },
          { id: "tc-4", variables: { item: "Webcam", quantity: 1 }, expectedOutput: "Order Item: Webcam\nQuantity: 1\nUnits to Ship: 1" },
        ]
      case "level_2":
        return [
          { id: "tc-1", variables: { cups_sold: 27, price: 3.5 }, expectedOutput: "Revenue: 94.50" },
          { id: "tc-2", variables: { cups_sold: 10, price: 2.25 }, expectedOutput: "Revenue: 22.50" },
          { id: "tc-3", variables: { cups_sold: 8, price: 4.75 }, expectedOutput: "Revenue: 38.00" },
          { id: "tc-4", variables: { cups_sold: 15, price: 1.2 }, expectedOutput: "Revenue: 18.00" },
        ]
      case "level_3":
        return [
          { id: "tc-1", variables: { weight: 7 }, expectedOutput: "Shipping Mode: Express" },
          { id: "tc-2", variables: { weight: 2 }, expectedOutput: "Shipping Mode: Standard" },
          { id: "tc-3", variables: { weight: 5 }, expectedOutput: "Shipping Mode: Standard" },
          { id: "tc-4", variables: { weight: 12 }, expectedOutput: "Shipping Mode: Express" },
        ]
      case "level_4":
        return [
          { id: "tc-1", variables: { amount: 250, discount: 30 }, expectedOutput: "Final Total: 220" },
          { id: "tc-2", variables: { amount: 100, discount: 15 }, expectedOutput: "Final Total: 85" },
          { id: "tc-3", variables: { amount: 500, discount: 125 }, expectedOutput: "Final Total: 375" },
          { id: "tc-4", variables: { amount: 80, discount: 10 }, expectedOutput: "Final Total: 70" },
        ]
      case "level_5":
        return [
          { id: "tc-1", variables: { pen: 12, notebook: 5 }, expectedOutput: "pen: 12\nnotebook: 5" },
          { id: "tc-2", variables: { pen: 3, notebook: 9 }, expectedOutput: "pen: 3\nnotebook: 9" },
          { id: "tc-3", variables: { pen: 0, notebook: 2 }, expectedOutput: "pen: 0\nnotebook: 2" },
          { id: "tc-4", variables: { pen: 25, notebook: 11 }, expectedOutput: "pen: 25\nnotebook: 11" },
        ]
      case "level_6":
        return [
          { id: "tc-1", variables: { seat: "A12" }, expectedOutput: "Booking Confirmed\nSeat: A12" },
          { id: "tc-2", variables: { seat: "B03" }, expectedOutput: "Booking Confirmed\nSeat: B03" },
          { id: "tc-3", variables: { seat: "C09" }, expectedOutput: "Booking Confirmed\nSeat: C09" },
          { id: "tc-4", variables: { seat: "D21" }, expectedOutput: "Booking Confirmed\nSeat: D21" },
        ]
      case "level_7":
        return [
          { id: "tc-1", variables: { usage: 18, unitPrice: 1.75 }, expectedOutput: "Bill: 31.50" },
          { id: "tc-2", variables: { usage: 4, unitPrice: 2.5 }, expectedOutput: "Bill: 10.00" },
          { id: "tc-3", variables: { usage: 9, unitPrice: 3 }, expectedOutput: "Bill: 27.00" },
          { id: "tc-4", variables: { usage: 12, unitPrice: 1.2 }, expectedOutput: "Bill: 14.40" },
        ]
      case "level_8":
        return [
          { id: "tc-1", variables: { score: 580 }, expectedOutput: "Risk: High" },
          { id: "tc-2", variables: { score: 700 }, expectedOutput: "Risk: Low" },
          { id: "tc-3", variables: { score: 600 }, expectedOutput: "Risk: Low" },
          { id: "tc-4", variables: { score: 410 }, expectedOutput: "Risk: High" },
        ]
      case "level_9":
        return [
          { id: "tc-1", variables: { prep: 12, travel: 18 }, expectedOutput: "ETA Minutes: 30" },
          { id: "tc-2", variables: { prep: 5, travel: 8 }, expectedOutput: "ETA Minutes: 13" },
          { id: "tc-3", variables: { prep: 20, travel: 35 }, expectedOutput: "ETA Minutes: 55" },
          { id: "tc-4", variables: { prep: 0, travel: 9 }, expectedOutput: "ETA Minutes: 9" },
        ]
      case "level_10":
        return [
          { id: "tc-1", variables: { rice: 12, milk: 8 }, expectedOutput: "rice: 12\nmilk: 8" },
          { id: "tc-2", variables: { rice: 20, milk: 15 }, expectedOutput: "rice: 20\nmilk: 15" },
          { id: "tc-3", variables: { rice: 1, milk: 3 }, expectedOutput: "rice: 1\nmilk: 3" },
          { id: "tc-4", variables: { rice: 30, milk: 25 }, expectedOutput: "rice: 30\nmilk: 25" },
        ]
      default:
        return [
          { id: "tc-1", variables: {}, expectedOutput: "" },
          { id: "tc-2", variables: {}, expectedOutput: "" },
          { id: "tc-3", variables: {}, expectedOutput: "" },
          { id: "tc-4", variables: {}, expectedOutput: "" },
        ]
    }
  }

  const applyVariablesToCode = (
    code: string,
    language: "Python" | "Java" | "C++",
    levelId: string,
    variables: Record<string, string | number>
  ) => {
    const indent = (text: string, spaces: number) =>
      text
        .split("\n")
        .map((line) => `${" ".repeat(spaces)}${line}`)
        .join("\n")

    if (language === "Python") {
      const declarations = Object.entries(variables)
        .map(([name, value]) => `${name} = ${typeof value === "string" ? `"${value}"` : String(value)}`)
        .join("\n")

      return declarations ? `${declarations}\n${code}` : code
    }

    if (language === "Java") {
      const typeFor = (key: string, value: string | number) => {
        if (typeof value === "string") return "String"
        if (["price", "unitPrice"].includes(key)) return "double"
        return "int"
      }

      const declarationBlock = Object.entries(variables)
        .map(([name, value]) => `${typeFor(name, value)} ${name} = ${typeof value === "string" ? `"${value}"` : String(value)};`)
        .map((line) => `    ${line}`)
        .join("\n")

      const hasJavaMain = /public\s+static\s+void\s+main\s*\(\s*String\[\]\s+args\s*\)/.test(code)
      let nextCode = code

      if (!hasJavaMain) {
        const body = code.trim()
        nextCode = `public class Main {\n  public static void main(String[] args) {\n${declarationBlock}${body ? `\n${indent(body, 4)}` : ""}\n  }\n}`
      } else if (declarationBlock) {
        nextCode = nextCode.replace(
          /public\s+static\s+void\s+main\s*\(\s*String\[\]\s+args\s*\)\s*\{/,
          (match) => `${match}\n${declarationBlock}`
        )
      }

      if (levelId === "level_6") {
        nextCode = nextCode.replace(/Seat:\s*A12/g, `Seat: ${String(variables.seat ?? "A12")}`)
      }

      return nextCode
    }

    const typeForCpp = (key: string, value: string | number) => {
      if (typeof value === "string") return "string"
      if (["price", "unitPrice"].includes(key)) return "double"
      return "int"
    }

    const declarationBlock = Object.entries(variables)
      .map(([name, value]) => `${typeForCpp(name, value)} ${name} = ${typeof value === "string" ? `"${value}"` : String(value)};`)
      .map((line) => `  ${line}`)
      .join("\n")

    const hasCppMain = /int\s+main\s*\(\s*\)/.test(code)
    const hasIostream = /#include\s*<iostream>/.test(code)
    const hasUsingStd = /using\s+namespace\s+std\s*;/.test(code)

    let nextCode = code
    if (!hasCppMain) {
      const includes = hasIostream ? "" : "#include <iostream>\n"
      const usingStd = hasUsingStd ? "" : "using namespace std;\n\n"
      const body = code.trim()
      nextCode = `${includes}${usingStd}int main() {\n${declarationBlock}${body ? `\n${indent(body, 2)}` : ""}\n  return 0;\n}`
    } else if (declarationBlock) {
      nextCode = nextCode.replace(/int\s+main\s*\(\s*\)\s*\{/, (match) => `${match}\n${declarationBlock}`)
      if (!hasIostream) {
        nextCode = `#include <iostream>\n${nextCode}`
      }
      if (!hasUsingStd) {
        nextCode = nextCode.replace(/#include\s*<iostream>\s*/m, (match) => `${match}using namespace std;\n\n`)
      }
    }

    if (levelId === "level_6") {
      nextCode = nextCode.replace(/Seat:\s*A12/g, `Seat: ${String(variables.seat ?? "A12")}`)
    }

    return nextCode
  }

  const submitAnswer = async () => {
    if (!currentChallenge || !selectedLevel || !selectedLanguage) return

    setIsRunning(true)
    setExecutionError("")
    setExecutionOutput("")
    setTestCaseResults([])

    let isCorrect = false
    const testCases = getLevelTestCases(selectedLevel.id)
    const results: ChallengeTestCaseResult[] = []

    try {
      for (const testCase of testCases) {
        const preparedCode = applyVariablesToCode(
          userAnswer,
          selectedLanguage,
          selectedLevel.id,
          testCase.variables
        )

        const response = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: selectedLanguage,
            code: preparedCode,
          }),
        })

        const result = await response.json()
        const output = (result?.output ?? result?.error ?? "").toString()
        const passed = response.ok && normalizeOutput(output) === normalizeOutput(testCase.expectedOutput)

        results.push({
          id: testCase.id,
          expectedOutput: testCase.expectedOutput,
          userOutput: output || "(no output)",
          passed,
        })
      }

      setTestCaseResults(results)
      setExecutionOutput(results[results.length - 1]?.userOutput ?? "")
      const passedCount = results.filter((r) => r.passed).length
      isCorrect = passedCount === testCases.length

      setFeedback({
        correct: isCorrect,
        message: isCorrect
          ? "All 4 test cases passed! Great solution."
          : `${passedCount}/4 test cases passed.`,
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
        // Update completed levels with this language
        setCompletedLevels((prev) => {
          const updated = new Map(prev)
          if (!updated.has(selectedLevel.id)) {
            updated.set(selectedLevel.id, new Set())
          }
          updated.get(selectedLevel.id)?.add(selectedLanguage)
          return updated
        })

        if (user?.id) {
          const previousSnapshot: ProfileProgressSnapshot = await getProfileProgressSnapshot(user.id)
          await markChallengeLevelComplete({
            userId: user.id,
            levelId: selectedLevel.id,
            language: selectedLanguage,
          })

          const nextSnapshot = await getProfileProgressSnapshot(user.id)
          const unlockedAchievements = getNewlyUnlockedAchievements(previousSnapshot, nextSnapshot)
          const firstStepAchievement = unlockedAchievements.find((achievement) => achievement.id === "first-steps")

          if (firstStepAchievement) {
            sessionStorage.setItem(pendingAchievementStorageKey, JSON.stringify([firstStepAchievement]))
          }
        }
      }
    }
  }

  const goToLearningChapter = (chapterHint: string, preferredLanguage?: "Python" | "Java" | "C++") => {
    const parts = chapterHint.split(">")
    if (parts.length < 3) return

    const language = preferredLanguage ?? parts[1].trim()
    const chapterText = parts[2].trim()
    const chapterNumber = parseInt(chapterText.split(":")[0].replace("Chapter", "").trim())

    sessionStorage.setItem(
      "learningNavigation",
      JSON.stringify({
        language,
        chapterNumber,
      })
    )

    router.push("/learning")
  }

  const returnToChallengeList = () => {
    setAchievementUnlocks([])
    setShowAchievementUnlockModal(false)
    setSelectedLevel(null)
    setSelectedLanguage(null)
    setChallenges([])
    setCurrentChallengeIndex(0)
    setUserAnswer("")
    setFeedback(null)
    setExecutionOutput("")
    setExecutionError("")
    setTestCaseResults([])
    router.push("/challenges")
  }

  const isLevelUnlocked = (level: ChallengeLevel) => {
    if (level.level_number === 1) return true
    const previousLevel = levels.find(
      (l) => l.level_number === level.level_number - 1
    )
    return previousLevel ? completedLevels.has(previousLevel.id) : false
  }

  const getCompletedLanguagesForLevel = (levelId: string): string[] => {
    return Array.from(completedLevels.get(levelId) ?? new Set())
  }

  const currentChallenge = challenges[currentChallengeIndex]
  const currentTestCases = selectedLevel ? getLevelTestCases(selectedLevel.id) : []

  const handleSelectLanguage = (level: ChallengeLevel, language: "Python" | "Java" | "C++") => {
    setSelectedLevel(level)
    setSelectedLanguage(language)
    // Load challenges will be triggered in the next render when selectedLevel changes
    // So we need to pass the level directly
    const challengeByLevel: Record<string, Challenge> = {
      "level_1": {
        id: "c1",
        level_id: "level_1",
        title: "Warehouse Receipt Generator",
        scenario:
          "You are building a warehouse tool. Print a receipt for one order with item, quantity, and total units to ship.",
        requirements: [
          "Use variables for item name and quantity",
          "Print exactly 3 lines in the expected format",
          "Do not print extra text",
        ],
        starter_code_python: "# Variables 'item' and 'quantity' are provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variables 'item' and 'quantity' are provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Variables 'item' and 'quantity' are provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Order Item: USB Cable\nQuantity: 4\nUnits to Ship: 4",
        chapter_hint: "Learning > Python > Chapter 1: Introduction & Setup",
      },
      "level_2": {
        id: "c2",
        level_id: "level_2",
        title: "Daily Sales Summary",
        scenario:
          "A cafe wants a quick daily summary. Calculate revenue using fixed values and print rounded to 2 decimals.",
        requirements: [
          "Set cups_sold = 27 and price = 3.5",
          "Compute revenue",
          "Print: Revenue: 94.50",
        ],
        starter_code_python: "# Variables 'cups_sold' and 'price' are provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variables 'cups_sold' and 'price' are provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  // Variables 'cups_sold' and 'price' are provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Revenue: 94.50",
        chapter_hint: "Learning > Python > Chapter 2: Variables & Data Types",
      },
      "level_3": {
        id: "c3",
        level_id: "level_3",
        title: "Shipping Priority Decision",
        scenario:
          "An e-commerce system chooses shipping mode by package weight.",
        requirements: [
          "Set weight = 7",
          "If weight > 5 print Express, else Standard",
          "Output must be exactly one line",
        ],
        starter_code_python: "# Variable 'weight' is provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variable 'weight' is provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Variable 'weight' is provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Shipping Mode: Express",
        chapter_hint: "Learning > Python > Chapter 3: Control Flow",
      },
      "level_4": {
        id: "c4",
        level_id: "level_4",
        title: "Invoice Discount Function",
        scenario:
          "Create a function to apply a fixed discount and print the final invoice total.",
        requirements: [
          "Create function apply_discount(amount, discount)",
          "Call with 250 and 30",
          "Print exactly: Final Total: 220",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "public class Main {\n  // Write function here\n  public static void main(String[] args) {\n    // Call function and print\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\n// Write function here\n\nint main() {\n  // Call function and print\n  return 0;\n}",
        expected_output: "Final Total: 220",
        chapter_hint: "Learning > Python > Chapter 4: Functions",
      },
      "level_5": {
        id: "c5",
        level_id: "level_5",
        title: "Inventory Lookup Report",
        scenario:
          "Use a dictionary to store stock and print stock for pen and notebook.",
        requirements: [
          "Create dictionary stock with pen=12 and notebook=5",
          "Print two lines in expected order",
          "Match spacing and casing exactly",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "pen: 12\nnotebook: 5",
        chapter_hint: "Learning > Python > Chapter 5: Data Structures",
      },
      "level_6": {
        id: "c6",
        level_id: "level_6",
        title: "Ticket Confirmation",
        scenario:
          "Create a program that prints a confirmation message for a booked ticket.",
        requirements: [
          "Program must compile and run",
          "Print two lines exactly",
          "Use standard output",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "Booking Confirmed\nSeat: A12",
        chapter_hint: "Learning > Java > Chapter 1: Introduction & Setup",
      },
      "level_7": {
        id: "c7",
        level_id: "level_7",
        title: "Water Bill Calculator",
        scenario: "Calculate total bill using usage and per-unit price.",
        requirements: [
          "usage = 18, unitPrice = 1.75",
          "Print one line: Bill: 31.50",
          "Use formatted output",
        ],
        starter_code_python: "# Variables 'usage' and 'unitPrice' are provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variables 'usage' and 'unitPrice' are provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  // Variables 'usage' and 'unitPrice' are provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Bill: 31.50",
        chapter_hint: "Learning > Java > Chapter 2: Variables & Data Types",
      },
      "level_8": {
        id: "c8",
        level_id: "level_8",
        title: "Loan Risk Flag",
        scenario: "Flag high risk when credit score is below threshold.",
        requirements: [
          "score = 580",
          "If score < 600 print Risk: High else Risk: Low",
          "Single-line output only",
        ],
        starter_code_python: "# Variable 'score' is provided by the test case\n# Write code below",
        starter_code_java: "public class Main {\n  public static void main(String[] args) {\n    // Variable 'score' is provided by the test case\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Variable 'score' is provided by the test case\n  // Write code here\n  return 0;\n}",
        expected_output: "Risk: High",
        chapter_hint: "Learning > Java > Chapter 3: Control Flow",
      },
      "level_9": {
        id: "c9",
        level_id: "level_9",
        title: "Delivery ETA Function",
        scenario: "Write a function that adds preparation and travel minutes.",
        requirements: [
          "Create function eta(int prep, int travel)",
          "Call eta(12, 18)",
          "Print: ETA Minutes: 30",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "public class Main {\n  // Write function here\n  public static void main(String[] args) {\n    // Call function and print\n  }\n}",
        starter_code_cpp: "#include <iostream>\nusing namespace std;\n\n// Write function here\n\nint main() {\n  // Call function and print\n  return 0;\n}",
        expected_output: "ETA Minutes: 30",
        chapter_hint: "Learning > Java > Chapter 4: Functions",
      },
      "level_10": {
        id: "c10",
        level_id: "level_10",
        title: "Store Price Lookup",
        scenario: "Use a map to store and print prices for rice and milk.",
        requirements: [
          "Use appropriate data structure",
          "Set rice=12, milk=8",
          "Print two lines in order",
        ],
        starter_code_python: "# Write code below",
        starter_code_java: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}",
        starter_code_cpp: "#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n  // Write code here\n  return 0;\n}",
        expected_output: "rice: 12\nmilk: 8",
        chapter_hint: "Learning > Java > Chapter 5: Data Structures",
      },
    }

    const selectedChallenge = challengeByLevel[level.id]
    setChallenges(selectedChallenge ? [selectedChallenge] : [])
    setCurrentChallengeIndex(0)
    setFeedback(null)
    setExecutionOutput("")
    setExecutionError("")
    
    // Set starter code based on selected language
    if (selectedChallenge && language) {
      const starterCodeKey = `starter_code_${language.toLowerCase()}`
      const starterCode = selectedChallenge[starterCodeKey as keyof Challenge] as string || ""
      setUserAnswer(starterCode)
    }
  }

  // Challenge solving view
  if (selectedLevel && selectedLanguage) {
    if (!currentChallenge) {
      return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Challenges Available</h3>
                <Button onClick={() => { setSelectedLevel(null); setSelectedLanguage(null) }} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Back to Challenges
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
                setSelectedLanguage(null)
                setChallenges([])
              }}
              className="mb-6 bg-white shadow-sm border-0 hover:shadow-md"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Button>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">
                      Level {selectedLevel.level_number}: {selectedLevel.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Solving in {selectedLanguage}</p>
                  </div>
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-3">Test Cases (4)</p>
                  <div className="space-y-3">
                    {currentTestCases.map((testCase, index) => (
                      <div key={testCase.id} className="rounded-md border border-blue-100 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Test Case {index + 1}</p>
                        <p className="text-xs text-slate-500 mb-1">Variables</p>
                        <pre className="rounded bg-slate-900 p-2 text-xs text-blue-200 overflow-x-auto whitespace-pre-wrap">
                          <code>{formatVariables(testCase.variables)}</code>
                        </pre>
                        <p className="text-xs text-slate-500 mt-2 mb-1">Expected Output</p>
                        <pre className="rounded bg-slate-900 p-2 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap">
                          <code>{testCase.expectedOutput}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Write your code ({selectedLanguage})</p>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Write your solution code here"
                    className="min-h-48 w-full rounded-md border border-slate-300 bg-white p-3 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  {!feedback?.correct && (
                    <Button
                      onClick={() => void submitAnswer()}
                      disabled={!userAnswer || isRunning}
                      className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
                      size="lg"
                    >
                      {isRunning ? "Running..." : "Submit Code"}
                    </Button>
                  )}
                </div>

                {(executionOutput || executionError) && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Your Output</p>
                    <pre className="rounded-md bg-slate-900 p-3 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
                      <code>{executionError || executionOutput}</code>
                    </pre>
                  </div>
                )}

                {testCaseResults.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">Test Case Results</p>
                    <div className="space-y-3">
                      {testCaseResults.map((result, index) => (
                        <div key={result.id} className={`rounded-md border p-3 ${result.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-800">Test Case {index + 1}</p>
                            <span className={`text-xs font-semibold ${result.passed ? "text-green-700" : "text-red-700"}`}>
                              {result.passed ? "PASS" : "FAIL"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-1">Expected Output</p>
                          <pre className="rounded bg-slate-900 p-2 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap">
                            <code>{result.expectedOutput}</code>
                          </pre>
                          <p className="text-xs text-slate-500 mt-2 mb-1">Your Output</p>
                          <pre className="rounded bg-slate-900 p-2 text-xs text-blue-200 overflow-x-auto whitespace-pre-wrap">
                            <code>{result.userOutput}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
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
                        {feedback.correct ? "Correct! +50 XP" : "Incorrect"}
                      </p>
                      <p className={feedback.correct ? "text-green-700" : "text-red-700"}>{feedback.message}</p>
                    </div>
                  </div>
                )}

                <div>
                  {feedback?.correct ? (
                    <div className="flex justify-end">
                      <Button onClick={returnToChallengeList} className="bg-blue-600 text-white hover:bg-blue-700" size="lg">
                        OK
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedback && !feedback.correct && (
                        <Button
                          onClick={() => goToLearningChapter(currentChallenge.chapter_hint, selectedLanguage ?? undefined)}
                          className="w-full bg-amber-600 text-white hover:bg-amber-700"
                          size="lg"
                        >
                          Back to Learning
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  // Main challenge list view (with difficulty filter and inline language buttons)
  return (
    <>
      <AchievementUnlockModal
        open={showAchievementUnlockModal}
        achievements={achievementUnlocks}
        onClose={() => {
          setShowAchievementUnlockModal(false)
          setAchievementUnlocks([])
        }}
      />
      <NavigationBar />
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Coding Challenges</h2>
            <p className="text-slate-600">Solve challenges in any language. Each challenge can be solved up to 3 times (once per language) for up to 150 XP total.</p>
          </div>

          {/* Difficulty filter removed per request */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels
              .map((level) => {
                const unlocked = isLevelUnlocked(level)
                const completedLanguages = getCompletedLanguagesForLevel(level.id)
                const isCompleted = completedLanguages.length > 0
                const isFullyCompleted = completedLanguages.length === 3

                return (
                  <Card
                    key={level.id}
                    className={`transition-all bg-white shadow-sm border-0 ${
                      unlocked ? "hover:shadow-md" : "opacity-50"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isCompleted ? "bg-green-50 border border-green-200" : unlocked ? "bg-blue-50 border border-blue-200" : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : unlocked ? (
                            <Trophy className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Trophy className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        {!unlocked && (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 border border-slate-200">
                            <Lock className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Level {level.level_number}</h3>
                      <p className="text-sm text-slate-600 mb-4">{level.title}</p>
                      
                      {/* Language buttons */}
                      <div className="flex flex-wrap gap-2">
                        {["Python", "Java", "C++"].map((lang) => {
                          const isCompleted = completedLanguages.includes(lang)
                          const typedLang = lang as "Python" | "Java" | "C++"
                          
                          return (
                            <Button
                              key={lang}
                              onClick={() => {
                                if (unlocked) {
                                  handleSelectLanguage(level, typedLang)
                                }
                              }}
                              disabled={!unlocked}
                              className={`border-0 text-xs py-1 px-3 h-auto ${
                                isCompleted
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : unlocked
                                  ? "bg-slate-200 text-black hover:bg-slate-300"
                                  : "bg-slate-300 text-black cursor-not-allowed hover:bg-slate-300"
                              }`}
                              variant="outline"
                            >
                              {lang} {isCompleted && "✓"}
                            </Button>
                          )
                        })}
                      </div>
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
