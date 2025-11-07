import React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn("flex h-10 w-full rounded-md border px-3 py-2 text-sm placeholder:opacity-70 disabled:opacity-50", className)} {...props} />
})
Input.displayName = "Input"