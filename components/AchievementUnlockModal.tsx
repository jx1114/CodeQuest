"use client"

import { useEffect } from "react"
import { X, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ProfileAchievement } from "@/lib/progress"

interface AchievementUnlockModalProps {
  open: boolean
  achievements: ProfileAchievement[]
  onClose: () => void
  primaryActionLabel?: string
}

export default function AchievementUnlockModal({
  open,
  achievements,
  onClose,
  primaryActionLabel = "Continue",
}: AchievementUnlockModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open || achievements.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <Card className="w-full max-w-lg overflow-hidden border-0 bg-white shadow-2xl shadow-slate-950/25">
        <div
          className="px-6 py-5 text-white"
          style={{ backgroundImage: "linear-gradient(135deg, #f59e0b 0%, #f97316 55%, #f43f5e 100%)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">Achievement unlocked</p>
                <h2 className="text-2xl font-bold">
                  {achievements.length === 1 ? "Congratulations" : `${achievements.length} badges unlocked`}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Close achievement popup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <CardContent className="space-y-5 p-6">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-slate-800">
            <p className="text-sm font-medium text-amber-800">You just earned:</p>
            <div className="mt-4 space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white shadow-sm">
                    {achievement.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{achievement.name}</h3>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Unlocked
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} className="min-w-32 bg-slate-900 text-white hover:bg-slate-800">
              {primaryActionLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}