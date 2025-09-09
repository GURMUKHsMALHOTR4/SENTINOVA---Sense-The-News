"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Share2, Bookmark, Clock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Article {
  id: string
  title: string
  source: string
  author: string
  date: string
  readTime: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  category: string
  content: string
  imageUrl?: string
  tags: string[]
}

interface ArticleContentProps {
  article: Article
}

export function ArticleContent({ article }: ArticleContentProps) {
  const router = useRouter()

  const highlightSentiment = (content: string) => {
    // Simple sentiment highlighting - in a real app, this would use NLP
    const positiveWords = ["breakthrough", "revolutionary", "success", "remarkable", "improving", "significantly"]
    const negativeWords = ["concerns", "problems", "issues", "challenges", "difficulties"]

    let highlightedContent = content

    positiveWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      highlightedContent = highlightedContent.replace(
        regex,
        `<span class="bg-chart-1/20 text-chart-1 px-1 rounded">${word}</span>`,
      )
    })

    negativeWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      highlightedContent = highlightedContent.replace(
        regex,
        `<span class="bg-chart-3/20 text-chart-3 px-1 rounded">${word}</span>`,
      )
    })

    return highlightedContent
  }

  return (
    <Card className="glass p-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Article Header */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{article.category}</Badge>
          <Badge
            className={`${
              article.sentiment === "positive"
                ? "bg-chart-1/20 text-chart-1 border-chart-1/30"
                : article.sentiment === "negative"
                  ? "bg-chart-3/20 text-chart-3 border-chart-3/30"
                  : "bg-chart-2/20 text-chart-2 border-chart-2/30"
            }`}
            variant="outline"
          >
            {article.sentiment} sentiment
          </Badge>
        </div>

        <h1 className="font-serif font-bold text-4xl lg:text-5xl leading-tight text-balance">{article.title}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{article.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {article.date} • {article.readTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {article.imageUrl && (
        <div className="mb-8">
          <Image
            src={article.imageUrl || "/placeholder.svg"}
            alt={article.title}
            width={800}
            height={400}
            className="w-full h-64 lg:h-96 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <div
          className="text-foreground leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{
            __html: highlightSentiment(article.content),
          }}
        />
      </div>

      {/* Tags */}
      <div className="mt-8 pt-6 border-t border-border/20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Tags:</span>
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
