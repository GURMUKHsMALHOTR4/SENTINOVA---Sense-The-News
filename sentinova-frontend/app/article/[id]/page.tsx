import { ArticleContent } from "@/components/article-content"
import { ArticleSidebar } from "@/components/article-sidebar"
import { AnimatedBackground } from "@/components/animated-background"
import { Navigation } from "@/components/navigation"
import { notFound } from "next/navigation"

// Mock article data - in a real app, this would come from an API
const mockArticles = {
  "1": {
    id: "1",
    title: "Revolutionary AI Breakthrough Transforms Healthcare Industry",
    source: "TechCrunch",
    author: "Sarah Chen",
    date: "2 hours ago",
    readTime: "5 min read",
    sentiment: "positive" as const,
    sentimentScore: 0.85,
    category: "Technology",
    content: `
      <p>A groundbreaking artificial intelligence system has demonstrated unprecedented accuracy in early disease detection, potentially saving millions of lives worldwide and revolutionizing how we approach healthcare diagnostics.</p>
      
      <p>The new AI platform, developed by researchers at Stanford University in collaboration with leading medical institutions, has shown remarkable success in identifying early-stage cancers, cardiovascular diseases, and neurological conditions with an accuracy rate exceeding 95%.</p>
      
      <p>"This represents a paradigm shift in medical diagnostics," said Dr. Maria Rodriguez, lead researcher on the project. "We're not just improving existing methods; we're fundamentally changing how diseases are detected and treated."</p>
      
      <p>The system analyzes medical imaging data, patient history, and real-time biomarkers to provide comprehensive health assessments. Early trials have shown the technology can detect certain cancers up to two years before traditional screening methods.</p>
      
      <p>However, some medical professionals express concerns about the potential for over-reliance on AI systems and the need for human oversight in critical medical decisions.</p>
      
      <p>The technology is expected to be available in major hospitals within the next 18 months, with plans for broader deployment across healthcare systems globally. This breakthrough could significantly reduce healthcare costs while improving patient outcomes worldwide.</p>
    `,
    imageUrl: "/ai-healthcare-technology-medical-breakthrough.jpg",
    tags: ["AI", "Healthcare", "Technology", "Medical Research"],
  },
}

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = mockArticles[params.id as keyof typeof mockArticles]

  if (!article) {
    notFound()
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <div className="lg:col-span-3">
              <ArticleContent article={article} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ArticleSidebar article={article} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
