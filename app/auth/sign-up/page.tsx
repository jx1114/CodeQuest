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
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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

      // Redirect to challenges page
      router.push("/challenges")
    } catch (err) {
      setError("An error occurred during sign up")
      setIsLoading(false)
    }
  }

  return (
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
  )
}