"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  TrendingUp,
  Briefcase,
  Gamepad2,
  Heart,
  Globe,
  Zap,
  User,
  Bookmark,
  Settings,
  Filter,
} from "lucide-react"
import { useState } from "react"

const categories = [
  { name: "All News", icon: Home, count: 1247 },
  { name: "Technology", icon: Zap, count: 342 },
  { name: "Politics", icon: Globe, count: 189 },
  { name: "Finance", icon: TrendingUp, count: 156 },
  { name: "Business", icon: Briefcase, count: 98 },
  { name: "Sports", icon: Gamepad2, count: 87 },
  { name: "Health", icon: Heart, count: 64 },
]

const sentimentFilters = [
  { name: "Positive", color: "bg-chart-1", count: 456 },
  { name: "Neutral", color: "bg-chart-2", count: 623 },
  { name: "Negative", color: "bg-chart-3", count: 168 },
]

export function DashboardSidebar() {
  const [activeCategory, setActiveCategory] = useState("All News")
  const [activeSentiments, setActiveSentiments] = useState<string[]>(["Positive", "Neutral", "Negative"])

  const toggleSentiment = (sentiment: string) => {
    setActiveSentiments((prev) =>
      prev.includes(sentiment) ? prev.filter((s) => s !== sentiment) : [...prev, sentiment],
    )
  }

  return (
    <aside className="w-80 glass border-r border-border/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/20">
        <h1 className="font-serif font-bold text-2xl">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SENTINOVA</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI News Intelligence</p>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Categories */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
          </div>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.name
              return (
                <Button
                  key={category.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-between rounded-xl ${
                    isActive ? "neon-glow bg-accent/20 text-accent-foreground" : ""
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        <Separator className="mx-6" />

        {/* Sentiment Filters */}
        <div className="p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Sentiment Filter
          </h3>
          <div className="space-y-2">
            {sentimentFilters.map((filter) => {
              const isActive = activeSentiments.includes(filter.name)
              return (
                <Button
                  key={filter.name}
                  variant="ghost"
                  className={`w-full justify-between rounded-xl transition-all duration-200 ${
                    isActive ? "bg-card/50" : "opacity-50"
                  }`}
                  onClick={() => toggleSentiment(filter.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${filter.color} ${isActive ? "" : "opacity-50"}`} />
                    <span className="text-sm">{filter.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        <Separator className="mx-6" />

        {/* User Section */}
        <div className="p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Personal</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start rounded-xl">
              <User className="w-4 h-4 mr-3" />
              <span className="text-sm">Profile</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl">
              <Bookmark className="w-4 h-4 mr-3" />
              <span className="text-sm">Saved News</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl">
              <Settings className="w-4 h-4 mr-3" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
