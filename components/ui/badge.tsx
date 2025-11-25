import React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-input bg-transparent text-foreground",
    }
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", variants[variant], className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }