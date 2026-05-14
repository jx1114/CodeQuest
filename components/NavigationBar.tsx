"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, BookOpen, Award, User, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth"

export default function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    try {
      sessionStorage.removeItem("user")
    } catch (e) {
      // ignore
    }
    try {
      localStorage.removeItem("user")
    } catch (e) {
      // ignore
    }
    router.push("/")
  }

  const navItems = [
    { href: "/challenges", label: "Challenges", icon: Trophy },
    { href: "/learning", label: "Learning", icon: BookOpen },
    { href: "/leaderboard", label: "Leaderboard", icon: Award },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="bg-[#171744] border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white">
            CodeQuest
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            className="bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg px-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                    isActive ? "text-white" : "text-white/60"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}