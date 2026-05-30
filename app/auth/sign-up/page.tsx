"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signUp } from "@/lib/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      // Call Supabase sign up function
      const result = await signUp({ email, password, username })

      if (!result.success) {
        setError(result.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      // Store user info in sessionStorage
      sessionStorage.setItem("user", JSON.stringify({ email, username, id: result.user?.id }))

      setSuccess("Account created successfully.")
      setIsLoading(false)
    } catch (err) {
      setError("An error occurred during sign up")
      setIsLoading(false)
    }
  }

  const goToSignIn = () => {
    setSuccess("")
    router.push("/auth/sign-in")
  }

  return (
    <>
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-white/20 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Close success popup"
              className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Success</h2>
            <p className="mt-2 text-sm text-slate-600">{success}</p>
            <Button
              type="button"
              onClick={goToSignIn}
              className="mt-6 w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all"
            >
              Go to sign in
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-[#171744] px-4 py-12">
        <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
            CodeQuest
          </Link>
          <p className="text-white/80 mt-2">Start your coding journey today</p>
        </div>

        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border-0 overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Enter your details to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-100 p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}