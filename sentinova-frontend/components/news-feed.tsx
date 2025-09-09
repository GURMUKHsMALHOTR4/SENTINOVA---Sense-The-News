"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { AnimatedCounter } from "@/components/animated-counter"

interface Article {
  id: string
  title: string
  source: string
  publishedAt: string
  url: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  category: string
  description?: string
  imageUrl?: string
}

interface NewsFeedProps {
  searchQuery?: string
  selectedCategory?: string
  selectedSentiment?: string
}

export function NewsFeed({ searchQuery, selectedCategory, selectedSentiment }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Mock data generator
  const generateMockArticles = (pageNum: number, count = 12): Article[] => {
    const categories = ["Technology", "Politics", "Business", "Science", "Health", "Sports", "Entertainment"]
    const sources = ["TechCrunch", "Reuters", "BBC", "CNN", "The Guardian", "Forbes", "Wired", "Bloomberg"]

    const mockTitles = [
      "Revolutionary AI System Transforms Healthcare Diagnostics",
      "Global Climate Summit Reaches Breakthrough Agreement",
      "Cryptocurrency Market Shows Signs of Recovery",
      "New Space Mission Discovers Potential Life Signs",
      "Tech Giants Announce Major Sustainability Initiative",
      "Economic Indicators Point to Steady Growth",
      "Breakthrough in Quantum Computing Research",
      "International Trade Relations Show Improvement",
      "Medical Research Reveals Promising Treatment",
      "Renewable Energy Adoption Accelerates Globally",
      "Cybersecurity Threats Evolve with New Technology",
      "Social Media Platforms Implement New Policies",
    ]

    return Array.from({ length: count }, (_, i) => {
      const sentiments: Array<"positive" | "neutral" | "negative"> = ["positive", "neutral", "negative"]
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
      const sentimentScore =
        sentiment === "positive"
          ? Math.random() * 0.8 + 0.2
          : sentiment === "negative"
            ? -(Math.random() * 0.8 + 0.2)
            : (Math.random() - 0.5) * 0.4

      return {
        id: `${pageNum}-${i}`,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        url: `https://example.com/article-${pageNum}-${i}`,
        sentiment,
        sentimentScore,
        category: categories[Math.floor(Math.random() * categories.length)],
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        imageUrl: `/placeholder.svg?height=200&width=300&query=news-${i}`,
      }
    })
  }

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      const initialArticles = generateMockArticles(1)
      setArticles(initialArticles)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter articles based on search, category, and sentiment
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "all" ||
      article.category.toLowerCase() === selectedCategory.toLowerCase()

    const matchesSentiment =
      !selectedSentiment || selectedSentiment === "all" || article.sentiment === selectedSentiment

    return matchesSearch && matchesCategory && matchesSentiment
  })

  // Load more articles
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    setTimeout(() => {
      const newArticles = generateMockArticles(page + 1)
      setArticles((prev) => [...prev, ...newArticles])
      setPage((prev) => prev + 1)
      setIsLoadingMore(false)

      // Simulate end of data after 5 pages
      if (page >= 4) {
        setHasMore(false)
      }
    }, 1500)
  }, [page, isLoadingMore, hasMore])

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />
      case "negative":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article, index) => (
          <div
            key={article.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card
              className="group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm hover:bg-card/80"
              onClick={() => openArticle(article.url)}
            >
              {/* Article Image */}
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-3 left-3 transform transition-all duration-300 group-hover:scale-105">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium bg-background/90 text-foreground backdrop-blur-sm"
                  >
                    {article.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 transform transition-all duration-500 group-hover:rotate-12">
                  <ExternalLink className="h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg" />
                </div>
              </div>

              <CardHeader className="space-y-3">
                {/* Sentiment Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={`${getSentimentColor(article.sentiment)} text-xs flex items-center gap-1 transition-all duration-300 group-hover:scale-105`}
                  >
                    <span className="transition-transform duration-300 group-hover:rotate-12">
                      {getSentimentIcon(article.sentiment)}
                    </span>
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                    <span className="ml-1 opacity-80">
                      <AnimatedCounter value={Math.abs(article.sentimentScore)} decimals={2} />
                    </span>
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    <Clock className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-all duration-300 group-hover:scale-[1.02] origin-left">
                  {article.title}
                </h3>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Description */}
                {article.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 text-pretty transition-colors duration-300 group-hover:text-foreground/80">
                    {article.description}
                  </p>
                )}

                {/* Source */}
                <div className="flex items-center justify-between group-hover:scale-[1.02] transition-transform duration-300">
                  <span className="text-sm font-medium text-foreground">{article.source}</span>
                  <div className="h-px bg-border flex-1 mx-3 transition-colors duration-300 group-hover:bg-primary/30" />
                  <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                    Read more
                  </span>
                </div>
              </CardContent>

              <div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(var(--primary), 0.1) 50%, transparent 70%)",
                }}
              />
            </Card>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredArticles.length === 0 && !isLoading && (
        <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center animate-pulse">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filter settings.</p>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredArticles.length > 0 && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="min-w-32 bg-transparent hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 group"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              <span className="group-hover:scale-105 transition-transform duration-200">Load More Articles</span>
            )}
          </Button>
        </div>
      )}

      {/* Loading More Skeleton */}
      {isLoadingMore && <LoadingSkeleton />}

      {/* End of Results */}
      {!hasMore && filteredArticles.length > 0 && (
        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground">You've reached the end of the news feed.</p>
          </div>
        </div>
      )}
    </div>
  )
}
