"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Clock, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState } from "react"

export interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  summary: string
  category: string
  imageUrl?: string
}

interface NewsCardProps {
  news: NewsItem
  onClick?: () => void
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getSentimentIcon = () => {
    switch (news.sentiment) {
      case "positive":
        return <TrendingUp className="w-3 h-3" />
      case "negative":
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getSentimentColor = () => {
    switch (news.sentiment) {
      case "positive":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30"
      case "negative":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30"
      default:
        return "bg-chart-2/20 text-chart-2 border-chart-2/30"
    }
  }

  return (
    <Card
      className={`glass cursor-pointer hover-lift hover:neon-glow shimmer transition-all duration-500 ${
        isHovered ? "h-auto glass-intense" : "h-48"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className="text-xs shimmer">
            {news.category}
          </Badge>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all duration-300 ${getSentimentColor()}`}
          >
            {getSentimentIcon()}
            <span className="font-medium capitalize">{news.sentiment}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg leading-tight mb-3 line-clamp-2 text-balance transition-colors duration-300 hover:text-accent">
          {news.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="font-medium">{news.source}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{news.date}</span>
          </div>
        </div>

        {/* Expandable Summary */}
        {isHovered && (
          <div className="mt-auto fade-in">
            <div className="border-t border-border/20 pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{news.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sentiment Score:</span>
                  <Badge variant="outline" className="text-xs">
                    {news.sentimentScore > 0 ? "+" : ""}
                    {news.sentimentScore}
                  </Badge>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* Spacer for consistent height when not hovered */}
        {!isHovered && <div className="flex-1" />}
      </div>
    </Card>
  )
}
