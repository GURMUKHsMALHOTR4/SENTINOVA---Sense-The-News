"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SentimentChart } from "@/components/sentiment-chart"
import { TrendingUp, Brain, Zap } from "lucide-react"

const trendingTopics = [
  { topic: "AI Technology", sentiment: "positive", mentions: 1247 },
  { topic: "Climate Change", sentiment: "negative", mentions: 892 },
  { topic: "Economic Growth", sentiment: "positive", mentions: 634 },
  { topic: "Healthcare Reform", sentiment: "neutral", mentions: 456 },
  { topic: "Space Exploration", sentiment: "positive", mentions: 321 },
]

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "bg-chart-1/20 text-chart-1 border-chart-1/30"
    case "negative":
      return "bg-chart-3/20 text-chart-3 border-chart-3/30"
    default:
      return "bg-chart-2/20 text-chart-2 border-chart-2/30"
  }
}

export function InsightsPanel() {
  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <Card className="glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">AI Global Mood</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-foreground">Today: Mostly Positive</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="bg-chart-1 h-2 rounded-full" style={{ width: "68%" }} />
            </div>
            <span className="text-xs text-muted-foreground">68%</span>
          </div>
        </div>
      </Card>

      {/* Sentiment Trend */}
      <Card className="glass p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Sentiment Trends</h3>
        </div>
        <SentimentChart />
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-chart-1 rounded-full" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-chart-2 rounded-full" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-chart-3 rounded-full" />
            <span>Negative</span>
          </div>
        </div>
      </Card>

      {/* Trending Topics */}
      <Card className="glass p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Trending Topics</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{topic.topic}</p>
                <p className="text-xs text-muted-foreground">{topic.mentions} mentions</p>
              </div>
              <Badge className={`text-xs ${getSentimentColor(topic.sentiment)}`} variant="outline">
                {topic.sentiment}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
