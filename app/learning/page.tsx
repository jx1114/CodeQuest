"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/NavigationBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, CheckCircle, Circle, Code, BookOpen, Award } from "lucide-react"
import { getCompletedChaptersForCourse, markLearningChapterComplete } from "@/lib/progress"

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
  explanation_html: string
  example_html: string
  mini_practice_example_html: string
  mini_practice_output: string
  mini_practice_question: string
  mini_practice_answer: string
  order_index: number
}

interface Certificate {
  id: string
  languageId: string
  languageName: string
  userName: string
  issuedAt: string
  totalChapters: number
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
  const [practiceAnswer, setPracticeAnswer] = useState("")
  const [practiceFeedback, setPracticeFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [executionOutput, setExecutionOutput] = useState("")
  const [executionError, setExecutionError] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingNavigation, setPendingNavigation] = useState<{ language: string; chapterNumber: number } | null>(null)
  const [generatedCertificates, setGeneratedCertificates] = useState<Map<string, Certificate>>(new Map())
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showCertificateReady, setShowCertificateReady] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/auth/sign-in")
      return
    }
    setUser(JSON.parse(userData))
    
    // Check for navigation from challenges page
    const navigationData = sessionStorage.getItem("learningNavigation")
    if (navigationData) {
      try {
        setPendingNavigation(JSON.parse(navigationData))
        sessionStorage.removeItem("learningNavigation")
      } catch (error) {
        console.error("Error parsing navigation data:", error)
      }
    }
    
    loadLanguages()
  }, [router])

  useEffect(() => {
    if (selectedLanguage) {
      loadCourses(selectedLanguage.id)
    }
  }, [selectedLanguage])

  useEffect(() => {
    if (!user?.id) return

    const savedCertificates = localStorage.getItem(`codequest-certificates-${user.id}`)
    if (!savedCertificates) {
      setGeneratedCertificates(new Map())
      return
    }

    try {
      const parsed: Certificate[] = JSON.parse(savedCertificates)
      const certMap = new Map<string, Certificate>()
      parsed.forEach((certificate) => {
        certMap.set(certificate.languageId, certificate)
      })
      setGeneratedCertificates(certMap)
    } catch (error) {
      console.error("Failed to parse certificates:", error)
      setGeneratedCertificates(new Map())
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedCourse) {
      void loadChapters(selectedCourse.id, selectedLanguage?.id)
    }
  }, [selectedCourse, selectedLanguage, user])

  useEffect(() => {
    setPracticeAnswer("")
    setPracticeFeedback(null)
    setExecutionOutput("")
    setExecutionError("")
  }, [selectedChapter?.id])

  useEffect(() => {
    if (!user?.id || !selectedLanguage || chapters.length === 0) return

    const allCompleted = chapters.every((chapter) => progress.get(chapter.id))
    const alreadyGenerated = generatedCertificates.has(selectedLanguage.id)

    if (allCompleted && !alreadyGenerated) {
      const userName = user?.name || user?.username || user?.email || "CodeQuest Learner"
      const newCertificate: Certificate = {
        id: `CERT-${selectedLanguage.name.toUpperCase()}-${Date.now()}`,
        languageId: selectedLanguage.id,
        languageName: selectedLanguage.name,
        userName,
        issuedAt: new Date().toISOString(),
        totalChapters: chapters.length,
      }

      setGeneratedCertificates((prev) => {
        const next = new Map(prev)
        next.set(selectedLanguage.id, newCertificate)
        localStorage.setItem(`codequest-certificates-${user.id}`, JSON.stringify(Array.from(next.values())))
        return next
      })

      setShowCertificateReady(true)
    }
  }, [progress, chapters, selectedLanguage, generatedCertificates, user])

  // Handle navigation from challenges page
  useEffect(() => {
    if (pendingNavigation && languages.length > 0) {
      const { language, chapterNumber } = pendingNavigation
      
      // Find the language
      const targetLanguage = languages.find((l) => l.name === language)
      if (targetLanguage) {
        setSelectedLanguage(targetLanguage)
        setPendingNavigation(null)
      }
    }
  }, [languages, pendingNavigation])

  // Auto-select chapter after language and chapters load
  useEffect(() => {
    if (pendingNavigation && selectedLanguage && chapters.length > 0) {
      const { chapterNumber } = pendingNavigation
      const targetChapterIndex = chapterNumber - 1
      if (targetChapterIndex >= 0 && targetChapterIndex < chapters.length) {
        setSelectedChapter(chapters[targetChapterIndex])
        setPendingNavigation(null)
      }
    }
  }, [selectedLanguage, chapters, pendingNavigation])

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

  const loadChapters = async (courseId: string, languageId?: string) => {
    const currentLanguage = languageId === "2" ? "Java" : languageId === "3" ? "C++" : "Python"

    const mockChapters: Chapter[] = [
      {
        id: "ch1",
        course_id: courseId,
        title: "Introduction & Setup",
        description: `Understand ${currentLanguage} ecosystem and environment setup`,
        explanation_html: `
          <p>This chapter introduces ${currentLanguage} and the basic terms you will use in the course.</p>
          <p><strong>Terms:</strong> <code>compiler/interpreter</code>, <code>syntax</code>, <code>runtime</code>, <code>output</code>.</p>
          <ul>
            <li>Where ${currentLanguage} is used</li>
            <li>How code is executed</li>
            <li>How to run a first program</li>
          </ul>
        `,
        example_html:
          currentLanguage === "Java"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-purple-300">public class</span> Main {\n  <span class="text-cyan-300">public static void</span> main(String[] args) {\n    <span class="text-amber-300">System.out.println</span>(<span class="text-green-300">\"Hello, World!\"</span>);\n  }\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Hello, World!</p>`
            : currentLanguage === "C++"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-purple-300">#include</span> &lt;iostream&gt;\n<span class="text-cyan-300">int</span> main() {\n  <span class="text-amber-300">std::cout</span> &lt;&lt; <span class="text-green-300">\"Hello, World!\"</span> &lt;&lt; std::endl;\n  <span class="text-purple-300">return</span> 0;\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Hello, World!</p>`
            : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-amber-300">print</span>(<span class="text-green-300">\"Hello, World!\"</span>)</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Hello, World!</p>`,
        mini_practice_example_html: currentLanguage === "Python"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>print(<span class="text-green-300">\"Welcome\"</span>)</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Welcome</p>`
          : currentLanguage === "Java"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>System.out.println(<span class="text-green-300">\"Welcome\"</span>);</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Welcome</p>`
          : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>std::cout &lt;&lt; <span class="text-green-300">\"Welcome\"</span> &lt;&lt; std::endl;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Welcome</p>`,
        mini_practice_output: "CodeQuest",
        mini_practice_question: "Write code that produces exactly the target output.",
        mini_practice_answer: currentLanguage === "Python" ? "print(\"CodeQuest\")" : currentLanguage === "Java" ? "System.out.println(\"CodeQuest\");" : "std::cout << \"CodeQuest\" << std::endl;",
        order_index: 1,
      },
      {
        id: "ch2",
        course_id: courseId,
        title: "Variables & Data Types",
        description: "Store, update, and convert values safely",
        explanation_html: `
          <p>Introduction to variables and data types.</p>
          <p><strong>Terms:</strong> <code>variable</code>, <code>data type</code>, <code>assignment</code>, <code>literal</code>, <code>formatting</code>, <code>rounding</code>.</p>
          <ul>
            <li>Choose correct type for each value</li>
            <li>Use descriptive variable names</li>
            <li>Understand assignment and reassignment</li>
            <li>Format decimals to specific precision</li>
          </ul>
        `,
        example_html:
          currentLanguage === "Java"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> age = <span class="text-orange-300">21</span>;\n<span class="text-cyan-300">double</span> score = <span class="text-orange-300">95.5</span>;\nSystem.out.println(age);\n<br><span class="text-amber-300">// Formatted decimal output</span>\n<span class="text-cyan-300">double</span> price = <span class="text-orange-300">94.50</span>;\nSystem.out.printf(<span class="text-green-300">\"Price: %.2f\"</span>, price);</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>`
            : currentLanguage === "C++"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> age = <span class="text-orange-300">21</span>;\nstd::cout &lt;&lt; age &lt;&lt; std::endl;\n<br><span class="text-amber-300">// Formatted decimal output</span>\n<span class="text-cyan-300">double</span> price = <span class="text-orange-300">94.50</span>;\nstd::cout &lt;&lt; std::fixed &lt;&lt; std::setprecision(<span class="text-orange-300">2</span>) &lt;&lt; <span class="text-green-300">\"Price: \"</span> &lt;&lt; price &lt;&lt; std::endl;</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>`
            : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>age = <span class="text-orange-300">21</span>\nprint(age)\n<br><span class="text-amber-300"># Formatted decimal output</span>\nprice = <span class="text-orange-300">94.50</span>\nprint(<span class="text-green-300">f\"Price: {price:.2f}\"</span>)</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>`,
        mini_practice_example_html: currentLanguage === "Python"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>points = <span class="text-orange-300">10</span>\nprint(points)\nrevenue = <span class="text-orange-300">94.50</span>\nprint(<span class="text-green-300">f\"Revenue: {revenue:.2f}\"</span>)</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 10<br>Revenue: 94.50</p>`
          : currentLanguage === "Java"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int points = <span class="text-orange-300">10</span>;\nSystem.out.println(points);\n<span class="text-cyan-300">double</span> total = <span class="text-orange-300">94.50</span>;\nSystem.out.printf(<span class="text-green-300">\"Total: %.2f\"</span>, total);</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 10<br>Total: 94.50</p>`
          : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> points = <span class="text-orange-300">10</span>;\nstd::cout &lt;&lt; points &lt;&lt; std::endl;\n<span class="text-cyan-300">double</span> total = <span class="text-orange-300">94.50</span>;\nstd::cout &lt;&lt; std::fixed &lt;&lt; std::setprecision(<span class="text-orange-300">2</span>) &lt;&lt; <span class="text-green-300">\"Total: \"</span> &lt;&lt; total;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 10<br>Total: 94.50</p>`,
        mini_practice_output: "50\nTotal: 125.00",
        mini_practice_question: "Write code that assigns value and formats decimal output to 2 places.",
        mini_practice_answer: currentLanguage === "Python" ? "points = 50\nprint(points)\ntotal = 125.00\nprint(f\"Total: {total:.2f}\")" : currentLanguage === "Java" ? "int points = 50;\nSystem.out.println(points);\ndouble total = 125.00;\nSystem.out.printf(\"Total: %.2f\", total);" : "int points = 50;\nstd::cout << points << std::endl;\ndouble total = 125.00;\nstd::cout << std::fixed << std::setprecision(2) << \"Total: \" << total;",
        order_index: 2,
      },
      {
        id: "ch3",
        course_id: courseId,
        title: "Control Flow",
        description: "Use conditionals and loops to control execution",
        explanation_html: `
          <p>Introduction to control flow.</p>
          <p><strong>Terms:</strong> <code>condition</code>, <code>branch</code>, <code>loop</code>, <code>iteration</code>, <code>break</code>, <code>continue</code>.</p>
          <ul>
            <li>Use conditionals (if/else) for branching logic</li>
            <li>Use loops (for/while) for repeated work</li>
            <li>Use break to exit a loop early</li>
            <li>Use continue to skip to next iteration</li>
          </ul>
        `,
        example_html:
          currentLanguage === "Java"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> score = <span class="text-orange-300">75</span>;\n<span class="text-purple-300">if</span> (score &gt;= <span class="text-orange-300">60</span>) {\n  System.out.println(<span class="text-green-300">\"Pass\"</span>);\n}\n<br><span class="text-amber-300">// Loop example</span>\n<span class="text-purple-300">for</span> (<span class="text-cyan-300">int</span> i = <span class="text-orange-300">1</span>; i &lt;= <span class="text-orange-300">3</span>; i++) {\n  System.out.println(i);\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>`
            : currentLanguage === "C++"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> score = <span class="text-orange-300">75</span>;\n<span class="text-purple-300">if</span> (score &gt;= <span class="text-orange-300">60</span>) {\n  std::cout &lt;&lt; <span class="text-green-300">\"Pass\"</span> &lt;&lt; std::endl;\n}\n<br><span class="text-amber-300">// Loop example</span>\n<span class="text-purple-300">for</span> (<span class="text-cyan-300">int</span> i = <span class="text-orange-300">1</span>; i &lt;= <span class="text-orange-300">3</span>; i++) {\n  std::cout &lt;&lt; i &lt;&lt; std::endl;\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>`
            : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>score = <span class="text-orange-300">75</span>\n<span class="text-purple-300">if</span> score &gt;= <span class="text-orange-300">60</span>:\n    print(<span class="text-green-300">\"Pass\"</span>)\n<br><span class="text-amber-300"># Loop example</span>\n<span class="text-purple-300">for</span> i <span class="text-purple-300">in</span> range(<span class="text-orange-300">1</span>, <span class="text-orange-300">4</span>):\n    print(i)</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>`,
        mini_practice_example_html: currentLanguage === "Python"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>n = <span class="text-orange-300">5</span>\n<span class="text-purple-300">if</span> n &gt; <span class="text-orange-300">0</span>:\n    print(<span class="text-green-300">\"Positive\"</span>)\n<span class="text-purple-300">for</span> i <span class="text-purple-300">in</span> range(n):\n    print(i)</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Positive<br>0<br>1<br>2<br>3<br>4</p>`
          : currentLanguage === "Java"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> n = <span class="text-orange-300">5</span>;\n<span class="text-purple-300">if</span> (n &gt; <span class="text-orange-300">0</span>) {\n  System.out.println(<span class="text-green-300">\"Positive\"</span>);\n}\n<span class="text-purple-300">for</span> (<span class="text-cyan-300">int</span> i = <span class="text-orange-300">0</span>; i &lt; n; i++) {\n  System.out.println(i);\n}</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Positive<br>0<br>1<br>2<br>3<br>4</p>`
          : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> n = <span class="text-orange-300">5</span>;\n<span class="text-purple-300">if</span> (n &gt; <span class="text-orange-300">0</span>) {\n  std::cout &lt;&lt; <span class="text-green-300">\"Positive\"</span> &lt;&lt; std::endl;\n}\n<span class="text-purple-300">for</span> (<span class="text-cyan-300">int</span> i = <span class="text-orange-300">0</span>; i &lt; n; i++) {\n  std::cout &lt;&lt; i &lt;&lt; std::endl;\n}</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Positive<br>0<br>1<br>2<br>3<br>4</p>`,
        mini_practice_output: "Small\n1\n2",
        mini_practice_question: "Write code using condition and loop logic that produces exactly the target output.",
        mini_practice_answer: currentLanguage === "Python" ? "n = 5\nif n < 10:\n    print(\"Small\")\nfor i in range(1, 3):\n    print(i)" : currentLanguage === "Java" ? "int n = 5;\nif (n < 10) {\n  System.out.println(\"Small\");\n}\nfor (int i = 1; i < 3; i++) {\n  System.out.println(i);\n}" : "int n = 5;\nif (n < 10) {\n  std::cout << \"Small\" << std::endl;\n}\nfor (int i = 1; i < 3; i++) {\n  std::cout << i << std::endl;\n}",
        order_index: 3,
      },
      {
        id: "ch4",
        course_id: courseId,
        title: "Functions",
        description: "Build reusable logic with clear inputs and outputs",
        explanation_html: `
          <p>Introduction to functions and reusable code blocks.</p>
          <p><strong>Terms:</strong> <code>function</code>, <code>parameter</code>, <code>argument</code>, <code>return</code>.</p>
          <ul>
            <li>Write focused functions that do one job</li>
            <li>Use parameters for dynamic behavior</li>
            <li>Return values for reuse in other logic</li>
          </ul>
        `,
        example_html:
          currentLanguage === "Java"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">public static int</span> add(<span class="text-cyan-300">int</span> a, <span class="text-cyan-300">int</span> b) {\n  <span class="text-purple-300">return</span> a + b;\n}\nSystem.out.println(add(<span class="text-orange-300">2</span>, <span class="text-orange-300">3</span>));</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>`
            : currentLanguage === "C++"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">int</span> add(<span class="text-cyan-300">int</span> a, <span class="text-cyan-300">int</span> b) {\n  <span class="text-purple-300">return</span> a + b;\n}\nstd::cout &lt;&lt; add(<span class="text-orange-300">2</span>, <span class="text-orange-300">3</span>) &lt;&lt; std::endl;</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>`
            : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-purple-300">def</span> add(a, b):\n    <span class="text-purple-300">return</span> a + b\nprint(add(<span class="text-orange-300">2</span>, <span class="text-orange-300">3</span>))</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>`,
        mini_practice_example_html: currentLanguage === "Python"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>def greet(name):\n    return \"Hi \" + name\nprint(greet(\"Ana\"))</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Hi Ana</p>`
          : currentLanguage === "Java"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>static int square(int n) { return n*n; }\nSystem.out.println(square(4));</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 16</p>`
          : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int square(int n) { return n*n; }\nstd::cout &lt;&lt; square(4) &lt;&lt; std::endl;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 16</p>`,
        mini_practice_output: "8",
        mini_practice_question: "Write function-based code that produces exactly the target output.",
        mini_practice_answer: currentLanguage === "Python" ? "def double(x):\n    return x*2\nprint(double(4))" : currentLanguage === "Java" ? "static int doubleNum(int x){ return x*2; }\nSystem.out.println(doubleNum(4));" : "int doubleNum(int x){ return x*2; }\nstd::cout << doubleNum(4) << std::endl;",
        order_index: 4,
      },
      {
        id: "ch5",
        course_id: courseId,
        title: "Data Structures",
        description: "Choose the right structure for storing and retrieving data",
        explanation_html: `
          <p>Introduction to common data structures.</p>
          <p><strong>Terms:</strong> <code>array/list</code>, <code>map/dictionary</code>, <code>set</code>, <code>key-value</code>.</p>
          <ul>
            <li>Lists/arrays for ordered items</li>
            <li>Maps/dictionaries for key-value lookup</li>
            <li>Sets for unique values</li>
          </ul>
        `,
        example_html:
          currentLanguage === "Java"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">HashMap&lt;String, Integer&gt;</span> scores = <span class="text-purple-300">new</span> HashMap&lt;&gt;();\nscores.put(<span class="text-green-300">\"Ana\"</span>, <span class="text-orange-300">90</span>);\nSystem.out.println(scores.get(<span class="text-green-300">\"Ana\"</span>));</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>`
            : currentLanguage === "C++"
            ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code><span class="text-cyan-300">map&lt;string, int&gt;</span> scores;\nscores[<span class="text-green-300">\"Ana\"</span>] = <span class="text-orange-300">90</span>;\nstd::cout &lt;&lt; scores[<span class="text-green-300">\"Ana\"</span>] &lt;&lt; std::endl;</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>`
            : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>scores = {<span class="text-green-300">\"Ana\"</span>: <span class="text-orange-300">90</span>}\nprint(scores[<span class="text-green-300">\"Ana\"</span>])</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>`,
        mini_practice_example_html: currentLanguage === "Python"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>data = {<span class="text-green-300">\"x\"</span>: <span class="text-orange-300">1</span>}\nprint(data[<span class="text-green-300">\"x\"</span>])</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 1</p>`
          : currentLanguage === "Java"
          ? `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>HashMap&lt;String,Integer&gt; m = new HashMap&lt;&gt;();\nm.put(\"x\", 1);\nSystem.out.println(m.get(\"x\"));</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 1</p>`
          : `<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>map&lt;string,int&gt; m;\nm[\"x\"] = 1;\nstd::cout &lt;&lt; m[\"x\"] &lt;&lt; std::endl;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 1</p>`,
        mini_practice_output: "100",
        mini_practice_question: "Write data-structure code that produces exactly the target output.",
        mini_practice_answer: currentLanguage === "Python" ? "scores = {\"A\": 100}\nprint(scores[\"A\"])" : currentLanguage === "Java" ? "HashMap<String,Integer> scores = new HashMap<>();\nscores.put(\"A\",100);\nSystem.out.println(scores.get(\"A\"));" : "map<string,int> scores;\nscores[\"A\"] = 100;\nstd::cout << scores[\"A\"] << std::endl;",
        order_index: 5,
      },
    ]
    setChapters(mockChapters)

    if (user?.id && languageId) {
      const completed = await getCompletedChaptersForCourse(user.id, languageId, courseId)
      const nextProgress = new Map<string, boolean>()
      mockChapters.forEach((chapter) => {
        nextProgress.set(chapter.id, completed.has(chapter.id))
      })
      setProgress(nextProgress)
    }
  }

  const markChapterComplete = async (chapterId: string) => {
    if (!user) return

    setProgress((prev) => new Map(prev).set(chapterId, true))

    if (selectedLanguage && selectedCourse) {
      await markLearningChapterComplete({
        userId: user.id,
        languageId: selectedLanguage.id,
        courseId: selectedCourse.id,
        chapterId,
      })
    }
  }

  const normalizeAnswer = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")

  const normalizeOutput = (value: string) => normalizeAnswer(value.replace(/\r\n/g, "\n"))

  const submitMiniPractice = async () => {
    if (!selectedChapter || !selectedLanguage) return

    setIsRunning(true)
    setExecutionError("")
    setExecutionOutput("")

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage.name,
          code: practiceAnswer,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setExecutionError(result?.error ?? "Failed to execute code")
        setPracticeFeedback("incorrect")
        return
      }

      const output = (result?.output ?? "").toString()
      setExecutionOutput(output || "(no output)")

      const isCorrect = normalizeOutput(output) === normalizeOutput(selectedChapter.mini_practice_output)
      setPracticeFeedback(isCorrect ? "correct" : "incorrect")

      if (isCorrect && !progress.get(selectedChapter.id)) {
        await markChapterComplete(selectedChapter.id)
      }
    } catch {
      setExecutionError("Execution failed. Please try again.")
      setPracticeFeedback("incorrect")
    } finally {
      setIsRunning(false)
    }
  }

  const goToNextChapter = () => {
    if (!selectedChapter) return
    const nextIndex = chapters.findIndex((c) => c.id === selectedChapter.id) + 1
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

  const openCertificate = () => {
    if (!selectedLanguage) return
    const certificate = generatedCertificates.get(selectedLanguage.id)
    if (!certificate) return
    setSelectedCertificate(certificate)
    setShowCertificateModal(true)
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
                  className="overflow-hidden bg-white shadow-sm border-0 flex flex-col"
                >
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="mb-4 flex items-center justify-center">
                      <img src={lang.icon} alt={lang.name} className="w-32 h-32 object-contain" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{lang.name}</h3>
                    <p className="text-sm text-slate-600 mb-6 flex-1">{lang.description}</p>
                    <Button
                      onClick={() => setSelectedLanguage(lang)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Start Learning
                    </Button>
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

              <CardContent className="space-y-8">
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Introduction & Terms</h4>
                  <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: selectedChapter.explanation_html }} />
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Example</h4>
                  <div className="max-w-none" dangerouslySetInnerHTML={{ __html: selectedChapter.example_html }} />
                </section>

                <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Mini Practice</h4>
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Target Output</p>
                    <pre className="rounded-md bg-slate-900 p-3 text-sm text-green-300 overflow-x-auto"><code>{selectedChapter.mini_practice_output}</code></pre>
                  </div>
                  <p className="text-slate-700 mb-4">{selectedChapter.mini_practice_question}</p>

                  <div className="flex flex-col gap-3">
                    <textarea
                      value={practiceAnswer}
                      onChange={(e) => setPracticeAnswer(e.target.value)}
                      placeholder="Write your code here"
                      className="min-h-28 rounded-md border border-slate-300 bg-white p-3 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <Button
                      onClick={() => void submitMiniPractice()}
                      disabled={!practiceAnswer.trim() || isRunning}
                      className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isRunning ? "Running..." : "Submit"}
                    </Button>
                  </div>

                  {(executionOutput || executionError) && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Your Output</p>
                      <pre className="rounded-md bg-slate-900 p-3 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
                        <code>{executionError || executionOutput}</code>
                      </pre>
                    </div>
                  )}

                  {practiceFeedback === "incorrect" && (
                    <p className="mt-3 text-sm font-medium text-red-600">Incorrect. Output does not match target output. Try again.</p>
                  )}

                  {(practiceFeedback === "correct" || isCompleted) && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Correct! Chapter completed.</span>
                      </div>
                      <Button onClick={goToNextChapter} className="bg-green-600 text-white hover:bg-green-700">
                        {currentIndex < chapters.length - 1 ? "Go to Next Chapter" : "Finish Course"}
                      </Button>
                    </div>
                  )}
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  // Chapters List View
  const completionPercentage = getCompletionPercentage()
  const currentCertificate = selectedLanguage ? generatedCertificates.get(selectedLanguage.id) : null

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

              {completionPercentage === 100 && currentCertificate && (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Certificate generated for {selectedLanguage.name}.</span>
                  </div>
                  <Button onClick={openCertificate} className="bg-emerald-600 text-white hover:bg-emerald-700">
                    View Certificate
                  </Button>
                </div>
              )}

              {showCertificateReady && completionPercentage === 100 && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-blue-800 font-medium">Nice work! Your certificate is ready.</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={openCertificate}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCertificateReady(false)}
                      className="bg-white"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
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