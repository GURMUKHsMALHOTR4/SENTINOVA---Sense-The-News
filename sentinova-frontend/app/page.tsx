"use client"

import { useState } from "react"
import { NewsCarousel } from "@/components/news-carousel"
import { NewsFeed } from "@/components/news-feed"
import { SearchAndFilter } from "@/components/search-and-filter"
import { ThemeToggle } from "@/components/theme-toggle"
import { PremiumLogo } from "@/components/premium-logo"
import { PremiumWordmark } from "@/components/premium-wordmark"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSentiment, setSelectedSentiment] = useState("all")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 group relative">
            <PremiumLogo />
            <div className="relative">
              <PremiumWordmark />
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="bg-gradient-to-br from-background via-card to-muted py-8 sm:py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-balance transition-all duration-500 hover:scale-105 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-pulse">
              Sentinova
            </h1>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: "200ms" }}>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 text-balance">
              Sense the News
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: "400ms" }}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              Your AI-powered sentiment-driven news feed that helps you understand not just what's happening, but how
              the world feels about it.
            </p>
          </div>
        </div>
      </section>

      {/* News Carousel */}
      <section className="py-6 sm:py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 transition-colors duration-300 hover:text-primary">
              Latest Headlines
            </h2>
          </div>
          <NewsCarousel />
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-4 sm:py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <SearchAndFilter
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onSentimentChange={setSelectedSentiment}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedSentiment={selectedSentiment}
            />
          </div>
        </div>
      </section>

      {/* News Feed */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <NewsFeed
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedSentiment={selectedSentiment}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 sm:py-8 mt-12 sm:mt-16 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-sm sm:text-base text-muted-foreground transition-colors duration-300 hover:text-foreground">
              © 2024 Sentinova. Powered by AI sentiment analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
