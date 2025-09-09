import { AnimatedBackground } from "@/components/animated-background"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { PageTransition } from "@/components/page-transition"

export default function HomePage() {
  return (
    <PageTransition>
      <main className="relative">
        <AnimatedBackground />
        <Navigation />
        <HeroSection />
      </main>
    </PageTransition>
  )
}
