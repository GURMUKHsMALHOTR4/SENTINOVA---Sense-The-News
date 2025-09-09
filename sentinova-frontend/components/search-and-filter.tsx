"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react"

interface SearchAndFilterProps {
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onSentimentChange: (sentiment: string) => void
  searchQuery: string
  selectedCategory: string
  selectedSentiment: string
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "technology", label: "Technology" },
  { value: "politics", label: "Politics" },
  { value: "business", label: "Business" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
]

const sentiments = [
  { value: "all", label: "All Sentiments", icon: null },
  { value: "positive", label: "Positive", icon: TrendingUp },
  { value: "neutral", label: "Neutral", icon: Minus },
  { value: "negative", label: "Negative", icon: TrendingDown },
]

export function SearchAndFilter({
  onSearchChange,
  onCategoryChange,
  onSentimentChange,
  searchQuery,
  selectedCategory,
  selectedSentiment,
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const clearAllFilters = () => {
    onSearchChange("")
    onCategoryChange("all")
    onSentimentChange("all")
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedSentiment !== "all"

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-[color:var(--sentiment-positive)] text-white hover:bg-[color:var(--sentiment-positive)]/80"
      case "negative":
        return "bg-[color:var(--sentiment-negative)] text-white hover:bg-[color:var(--sentiment-negative)]/80"
      case "neutral":
        return "bg-[color:var(--sentiment-neutral)] text-white hover:bg-[color:var(--sentiment-neutral)]/80"
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80"
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles by title or content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-12 text-base bg-card border-border/50 focus:border-primary/50"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="block lg:hidden">
        <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {[searchQuery, selectedCategory !== "all", selectedSentiment !== "all"].filter(Boolean).length}
              </Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Filter Controls */}
      <div className={`space-y-4 lg:space-y-0 ${isFilterOpen ? "block" : "hidden lg:block"}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row lg:flex-row gap-4 w-full lg:w-auto">
            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Category:</span>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full sm:w-48 bg-card border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sentiment Filter */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-foreground">Sentiment:</span>
              <div className="grid grid-cols-2 sm:flex gap-2">
                {sentiments.map((sentiment) => {
                  const Icon = sentiment.icon
                  const isActive = selectedSentiment === sentiment.value
                  return (
                    <Button
                      key={sentiment.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSentimentChange(sentiment.value)}
                      className={`${
                        isActive && sentiment.value !== "all" ? getSentimentColor(sentiment.value) : ""
                      } transition-all duration-200 text-xs sm:text-sm`}
                    >
                      {Icon && <Icon className="h-3 w-3 mr-1" />}
                      <span className="hidden sm:inline">{sentiment.label}</span>
                      <span className="sm:hidden">{sentiment.label.slice(0, 3)}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground w-full sm:w-auto justify-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Search: "{searchQuery.length > 20 ? searchQuery.slice(0, 20) + "..." : searchQuery}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {categories.find((c) => c.value === selectedCategory)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onCategoryChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedSentiment !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {sentiments.find((s) => s.value === selectedSentiment)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onSentimentChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
