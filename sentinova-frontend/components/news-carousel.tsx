"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Article {
  id: string
  title: string
  source: string
  publishedAt: string
  url: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore?: number
  category?: string
  description?: string
}

export function NewsCarousel() {
  const [articles, setArticles] = useState<Article[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    const mockArticles: Article[] = [
      {
        id: "1",
        title: "AI Technology Breakthrough Revolutionizes Healthcare Industry",
        source: "TechNews",
        publishedAt: "2024-01-15T10:30:00Z",
        url: "https://example.com/article1",
        sentiment: "positive",
        sentimentScore: 0.8,
        category: "Technology",
        description: "Revolutionary AI system shows promising results in medical diagnosis...",
      },
      {
        id: "2",
        title: "Global Climate Summit Reaches Historic Agreement",
        source: "Environmental Times",
        publishedAt: "2024-01-15T08:15:00Z",
        url: "https://example.com/article2",
        sentiment: "positive",
        sentimentScore: 0.7,
        category: "Environment",
      },
      {
        id: "3",
        title: "Market Volatility Continues Amid Economic Uncertainty",
        source: "Financial Daily",
        publishedAt: "2024-01-15T07:45:00Z",
        url: "https://example.com/article3",
        sentiment: "negative",
        sentimentScore: -0.6,
        category: "Finance",
      },
      {
        id: "4",
        title: "New Space Mission Launches Successfully",
        source: "Space Explorer",
        publishedAt: "2024-01-15T06:20:00Z",
        url: "https://example.com/article4",
        sentiment: "positive",
        sentimentScore: 0.9,
        category: "Science",
      },
      {
        id: "5",
        title: "International Trade Negotiations Show Mixed Results",
        source: "Global Business",
        publishedAt: "2024-01-15T05:10:00Z",
        url: "https://example.com/article5",
        sentiment: "neutral",
        sentimentScore: 0.1,
        category: "Business",
      },
    ]

    // Simulate API loading
    setTimeout(() => {
      setArticles(mockArticles)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || articles.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [articles.length, isAutoPlaying])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-[color:var(--sentiment-positive)] text-white"
      case "negative":
        return "bg-[color:var(--sentiment-negative)] text-white"
      default:
        return "bg-[color:var(--sentiment-neutral)] text-white"
    }
  }

  const getSentimentLabel = (sentiment: string) => {
    return sentiment.charAt(0).toUpperCase() + sentiment.slice(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
    setIsAutoPlaying(false)
  }

  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-card rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
        <div className="absolute inset-4 space-y-4 animate-pulse">
          <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-muted-foreground/20 rounded" />
            <div className="h-6 w-1/2 bg-muted-foreground/20 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
            <div className="h-4 w-16 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-card rounded-lg flex items-center justify-center animate-in fade-in duration-500">
        <p className="text-muted-foreground">No articles available</p>
      </div>
    )
  }

  const currentArticle = articles[currentIndex]

  return (
    <div className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Carousel */}
      <div
        className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-card to-card/80 rounded-lg overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]"
        onClick={() => openArticle(currentArticle.url)}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-all duration-500 group-hover:from-black/80" />

        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-20 p-4 sm:p-6 h-full flex flex-col justify-between transition-all duration-500 group-hover:scale-105">
          <div className="flex items-start justify-between">
            <Badge
              className={`${getSentimentColor(currentArticle.sentiment)} text-xs font-medium transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
            >
              {getSentimentLabel(currentArticle.sentiment)}
            </Badge>
            <ExternalLink className="h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
          </div>

          <div className="space-y-2 sm:space-y-3 transform transition-all duration-500 group-hover:translate-y-[-4px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight text-balance line-clamp-2 sm:line-clamp-3 transition-all duration-300 group-hover:text-shadow-lg">
              {currentArticle.title}
            </h3>

            <div className="flex items-center justify-between text-xs sm:text-sm text-white/80 transition-all duration-300 group-hover:text-white/90">
              <span className="font-medium truncate mr-2 transition-all duration-300 group-hover:scale-105">
                {currentArticle.source}
              </span>
              <span className="whitespace-nowrap transition-all duration-300 group-hover:scale-105">
                {formatDate(currentArticle.publishedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 h-8 w-8 sm:h-10 sm:w-10 hover:scale-110 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 hover:scale-110" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 h-8 w-8 sm:h-10 sm:w-10 hover:scale-110 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 hover:scale-110" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-500 hover:scale-125 ${
              index === currentIndex
                ? "bg-primary w-4 sm:w-6 shadow-lg shadow-primary/50"
                : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
            }`}
            onClick={() => {
              setCurrentIndex(index)
              setIsAutoPlaying(false)
            }}
          />
        ))}
      </div>

      {/* Article Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mt-4 sm:mt-6">
        {articles.slice(0, 5).map((article, index) => (
          <div
            key={article.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card
              className={`cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1 hover:scale-105 ${
                index === currentIndex ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-105" : ""
              }`}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
            >
              <CardContent className="p-2 sm:p-4">
                <Badge
                  className={`${getSentimentColor(article.sentiment)} text-xs mb-1 sm:mb-2 transition-all duration-300 hover:scale-105`}
                >
                  {getSentimentLabel(article.sentiment)}
                </Badge>
                <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 mb-1 sm:mb-2 transition-colors duration-300 hover:text-primary">
                  {article.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate mr-1">{article.source}</span>
                  <span className="whitespace-nowrap text-xs">{formatDate(article.publishedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
