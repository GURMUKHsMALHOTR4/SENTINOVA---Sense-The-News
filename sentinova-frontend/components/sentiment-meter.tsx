"use client"

export interface SentimentMeterProps {
  score: number // -1 to 1
  size?: "sm" | "md" | "lg"
}

export function SentimentMeter({ score, size = "md" }: SentimentMeterProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  // Convert score (-1 to 1) to angle (0 to 180 degrees)
  const angle = ((score + 1) / 2) * 180

  // Determine color based on score
  const getColor = () => {
    if (score > 0.3) return "hsl(var(--chart-1))" // Green
    if (score < -0.3) return "hsl(var(--chart-3))" // Red
    return "hsl(var(--chart-2))" // Yellow
  }

  const getSentimentLabel = () => {
    if (score > 0.5) return "Very Positive"
    if (score > 0.1) return "Positive"
    if (score > -0.1) return "Neutral"
    if (score > -0.5) return "Negative"
    return "Very Negative"
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Background arc */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 126} 126`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-foreground origin-bottom transform -translate-x-1/2 -translate-y-full transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(-50%, -100%) rotate(${angle - 90}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-foreground rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="text-center">
        <div className={`font-bold ${textSizes[size]}`} style={{ color: getColor() }}>
          {getSentimentLabel()}
        </div>
        <div className={`text-muted-foreground ${textSizes[size]}`}>
          Score: {score > 0 ? "+" : ""}
          {score.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
