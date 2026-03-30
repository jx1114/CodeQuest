import { NextResponse } from "next/server"

type ExecuteRequest = {
  language: "Python" | "Java" | "C++"
  code: string
}

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true"

const LANGUAGE_ID: Record<ExecuteRequest["language"], number> = {
  Python: 71,
  Java: 62,
  "C++": 54,
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExecuteRequest

    if (!body?.language || !body?.code?.trim()) {
      return NextResponse.json({ error: "Language and code are required." }, { status: 400 })
    }

    const response = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: body.code,
        language_id: LANGUAGE_ID[body.language],
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Execution service is unavailable." }, { status: 502 })
    }

    const result = await response.json()

    const stdout = result?.stdout ?? ""
    const stderr = result?.stderr ?? ""
    const compileOutput = result?.compile_output ?? ""
    const message = result?.message ?? ""
    const output = `${stdout}${stderr}${compileOutput}${message}`.trim()

    return NextResponse.json({
      stdout,
      stderr,
      compileOutput,
      message,
      output,
      status: result?.status?.description ?? "",
    })
  } catch {
    return NextResponse.json({ error: "Execution service error." }, { status: 500 })
  }
}
