"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SentimentMeter } from "@/components/sentiment-meter"
import { Clock, TrendingUp } from "lucide-react"

interface Article {
  id: string
  title: string
  source: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
}

interface ArticleSidebarProps {
  article: Article
}

const relatedArticles = [
  {
    id: "2",
    title: "AI Ethics Guidelines Released by Tech Consortium",
    source: "Wired",
    sentiment: "neutral" as const,
    sentimentScore: 0.12,
    readTime: "3 min",
  },
  {
    id: "3",
    title: "Healthcare Costs Continue Rising Despite Innovation",
    source: "Health Today",
    sentiment: "negative" as const,
    sentimentScore: -0.45,
    readTime: "4 min",
  },
  {
    id: "4",
    title: "Medical AI Shows Promise in Clinical Trials",
    source: "Medical News",
    sentiment: "positive" as const,
    sentimentScore: 0.67,
    readTime: "6 min",
  },
]

export function ArticleSidebar({ article }: ArticleSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Sentiment Analysis */}
      <Card className="glass p-6">
        <h3 className="font-serif font-bold text-lg mb-4">Sentiment Analysis</h3>
        <SentimentMeter score={article.sentimentScore} size="lg" />

        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence:</span>
            <span className="font-medium">94%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Emotional Tone:</span>
            <span className="font-medium capitalize">{article.sentiment}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bias Score:</span>
            <span className="font-medium">Low</span>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="font-serif font-bold text-lg">Key Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-chart-1/10 border border-chart-1/20 rounded-lg">
            <p className="text-sm text-chart-1 font-medium">Innovation Impact</p>
            <p className="text-xs text-muted-foreground mt-1">High potential for healthcare transformation</p>
          </div>
          <div className="p-3 bg-chart-2/10 border border-chart-2/20 rounded-lg">
            <p className="text-sm text-chart-2 font-medium">Market Response</p>
            <p className="text-xs text-muted-foreground mt-1">Cautious optimism from industry experts</p>
          </div>
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-accent font-medium">Timeline</p>
            <p className="text-xs text-muted-foreground mt-1">18-month deployment window expected</p>
          </div>
        </div>
      </Card>

      {/* Related Articles */}
      <Card className="glass p-6">
        <h3 className="font-serif font-bold text-lg mb-4">Related Articles</h3>
        <div className="space-y-4">
          {relatedArticles.map((relatedArticle) => (
            <div key={relatedArticle.id} className="group cursor-pointer">
              <div className="p-3 rounded-lg hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      relatedArticle.sentiment === "positive"
                        ? "bg-chart-1/20 text-chart-1 border-chart-1/30"
                        : relatedArticle.sentiment === "negative"
                          ? "bg-chart-3/20 text-chart-3 border-chart-3/30"
                          : "bg-chart-2/20 text-chart-2 border-chart-2/30"
                    }`}
                  >
                    {relatedArticle.sentiment}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm leading-tight mb-2 group-hover:text-accent transition-colors">
                  {relatedArticle.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{relatedArticle.source}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{relatedArticle.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
