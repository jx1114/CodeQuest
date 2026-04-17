"use client"

import { type FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  requestPasswordResetCode,
  setNewPasswordAfterCodeVerification,
  verifyPasswordResetCode,
} from "@/lib/auth"

type ResetStep = "request" | "verify" | "set-password"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetSuccess, setIsResetSuccess] = useState(false)

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])

  const handleRequestCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!normalizedEmail) {
      setError("Please enter your email")
      return
    }

    setIsLoading(true)

    try {
      const result = await requestPasswordResetCode(normalizedEmail)

      if (!result.success) {
        setError(result.error || "Unable to send verification code")
        setIsLoading(false)
        return
      }

      setStep("verify")
      setSuccess("Verification code sent. Check your inbox and enter the code below.")
      setIsLoading(false)
    } catch {
      setError("An error occurred while requesting the verification code")
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!normalizedEmail || !code) {
      setError("Email and verification code are required")
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyPasswordResetCode({
        email: normalizedEmail,
        code,
      })

      if (!result.success) {
        setError(result.error || "Invalid verification code")
        setIsLoading(false)
        return
      }

      setStep("set-password")
      setSuccess("Verification successful. You can now set a new password.")
      setIsLoading(false)
    } catch {
      setError("An error occurred while verifying the code")
      setIsLoading(false)
    }
  }

  const handleSetNewPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const result = await setNewPasswordAfterCodeVerification(newPassword)

      if (!result.success) {
        setError(result.error || "Invalid verification code")
        setIsLoading(false)
        return
      }

      setSuccess("Password reset successful. You can now sign in with your new password.")
      setIsResetSuccess(true)
      setIsLoading(false)
    } catch {
      setError("An error occurred while resetting your password")
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setSuccess("")

    if (!normalizedEmail) {
      setError("Please enter your email")
      return
    }

    setIsLoading(true)

    try {
      const result = await requestPasswordResetCode(normalizedEmail)

      if (!result.success) {
        setError(result.error || "Unable to resend verification code")
        setIsLoading(false)
        return
      }

      setSuccess("Verification code resent. Please check your inbox.")
      setIsLoading(false)
    } catch {
      setError("An error occurred while resending the verification code")
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
          <p className="text-white/80 mt-2">Reset your password securely</p>
        </div>

        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border-0 overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {step === "request"
                ? "Enter your email to receive a verification code"
                : step === "verify"
                ? "Enter the verification code sent to your email"
                : "Set your new password"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            {error && <div className="rounded-md bg-red-50 border border-red-100 p-3 text-red-700 text-sm mb-4">{error}</div>}
            {success && <div className="rounded-md bg-green-50 border border-green-100 p-3 text-green-700 text-sm mb-4">{success}</div>}

            {step === "request" ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all"
                >
                  {isLoading ? "Sending code..." : "Send Verification Code"}
                </Button>
              </form>
            ) : step === "verify" ? (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <Input
                  id="email-verify"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isResetSuccess}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />

                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading || isResetSuccess}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all"
                >
                  {isLoading ? "Verifying code..." : "Verify Code"}
                </Button>

                {!isResetSuccess && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => void handleResendCode()}
                    className="w-full h-11"
                  >
                    Resend Code
                  </Button>
                )}
              </form>
            ) : (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <Input
                  id="new-password"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading || isResetSuccess}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />

                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || isResetSuccess}
                  className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                />

                {!isResetSuccess ? (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all"
                  >
                    {isLoading ? "Resetting password..." : "Reset Password"}
                  </Button>
                ) : (
                  <Button asChild className="w-full h-11 text-base font-semibold bg-[#4b1279] text-white hover:opacity-95 transition-all">
                    <Link href="/auth/sign-in">Back to Sign In</Link>
                  </Button>
                )}
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              Remember your password?{" "}
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
