"use client"

import { Spinner } from "@/components/ui/spinner"

export function LoadingSpinner({ 
  size = "default", 
  text = "Carregando...", 
  showText = true,
  className = "" 
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8", 
    large: "w-12 h-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Spinner className={`${sizeClasses[size]} text-primary`} />
      {showText && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export function PageLoadingSpinner({ text = "Carregando..." }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-8 h-8 text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

export function InlineLoadingSpinner({ text = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center py-4">
      <Spinner className="w-6 h-6 text-primary mr-2" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}
