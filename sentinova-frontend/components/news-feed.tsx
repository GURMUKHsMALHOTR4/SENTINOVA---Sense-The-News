// src/components/NewsFeed.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { AnimatedCounter } from "@/components/animated-counter"

// ... (interfaces unchanged)
interface BackendSentiment { id: string; label: string; score: number; createdAt?: string }
interface BackendArticle { id: string; title?: string; source?: string; fetchedAt?: string; publishedAt?: string; url?: string; category?: string; summary?: string; content?: string; imageUrl?: string | null; sentiments?: BackendSentiment[]; [k: string]: any }
interface Article { id: string; title: string; source: string; publishedAt: string; url?: string; sentiment: "positive" | "neutral" | "negative" | "unknown"; sentimentScore: number; category: string; description?: string; imageUrl?: string | undefined; fetchedAt?: string }

interface NewsFeedProps { searchQuery?: string; selectedCategory?: string; selectedSentiment?: string }

const BACKEND_BASE = "http://localhost:8000"
const FETCH_COUNT = 50
const POLL_INTERVAL_MS = 45_000
const PAGE_SIZE = 9
const PLACEHOLDER = "/default-article.jpg" // use your downloaded default image placed in public/

export function NewsFeed({ searchQuery, selectedCategory, selectedSentiment }: NewsFeedProps) {
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const pollRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const normalizeLabel = (raw?: string, score?: number): Article["sentiment"] => {
    if (!raw && typeof score === "number") {
      if (score > 0.1) return "positive"
      if (score < -0.1) return "negative"
      return "neutral"
    }
    if (!raw) return "unknown"
    const s = raw.toString().trim().toLowerCase()
    if (s.includes("pos") || s.includes("positive")) return "positive"
    if (s.includes("neg") || s.includes("negative")) return "negative"
    if (s.includes("neu") || s.includes("neutral")) return "neutral"
    const asNum = Number(s.replace(/[^\d.-]/g, ""))
    if (!Number.isNaN(asNum)) {
      if (asNum > 0.1) return "positive"
      if (asNum < -0.1) return "negative"
      return "neutral"
    }
    return "unknown"
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-600 text-white"
      case "negative": return "bg-red-600 text-white"
      case "neutral": return "bg-gray-500 text-white"
      default: return "bg-gray-300 text-gray-800"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="h-3 w-3" />
      case "negative": return <TrendingDown className="h-3 w-3" />
      default: return <Minus className="h-3 w-3" />
    }
  }

  const isValidExternalUrl = (url?: string) => {
    if (!url) return false
    const u = url.trim().toLowerCase()
    if (u === "#" || u === "" || u.includes("example.com") || u.includes("about:blank")) return false
    return u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:")
  }

  const mapBackendArticle = (b: BackendArticle): Article => {
    let sentiment: Article["sentiment"] = "unknown"
    let sentimentScore = 0

    if (Array.isArray(b.sentiments) && b.sentiments.length > 0) {
      const sorted = [...b.sentiments].sort((a, c) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = c.createdAt ? new Date(c.createdAt).getTime() : 0
        return tb - ta
      })
      const s = sorted[0]
      const rawLabel = s?.label
      const rawScore = typeof s?.score === "number" ? s.score : Number(s?.score ?? NaN)
      sentiment = normalizeLabel(rawLabel, Number.isFinite(rawScore) ? rawScore : undefined)
      sentimentScore = Number.isFinite(rawScore) ? rawScore : 0
    } else {
      const candidateLabel = (b as any).sentimentLabel ?? (b as any).sentiment ?? undefined
      const candidateScore = (b as any).sentimentScore ?? (b as any).score ?? undefined
      if (candidateLabel || typeof candidateScore === "number") {
        sentiment = normalizeLabel(candidateLabel, typeof candidateScore === "number" ? candidateScore : undefined)
        sentimentScore = typeof candidateScore === "number" ? candidateScore : 0
      } else {
        const text = `${b.title ?? ""} ${b.summary ?? ""} ${b.content ?? ""}`.toLowerCase()
        if (text.includes("good") || text.includes("positive") || text.includes("rise") || text.includes("up")) sentiment = "positive"
        else if (text.includes("bad") || text.includes("negative") || text.includes("fall") || text.includes("down")) sentiment = "negative"
        else sentiment = "neutral"
        sentimentScore = 0
      }
    }

    const imageUrl = isValidExternalUrl(b.imageUrl ?? undefined) ? (b.imageUrl as string) : undefined

    return {
      id: String(b.id ?? Math.random().toString(36).slice(2, 9)),
      title: b.title || "Untitled",
      source: b.source || "Unknown",
      publishedAt: b.publishedAt || b.fetchedAt || new Date().toISOString(),
      url: b.url ?? undefined,
      sentiment,
      sentimentScore,
      category: b.category || "General",
      description: b.summary || b.content || "",
      imageUrl,
      fetchedAt: b.fetchedAt,
    }
  }

  const mergeArticles = (incoming: BackendArticle[]) => {
    setAllArticles((prev) => {
      const map = new Map(prev.map((a) => [a.id, a]))
      incoming.forEach((b) => {
        const mapped = mapBackendArticle(b)
        const existing = map.get(mapped.id)
        if (!existing) map.set(mapped.id, mapped)
        else {
          const existingTime = existing.fetchedAt ? new Date(existing.fetchedAt).getTime() : 0
          const incomingTime = mapped.fetchedAt ? new Date(mapped.fetchedAt).getTime() : 0
          if (incomingTime >= existingTime) map.set(mapped.id, mapped)
        }
      })
      return Array.from(map.values()).sort((a, b) => {
        const ta = a.fetchedAt ? new Date(a.fetchedAt).getTime() : new Date(a.publishedAt).getTime()
        const tb = b.fetchedAt ? new Date(b.fetchedAt).getTime() : new Date(b.publishedAt).getTime()
        return tb - ta
      })
    })
  }

  const fetchArticlesFromBackend = useCallback(async () => {
    try {
      const resp = await fetch(`${BACKEND_BASE}/api/articles/recent/${FETCH_COUNT}`, {
        headers: { Accept: "application/json" },
        mode: "cors",
      })
      if (!resp.ok) {
        console.warn("failed to fetch articles:", resp.status, await resp.text())
        return
      }
      const data = (await resp.json()) as BackendArticle[]
      if (!Array.isArray(data)) {
        console.warn("unexpected articles payload", data)
        return
      }
      mergeArticles(data)
    } catch (err) {
      console.error("Network or fetch error fetching articles:", err)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const doInitial = async () => {
      setIsLoading(true)
      await fetchArticlesFromBackend()
      if (!mountedRef.current) return
      setIsLoading(false)
    }
    doInitial()

    const id = window.setInterval(() => {
      fetchArticlesFromBackend()
    }, POLL_INTERVAL_MS)
    pollRef.current = id

    return () => {
      mountedRef.current = false
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchArticlesFromBackend])

  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      !selectedCategory || selectedCategory === "all" || article.category.toLowerCase() === selectedCategory.toLowerCase()

    const matchesSentiment =
      !selectedSentiment || selectedSentiment === "all" || article.sentiment === selectedSentiment

    return matchesSearch && matchesCategory && matchesSentiment
  })

  const visibleArticles = filteredArticles.slice(0, visibleCount)

  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE)
      setIsLoadingMore(false)
    }, 600)
  }, [isLoadingMore])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const openArticleSafe = (article: Article) => {
    const url = article.url || ""
    if (isValidExternalUrl(url)) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }
    try {
      const internalUrl = `/articles/${encodeURIComponent(article.id)}`
      window.open(internalUrl, "_blank")
    } catch (err) {
      console.error("Cannot open article:", err)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const getProxiedImage = (remote?: string | undefined) => {
    if (!remote) return PLACEHOLDER
    try {
      const enc = encodeURIComponent(remote)
      return `${BACKEND_BASE}/api/images/proxy?url=${enc}`
    } catch (err) {
      return PLACEHOLDER
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleArticles.map((article, index) => (
          <div key={article.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 30}ms` }}>
            <Card className="group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm hover:bg-card/80" onClick={() => openArticleSafe(article)}>
              <div className="relative h-48 bg-muted overflow-hidden">
                {/* Use an <img> with fallback to ensure 100% of cards show an image */}
                <img
                  src={article.imageUrl ? getProxiedImage(article.imageUrl) : PLACEHOLDER}
                  alt={article.title ?? "Article image"}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    // prevent infinite loop if placeholder errors
                    if (target.src.endsWith("/default-article.jpg")) return
                    target.onerror = null
                    target.src = PLACEHOLDER
                  }}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-3 left-3 transform transition-all duration-300 group-hover:scale-105">
                  <Badge variant="secondary" className="text-xs font-medium bg-background/90 text-foreground backdrop-blur-sm">
                    {article.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 transform transition-all duration-500 group-hover:rotate-12">
                  <ExternalLink className="h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg" />
                </div>
              </div>

              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getSentimentColor(article.sentiment)} text-xs flex items-center gap-1 transition-all duration-300 group-hover:scale-105`}>
                    <span className="transition-transform duration-300 group-hover:rotate-12">{getSentimentIcon(article.sentiment)}</span>
                    {article.sentiment === "unknown" ? "Unknown" : article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                    <span className="ml-1 opacity-80"><AnimatedCounter value={Math.abs(article.sentimentScore)} decimals={2} /></span>
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    <Clock className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-all duration-300 group-hover:scale-[1.02] origin-left">
                  {article.title}
                </h3>
              </CardHeader>

              <CardContent className="space-y-3">
                {article.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 text-pretty transition-colors duration-300 group-hover:text-foreground/80">
                    {article.description}
                  </p>
                )}

                <div className="flex items-center justify-between group-hover:scale-[1.02] transition-transform duration-300">
                  <span className="text-sm font-medium text-foreground">{article.source}</span>
                  <div className="h-px bg-border flex-1 mx-3 transition-colors duration-300 group-hover:bg-primary/30" />
                  <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-primary">Read more</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

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

      {visibleCount < filteredArticles.length && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" size="lg" className="min-w-32 bg-transparent hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 group">
            {isLoadingMore ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Loading...</div> : <span className="group-hover:scale-105 transition-transform duration-200">Load More Articles</span>}
          </Button>
        </div>
      )}

      {!isLoading && visibleCount >= filteredArticles.length && filteredArticles.length > 0 && (
        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center"><div className="w-6 h-6 bg-primary/20 rounded-full animate-pulse" /></div>
            <p className="text-muted-foreground">You've reached the end of the news feed.</p>
          </div>
        </div>
      )}
    </div>
  )
}
