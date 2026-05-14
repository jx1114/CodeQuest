"use client"

import { useEffect } from "react"

export default function AuthBootstrap() {
  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem("user")
      if (!sessionUser) {
        const localUser = localStorage.getItem("user")
        if (localUser) {
          sessionStorage.setItem("user", localUser)
        }
      }
    } catch (e) {
      // Ignore storage errors (e.g., when disabled)
    }
  }, [])

  return null
}
