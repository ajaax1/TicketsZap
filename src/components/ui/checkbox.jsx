"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(function Checkbox(
  { className, checked, onCheckedChange, disabled, ...props },
  ref
) {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked)
    }
  }

  return (
    <label
      className={cn(
        "relative inline-flex items-center cursor-pointer",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "relative h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-primary text-primary-foreground",
          !checked && "bg-background",
          className
        )}
      >
        {checked && (
          <Check className="absolute inset-0 h-4 w-4 text-current flex items-center justify-center" />
        )}
      </div>
    </label>
  )
})

Checkbox.displayName = "Checkbox"

export { Checkbox }

