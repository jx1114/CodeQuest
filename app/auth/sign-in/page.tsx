"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AchievementUnlockModal from "@/components/AchievementUnlockModal"
import { signIn } from "@/lib/auth"
import {
  getNewlyUnlockedAchievements,
  getProfileProgressSnapshot,
  updateLoginStreak,
  type ProfileAchievement,
  type ProfileProgressSnapshot,
} from "@/lib/progress"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [achievementUnlocks, setAchievementUnlocks] = useState<ProfileAchievement[]>([])
  const [showAchievementUnlockModal, setShowAchievementUnlockModal] = useState(false)

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)

      if (!result.success) {
        setError(result.error || "Invalid credentials")
        setIsLoading(false)
        return
      }

      let unlockedAchievements: ProfileAchievement[] = []

      if (result.user?.id) {
        const previousSnapshot: ProfileProgressSnapshot = await getProfileProgressSnapshot(result.user.id)
        await updateLoginStreak(result.user.id)
        const nextSnapshot = await getProfileProgressSnapshot(result.user.id)
        unlockedAchievements = getNewlyUnlockedAchievements(previousSnapshot, nextSnapshot)

        if (unlockedAchievements.length > 0) {
          setAchievementUnlocks(unlockedAchievements)
          setShowAchievementUnlockModal(true)
        }
      }

      // Store user info in sessionStorage
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          email: result.profile?.email,
          username: result.profile?.username,
          id: result.user?.id,
        })
      )

      setIsLoading(false)

      if (!result.user?.id || unlockedAchievements.length === 0) {
        // Redirect to challenges page
        router.push("/challenges")
      }
    } catch (err) {
      setError("An error occurred during sign in")
      setIsLoading(false)
    }
  }

  const continueToApp = () => {
    setIsLoading(false)
    setShowAchievementUnlockModal(false)
    setAchievementUnlocks([])
    router.push("/challenges")
  }

  return (
    <>
      <AchievementUnlockModal
        open={showAchievementUnlockModal}
        achievements={achievementUnlocks}
        onClose={continueToApp}
        primaryActionLabel="Continue to Challenges"
      />
      <div className="min-h-screen flex items-center justify-center bg-[#171744] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
              CodeQuest
            </Link>
            <p className="text-white/80 mt-2">Welcome back — sign in to continue</p>
          </div>

          <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border-0 overflow-hidden">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                Use your username or email to access your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 border border-red-100 p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

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

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>

                  <Link href="/auth/forgot" className="text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                Don't have an account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}