"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
}

export function LoadingSpinner({ size = "md", variant = "spinner" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  if (variant === "dots") {
    return (
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    )
  }

  if (variant === "pulse") {
    return <div className={`${sizeClasses[size]} bg-accent rounded-full pulse-glow`} />
  }

  return <div className={`loading-spinner ${sizeClasses[size]}`} />
}
