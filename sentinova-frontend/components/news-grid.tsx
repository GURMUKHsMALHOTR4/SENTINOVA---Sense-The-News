"use client"

import { NewsCard, type NewsItem } from "@/components/news-card"
import { useRouter } from "next/navigation"

const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Revolutionary AI Breakthrough Transforms Healthcare Industry",
    source: "TechCrunch",
    date: "2 hours ago",
    sentiment: "positive",
    sentimentScore: 0.85,
    summary:
      "A groundbreaking AI system has demonstrated unprecedented accuracy in early disease detection, potentially saving millions of lives worldwide.",
    category: "Technology",
  },
  {
    id: "2",
    title: "Global Markets Show Signs of Economic Recovery",
    source: "Bloomberg",
    date: "4 hours ago",
    sentiment: "positive",
    sentimentScore: 0.72,
    summary:
      "Major stock indices reached new highs as investors show renewed confidence in economic stability and growth prospects.",
    category: "Finance",
  },
  {
    id: "3",
    title: "Climate Summit Faces Challenges in Reaching Consensus",
    source: "Reuters",
    date: "6 hours ago",
    sentiment: "negative",
    sentimentScore: -0.45,
    summary:
      "Delegates struggle to find common ground on emission reduction targets as time runs out for meaningful climate action.",
    category: "Politics",
  },
  {
    id: "4",
    title: "New Space Mission Launches Successfully",
    source: "Space News",
    date: "8 hours ago",
    sentiment: "positive",
    sentimentScore: 0.91,
    summary:
      "The latest Mars exploration mission launched without incident, carrying advanced scientific instruments for planetary research.",
    category: "Technology",
  },
  {
    id: "5",
    title: "Healthcare Costs Continue to Rise Nationwide",
    source: "Health Today",
    date: "10 hours ago",
    sentiment: "negative",
    sentimentScore: -0.62,
    summary:
      "A comprehensive study reveals that healthcare expenses have increased by 15% this year, putting strain on families and businesses.",
    category: "Health",
  },
  {
    id: "6",
    title: "Tech Giants Announce Collaboration on AI Ethics",
    source: "Wired",
    date: "12 hours ago",
    sentiment: "neutral",
    sentimentScore: 0.12,
    summary:
      "Major technology companies have formed a consortium to establish industry standards for responsible AI development and deployment.",
    category: "Technology",
  },
]

interface NewsGridProps {
  onArticleClick?: (article: NewsItem) => void
}

export function NewsGrid({ onArticleClick }: NewsGridProps) {
  const router = useRouter()

  const handleArticleClick = (article: NewsItem) => {
    if (onArticleClick) {
      onArticleClick(article)
    } else {
      router.push(`/article/${article.id}`)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {mockNews.map((news) => (
        <NewsCard key={news.id} news={news} onClick={() => handleArticleClick(news)} />
      ))}
    </div>
  )
}
