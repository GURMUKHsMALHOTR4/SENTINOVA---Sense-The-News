import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnimatedBackground } from "@/components/animated-background"
import { NewsGrid } from "@/components/news-grid"
import { InsightsPanel } from "@/components/insights-panel"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Main Content Area - will be populated with news cards */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif font-bold text-2xl">Latest News</h2>
                    <div className="text-sm text-muted-foreground">Showing 1,247 articles • Updated 2 minutes ago</div>
                  </div>
                  <NewsGrid />
                </div>
              </div>

              {/* Right Panel - Insights */}
              <div className="lg:col-span-1">
                <InsightsPanel />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
