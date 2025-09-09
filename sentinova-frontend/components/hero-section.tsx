"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, TrendingUp } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4 fade-in-up">
          <h1 className="font-serif font-bold text-6xl md:text-8xl lg:text-9xl text-balance">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent [background-clip:text] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] text-primary animate-gradient text-glow">
              SENTINOVA
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl text-muted-foreground font-light fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Beyond News, Into Insights
          </p>
        </div>

        <div className="max-w-2xl mx-auto fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="glass-intense rounded-2xl p-6 neon-glow-intense hover-lift">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search for news, topics, or sentiment trends..."
                className="pl-12 pr-4 py-6 text-lg bg-background/50 border-0 rounded-xl border-glow"
              />
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <Button
            size="lg"
            className="px-8 py-6 text-lg rounded-xl btn-premium neon-glow hover:neon-glow-intense transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Explore Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg rounded-xl glass hover:glass-intense hover:neon-glow transition-all duration-300 bg-transparent border-glow"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Try Sentiment AI
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 stagger-children">
          {[
            { icon: "🎯", title: "AI-Powered Analysis", desc: "Real-time sentiment tracking" },
            { icon: "⚡", title: "Lightning Fast", desc: "Instant news processing" },
            { icon: "🔮", title: "Predictive Insights", desc: "Trend forecasting" },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 hover-lift hover:neon-glow transition-all duration-300 shimmer"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-serif font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
