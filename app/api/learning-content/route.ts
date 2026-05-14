import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface LanguageRow {
  id: string
  name: string
  description: string
  icon: string
  order_index: number
}

interface CourseRow {
  id: string
  language_id: string
  title: string
  description: string
  order_index: number
}

interface ChapterRow {
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

const cppExampleOverrides: Record<string, string> = {
  "cpp-ch2":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  int age = 21;\n  double price = 94.50;\n\n  cout << age << endl;\n  cout << fixed << setprecision(2) << "Price: " << price << endl;\n  return 0;\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>',
  "cpp-ch3":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include <iostream>\nusing namespace std;\n\nint main() {\n  int score = 75;\n\n  if (score >= 60) {\n    cout << "Pass" << endl;\n  }\n\n  for (int i = 1; i <= 3; i++) {\n    cout << i << endl;\n  }\n\n  return 0;\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>',
  "cpp-ch4":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include <iostream>\nusing namespace std;\n\nint add(int a, int b) {\n  return a + b;\n}\n\nint main() {\n  cout << add(2, 3) << endl;\n  return 0;\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>',
  "cpp-ch5":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n  map<string, int> scores;\n  scores["Ana"] = 90;\n\n  cout << scores["Ana"] << endl;\n  return 0;\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>',
}

const javaExampleOverrides: Record<string, string> = {
  "java-ch2":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>public class Main {\n  public static void main(String[] args) {\n    int age = 21;\n    double price = 94.50;\n\n    System.out.println(age);\n    System.out.printf("Price: %.2f", price);\n  }\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>',
  "java-ch3":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>public class Main {\n  public static void main(String[] args) {\n    int score = 75;\n\n    if (score >= 60) {\n      System.out.println("Pass");\n    }\n\n    for (int i = 1; i <= 3; i++) {\n      System.out.println(i);\n    }\n  }\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>',
  "java-ch4":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>public class Main {\n  public static int add(int a, int b) {\n    return a + b;\n  }\n\n  public static void main(String[] args) {\n    System.out.println(add(2, 3));\n  }\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>',
  "java-ch5":
    '<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>import java.util.HashMap;\n\npublic class Main {\n  public static void main(String[] args) {\n    HashMap<String, Integer> scores = new HashMap<>();\n    scores.put("Ana", 90);\n\n    System.out.println(scores.get("Ana"));\n  }\n}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>',
}

const chapterExampleOverrides: Record<string, string> = {
  ...cppExampleOverrides,
  ...javaExampleOverrides,
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase env vars. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 500 }
      )
    }

    const admin = createClient(supabaseUrl, serviceRoleKey || anonKey || "")

    const [languagesResult, coursesResult, chaptersResult] = await Promise.all([
      admin.from("learning_languages").select("id,name,description,icon,order_index").order("order_index", { ascending: true }),
      admin.from("learning_courses").select("id,language_id,title,description,order_index").order("order_index", { ascending: true }),
      admin
        .from("learning_chapters")
        .select(
          "id,course_id,title,description,explanation_html,example_html,mini_practice_example_html,mini_practice_output,mini_practice_question,mini_practice_answer,order_index"
        )
        .order("order_index", { ascending: true }),
    ])

    if (languagesResult.error) {
      return NextResponse.json({ error: languagesResult.error.message }, { status: 500 })
    }

    if (coursesResult.error) {
      return NextResponse.json({ error: coursesResult.error.message }, { status: 500 })
    }

    if (chaptersResult.error) {
      return NextResponse.json({ error: chaptersResult.error.message }, { status: 500 })
    }

    const chapters = ((chaptersResult.data ?? []) as ChapterRow[]).map((chapter) => {
      const exampleOverride = chapterExampleOverrides[chapter.id]
      if (!exampleOverride) {
        return chapter
      }

      return {
        ...chapter,
        example_html: exampleOverride,
      }
    })

    return NextResponse.json({
      languages: (languagesResult.data ?? []) as LanguageRow[],
      courses: (coursesResult.data ?? []) as CourseRow[],
      chapters,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
