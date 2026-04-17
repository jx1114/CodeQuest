"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Zap, Trophy, Award } from "lucide-react"
import { signOut } from "@/lib/auth"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    sessionStorage.removeItem("user")
    setIsLoggedIn(false)
  }

  useEffect(() => {
    // Check if user is logged in
    const user = sessionStorage.getItem("user")
    setIsLoggedIn(!!user)
  }, [])

  return (
    <div className="min-h-screen bg-[#d5d5ed]">
      {/* Navigation */}
      <nav className="bg-[#171744]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold text-primary">CodeQuest</h1>
          <div className="space-x-4 flex items-center ml-auto">
            {isLoggedIn ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" className="transition-transform hover:scale-105 active:scale-110">Profile</Button>
                </Link>
                <Button
                  variant="outline"
                  className="transition-transform hover:scale-105 active:scale-110"
                  onClick={() => void handleSignOut()}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  className="bg-transparent hover:bg-white/10 text-white font-semibold transition-all duration-300 rounded-lg px-6"
                >
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-white text-[#171744] font-semibold hover:text-[#6b2ba0]"
                >
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Learn Programming Through Interactive Games</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Master Python, Java, and C++ with engaging challenges, structured lessons, and a competitive leaderboard. From
          beginner to expert, we've got you covered.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild className="bg-[#4b1279] text-white transition-transform hover:scale-105 active:scale-110">
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
          <Button size="lg" className="bg-white text-black transition-transform hover:scale-105 active:scale-110">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why CodeQuest?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Learn",
                description: "Structured lessons covering fundamentals of programming",
              },
              {
                icon: Zap,
                title: "Challenge",
                description: "Level-based challenges with progressive difficulty",
              },
              {
                icon: Trophy,
                title: "Compete",
                description: "Daily leaderboards and compete with other players",
              },
              {
                icon: Award,
                title: "Achieve",
                description: "Earn badges and certificates as you progress",
              },
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-none transform hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <footer className="mt-20 bg-[#4b1279] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-lg mb-6 opacity-90">Join thousands of students learning to code</p>
          <div>
            <Button
              size="lg"
              asChild
              className="bg-white text-black font-semibold transition-transform hover:scale-105 active:scale-110"
            >
              <Link href="/auth/sign-up">
                Sign Up Now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">© {new Date().getFullYear()} CodeQuest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
