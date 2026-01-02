"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, CheckCircle, Circle, Code, BookOpen } from "lucide-react"

interface Language {
  id: string
  name: string
  description: string
  icon: string
}

interface Course {
  id: string
  language_id: string
  title: string
  description: string
  order_index: number
}

interface Chapter {
  id: string
  course_id: string
  title: string
  description: string
  content: string
  order_index: number
}

export default function LearningPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    setUser(JSON.parse(userData))
    loadLanguages()
  }, [router])

  useEffect(() => {
    if (selectedLanguage) {
      loadCourses(selectedLanguage.id)
    }
  }, [selectedLanguage])

  useEffect(() => {
    if (selectedCourse) {
      loadChapters(selectedCourse.id)
    }
  }, [selectedCourse])

  const loadLanguages = () => {
    // Mock data - replace with your API call
    const mockLanguages: Language[] = [
      {
        id: "1",
        name: "Python",
        description: "Learn Python from basics to advanced concepts. Perfect for beginners and data science.",
        icon: "/Python-Logo.png",
      },
      {
        id: "2",
        name: "Java",
        description: "Master object-oriented programming with Java. Build enterprise applications.",
        icon: "/Java-Logo.png",
      },
      {
        id: "3",
        name: "C++",
        description: "Dive into systems programming and high-performance applications with C++.",
        icon: "/C++-Logo.png",
      },
    ]
    setLanguages(mockLanguages)
    setLoading(false)
  }

  const loadCourses = (languageId: string) => {
    // Mock data - replace with your API call
    const mockCourses: Course[] = [
      {
        id: "c1",
        language_id: languageId,
        title: "Complete Beginner Course",
        description: "Start your programming journey from scratch",
        order_index: 1,
      },
    ]
    setCourses(mockCourses)
    setSelectedCourse(mockCourses[0])
  }

  const loadChapters = (courseId: string) => {
    // Mock data - replace with your API call
    const mockChapters: Chapter[] = [
      {
        id: "ch1",
        course_id: courseId,
        title: "Introduction & Setup",
        description: "Learn about the language and set up your development environment",
        content: `
          <h3>Welcome to Programming!</h3>
          <p>In this chapter, you'll learn the fundamentals and get your environment ready.</p>
          <h4>What you'll learn:</h4>
          <ul>
            <li>History and overview of the language</li>
            <li>Installing necessary tools</li>
            <li>Writing your first program</li>
            <li>Understanding basic syntax</li>
          </ul>
          <h4>Example Code:</h4>
          <pre><code>print("Hello, World!")</code></pre>
        `,
        order_index: 1,
      },
      {
        id: "ch2",
        course_id: courseId,
        title: "Variables & Data Types",
        description: "Understand how to store and manipulate data",
        content: `
          <h3>Variables & Data Types</h3>
          <p>Learn how to work with different types of data in your programs.</p>
          <h4>Topics covered:</h4>
          <ul>
            <li>Declaring variables</li>
            <li>Primitive data types</li>
            <li>Type conversion</li>
            <li>Constants</li>
          </ul>
        `,
        order_index: 2,
      },
      {
        id: "ch3",
        course_id: courseId,
        title: "Control Flow",
        description: "Master conditional statements and loops",
        content: `
          <h3>Control Flow</h3>
          <p>Learn how to control the flow of your program execution.</p>
          <h4>You'll master:</h4>
          <ul>
            <li>If-else statements</li>
            <li>Switch statements</li>
            <li>For loops</li>
            <li>While loops</li>
          </ul>
        `,
        order_index: 3,
      },
      {
        id: "ch4",
        course_id: courseId,
        title: "Functions",
        description: "Write reusable code with functions",
        content: `
          <h3>Functions</h3>
          <p>Organize your code into reusable functions.</p>
          <h4>Learn about:</h4>
          <ul>
            <li>Defining functions</li>
            <li>Parameters and arguments</li>
            <li>Return values</li>
            <li>Scope</li>
          </ul>
        `,
        order_index: 4,
      },
      {
        id: "ch5",
        course_id: courseId,
        title: "Data Structures",
        description: "Work with arrays, lists, and dictionaries",
        content: `
          <h3>Data Structures</h3>
          <p>Master essential data structures for organizing information.</p>
          <h4>Topics include:</h4>
          <ul>
            <li>Arrays and Lists</li>
            <li>Dictionaries/Maps</li>
            <li>Sets</li>
            <li>Tuples</li>
          </ul>
        `,
        order_index: 5,
      },
    ]
    setChapters(mockChapters)
  }

  const markChapterComplete = (chapterId: string) => {
    if (!user) return

    setProgress((prev) => new Map(prev).set(chapterId, true))
    
    const nextIndex = chapters.findIndex((c) => c.id === chapterId) + 1
    if (nextIndex < chapters.length) {
      setSelectedChapter(chapters[nextIndex])
    } else {
      setSelectedChapter(null)
    }
  }

  const getCompletionPercentage = () => {
    if (chapters.length === 0) return 0
    const completed = chapters.filter((c) => progress.get(c.id)).length
    return Math.round((completed / chapters.length) * 100)
  }

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600">Loading courses...</p>
          </div>
        </div>
      </>
    )
  }

  // Language Selection View
  if (!selectedLanguage) {
    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Language</h2>
              <p className="text-slate-600">Select a programming language to begin your learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languages.map((lang) => (
                <Card
                  key={lang.id}
                  className="cursor-pointer hover:shadow-md transition-all overflow-hidden bg-white shadow-sm border-0"
                  onClick={() => setSelectedLanguage(lang)}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-center">
                      <img src={lang.icon} alt={lang.name} className="w-32 h-32 object-contain" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{lang.name}</h3>
                    <p className="text-sm text-slate-600">{lang.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Chapter Content View
  if (selectedChapter) {
    const isCompleted = progress.get(selectedChapter.id)
    const currentIndex = chapters.findIndex((c) => c.id === selectedChapter.id)

    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setSelectedChapter(null)}
              className="mb-6 bg-white shadow-sm border-0 hover:shadow-md"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>

            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">
                    Chapter {currentIndex + 1} of {chapters.length}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                </div>
                <CardTitle className="text-3xl text-slate-900">{selectedChapter.title}</CardTitle>
                <p className="text-slate-600 mt-2">{selectedChapter.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div 
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                />

                <div className="pt-6 border-t border-slate-200">
                  {!isCompleted ? (
                    <Button
                      onClick={() => markChapterComplete(selectedChapter.id)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                      size="lg"
                    >
                      Mark as Complete
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-4 px-6 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Chapter Completed!</span>
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

  // Chapters List View
  const completionPercentage = getCompletionPercentage()

  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLanguage(null)
              setSelectedCourse(null)
              setChapters([])
            }}
            className="mb-6 bg-white shadow-sm border-0 hover:shadow-md"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Languages
          </Button>

          {/* Course Progress Card */}
          <Card className="mb-8 bg-white shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={selectedLanguage.icon} alt={selectedLanguage.name} className="w-20 h-20 object-contain" />
                    <h2 className="text-3xl font-bold text-slate-900">{selectedLanguage.name}</h2>
                  </div>
                  <p className="text-slate-600">{selectedCourse?.description}</p>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-4xl font-bold text-blue-600">{completionPercentage}%</div>
                  <div className="text-sm text-slate-600">Complete</div>
                </div>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Chapters List */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-slate-900">Course Chapters</h3>
            <p className="text-slate-600">Complete each chapter to progress</p>
          </div>

          <div className="space-y-3">
            {chapters.map((chapter, index) => {
              const isCompleted = progress.get(chapter.id)
              return (
                <Card
                  key={chapter.id}
                  className="cursor-pointer hover:shadow-md transition-all bg-white shadow-sm border-0"
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-lg mb-1">
                          Chapter {index + 1}: {chapter.title}
                        </h4>
                        <p className="text-sm text-slate-600">{chapter.description}</p>
                      </div>
                      {isCompleted && (
                        <span className="shrink-0 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                          Completed
                        </span>
                      )}
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