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

    return NextResponse.json({
      languages: (languagesResult.data ?? []) as LanguageRow[],
      courses: (coursesResult.data ?? []) as CourseRow[],
      chapters: (chaptersResult.data ?? []) as ChapterRow[],
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
