// src/components/NewsCarousel.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewsImage } from "@/components/NewsImage" // <- import NewsImage

// ... (your interfaces unchanged)
interface BackendSentiment { id: string; label?: string; score?: number; createdAt?: string }
interface BackendArticle {
  id: string | number
  title?: string
  source?: string
  fetchedAt?: string
  publishedAt?: string
  url?: string
  category?: string
  summary?: string
  content?: string
  imageUrl?: string | null
  sentiments?: BackendSentiment[]
  [k: string]: any
}
type SentimentLabel = "positive" | "neutral" | "negative" | "unknown"
interface UIArticle {
  id: string
  title: string
  source: string
  publishedAt: string
  url?: string
  category: string
  description?: string
  sentiment: SentimentLabel
  sentimentScore: number
  fetchedAt?: string
  imageUrl?: string | undefined
}

const BACKEND_BASE = "http://localhost:8000"
const FETCH_COUNT = 5
const POLL_MS = 45_000
const PLACEHOLDER = "/placeholder.svg"

export function NewsCarousel() {
  const [articles, setArticles] = useState<UIArticle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const pollRef = useRef<number | null>(null)

  // --- helper functions kept from your original code ---
  const normalizeLabel = (raw?: string, score?: number): SentimentLabel => {
    if (!raw && typeof score === "number") {
      if (score > 0.1) return "positive"
      if (score < -0.1) return "negative"
      return "neutral"
    }
    if (!raw) return "unknown"
    const s = raw.toString().trim().toLowerCase()
    if (s.includes("pos") || s.includes("positive") || s.includes("p")) return "positive"
    if (s.includes("neg") || s.includes("negative") || s.includes("n")) return "negative"
    if (s.includes("neu") || s.includes("neutral")) return "neutral"
    const asNum = Number(s.replace(/[^\d.-]/g, ""))
    if (!Number.isNaN(asNum)) {
      if (asNum > 0.1) return "positive"
      if (asNum < -0.1) return "negative"
      return "neutral"
    }
    return "unknown"
  }

  const getBadgeClasses = (sentiment: SentimentLabel) => {
    switch (sentiment) {
      case "positive":
        return "bg-[color:var(--sentiment-positive)] text-white ring-0 bg-green-600 text-white"
      case "negative":
        return "bg-[color:var(--sentiment-negative)] text-white ring-0 bg-red-600 text-white"
      case "neutral":
        return "bg-[color:var(--sentiment-neutral)] text-white ring-0 bg-gray-500 text-white"
      default:
        return "bg-muted-foreground text-black/80 ring-0 bg-gray-300 text-gray-800"
    }
  }

  const isValidImageUrl = (u?: string | null) => {
    if (!u) return false
    const s = u.trim()
    return (
      s.length > 0 &&
      (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:") || s.startsWith("//"))
    )
  }

  const normalizeImageUrl = (raw?: string | null): string | undefined => {
    if (!raw) return undefined
    let s = raw.trim()
    if (s === "") return undefined
    if (s.startsWith("//")) s = "https:" + s
    return isValidImageUrl(s) ? s : undefined
  }

  const mapBackend = (b: BackendArticle): UIArticle => {
    let sentimentLabel: SentimentLabel = "unknown"
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
      sentimentLabel = normalizeLabel(rawLabel, Number.isFinite(rawScore) ? rawScore : undefined)
      sentimentScore = Number.isFinite(rawScore) ? rawScore : 0
    } else {
      const candidateLabel = (b as any).sentimentLabel ?? (b as any).sentiment ?? undefined
      const candidateScore = (b as any).sentimentScore ?? (b as any).score ?? undefined
      if (candidateLabel || typeof candidateScore === "number") {
        sentimentLabel = normalizeLabel(candidateLabel, typeof candidateScore === "number" ? candidateScore : undefined)
        sentimentScore = typeof candidateScore === "number" ? candidateScore : 0
      } else {
        const text = `${b.title ?? ""} ${b.summary ?? ""} ${b.content ?? ""}`.toLowerCase()
        if (text.includes("good") || text.includes("positive") || text.includes("up")) sentimentLabel = "positive"
        else if (text.includes("bad") || text.includes("negative") || text.includes("down")) sentimentLabel = "negative"
        else sentimentLabel = "neutral"
      }
    }

    return {
      id: String(b.id ?? Math.random().toString(36).slice(2, 9)),
      title: b.title ?? "Untitled",
      source: b.source ?? "Unknown",
      publishedAt: b.publishedAt ?? b.fetchedAt ?? new Date().toISOString(),
      url: b.url ?? undefined,
      category: b.category ?? "General",
      description: b.summary ?? b.content ?? "",
      sentiment: sentimentLabel,
      sentimentScore: Number(sentimentScore) || 0,
      fetchedAt: b.fetchedAt,
      // IMPORTANT: keep the ORIGINAL remote URL in imageUrl (do not pre-proxy here)
      imageUrl: normalizeImageUrl((b as any).imageUrl ?? (b as any).urlToImage ?? null),
    }
  }

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/articles/recent/${FETCH_COUNT}`, {
        headers: { Accept: "application/json" },
        mode: "cors",
      })
      if (!res.ok) {
        console.warn("news carousel: backend returned", res.status, await res.text())
        return
      }
      const data = (await res.json()) as BackendArticle[]
      if (!Array.isArray(data)) {
        console.warn("news carousel: unexpected payload", data)
        return
      }
      const mapped = data.map(mapBackend)
      setArticles(mapped)
      setCurrentIndex((ci) => Math.min(ci, Math.max(0, mapped.length - 1)))
    } catch (err) {
      console.error("news carousel fetch error", err)
    }
  }, [])

  useEffect(() => {
    fetchRecent()
    pollRef.current = window.setInterval(fetchRecent, POLL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchRecent])

  useEffect(() => {
    if (!isAutoPlaying || articles.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length)
    }, 2700)
    return () => clearInterval(interval)
  }, [articles.length, isAutoPlaying])

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  // NOTE: we no longer force a proxied URL here; NewsImage will attempt direct load first,
  // and if direct fails it'll use the backend proxy (we pass backendProxyBase).
  if (articles.length === 0) {
    return <div className="text-muted-foreground">No headlines yet</div>
  }

  const currentArticle = articles[currentIndex]

  return (
    <div className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Big hero card */}
      <div
        className="relative h-48 sm:h-56 md:h-64 bg-transparent rounded-lg overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]"
        onClick={() => currentArticle.url && window.open(currentArticle.url, "_blank")}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background image (full-bleed). Pass ORIGINAL remote URL into NewsImage and let it fallback->proxy */}
        <NewsImage
          imageUrl={currentArticle.imageUrl ?? undefined}
          alt={currentArticle.title}
          className="absolute inset-0 w-full h-full object-cover -z-10"
          placeholder={PLACEHOLDER}
          backendProxyBase={BACKEND_BASE}
        />

        {/* Ultra-light overlay: ~2% darkness at bottom, ~1% middle, transparent top */}
        <div
          className="absolute inset-0 z-10 transition-all duration-500 group-hover:from-black/6"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.02), rgba(0,0,0,0.01) 40%, rgba(0,0,0,0) 100%)",
            // fallback for Tailwind class differences — inline style ensures small values apply
          }}
        />

        {/* Animated under-light effect — made extremely subtle so it doesn't darken the image */}
        <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-transparent to-accent/6 animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-20 p-4 sm:p-6 h-full flex flex-col justify-between transition-all duration-500 group-hover:scale-105">
          <div className="flex items-start justify-between">
            <Badge className={`${getBadgeClasses(currentArticle.sentiment)} text-xs font-medium`}>
              {currentArticle.sentiment === "unknown"
                ? "Unknown"
                : currentArticle.sentiment.charAt(0).toUpperCase() + currentArticle.sentiment.slice(1)}
            </Badge>

            <div className="flex items-center gap-2">
              <div className="text-xs text-white/80">{formatDate(currentArticle.publishedAt)}</div>
              <ExternalLink className="h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 transform transition-all duration-500 group-hover:translate-y-[-4px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight line-clamp-2 transition-all duration-300 group-hover:text-shadow-lg">
              {currentArticle.title}
            </h3>

            <div className="flex items-center justify-between text-xs sm:text-sm text-white/80 transition-all duration-300 group-hover:text-white/90">
              <span className="font-medium truncate mr-2">{currentArticle.source}</span>
              <span className="whitespace-nowrap">{formatDate(currentArticle.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
            setIsAutoPlaying(false)
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentIndex((prev) => (prev + 1) % articles.length)
            setIsAutoPlaying(false)
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {articles.map((_, i) => (
          <button
            key={i}
            className={`h-2 rounded-full ${i === currentIndex ? "bg-primary w-6 shadow-lg shadow-primary/50" : "bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60"}`}
            onClick={() => {
              setCurrentIndex(i)
              setIsAutoPlaying(false)
            }}
          />
        ))}
      </div>

      {/* 5 preview boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mt-4 sm:mt-6">
        {articles.slice(0, 5).map((a, i) => (
          <Card
            key={a.id}
            className={`cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:scale-105 ${
              i === currentIndex ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-105" : ""
            }`}
            onClick={() => {
              setCurrentIndex(i)
              setIsAutoPlaying(false)
            }}
          >
            <CardContent className="p-3">
              <div className="w-full h-20 mb-2 bg-muted overflow-hidden rounded">
                {/* Important: pass original remote imageUrl and allow NewsImage to fallback->proxy */}
                <NewsImage
                  imageUrl={a.imageUrl ?? undefined}
                  alt={a.title}
                  placeholder={PLACEHOLDER}
                  backendProxyBase={BACKEND_BASE}
                  className="w-full h-full object-cover"
                />
              </div>

              <Badge className={`${getBadgeClasses(a.sentiment)} text-xs mb-2`}>
                {a.sentiment === "unknown" ? "Unknown" : a.sentiment.charAt(0).toUpperCase() + a.sentiment.slice(1)}
              </Badge>
              <h4 className="text-sm font-medium line-clamp-2">{a.title}</h4>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{a.source}</span>
                <span>{formatDate(a.publishedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
