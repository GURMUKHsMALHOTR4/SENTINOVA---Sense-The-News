// src/components/NewsList.jsx
"use client"
import React, { useEffect, useState } from "react"
import { NewsImage } from "./NewsImage"   // ✅ import reusable image component

const BACKEND_BASE = "http://localhost:8000"
const PLACEHOLDER = "/placeholder.svg"

/**
 * Fetches recent articles from backend and displays them.
 * Expects backend endpoint: GET /api/articles/recent/{count}
 *
 * Example usage:
 * <NewsList count={10} />
 */
export default function NewsList({ count = 10 }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    async function fetchArticles() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${BACKEND_BASE}/api/articles/recent/${count}`,
          { signal: controller.signal, credentials: "include" }
        )
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Backend error ${res.status}: ${text}`)
        }
        const data = await res.json()
        setArticles(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
    return () => controller.abort()
  }, [count])

  if (loading) return <div>Loading latest news…</div>
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>
  if (!articles.length) return <div>No articles available.</div>

  return (
    <div>
      <h2 style={{ marginBottom: "12px" }}>Latest News</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {articles.map((a) => (
          <li
            key={a.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: "12px 0",
              display: "flex",
              flexDirection: "row",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            {/* Thumbnail */}
            <div style={{ flex: "0 0 120px" }}>
              <NewsImage
                imageUrl={a.imageUrl}
                alt={a.title || "No title"}
                className="w-[120px] h-[80px] object-cover rounded bg-gray-100"
                placeholder={PLACEHOLDER}
              />
            </div>

            {/* Article Info */}
            <div style={{ flex: 1 }}>
              <a
                href={a.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "#222",
                }}
              >
                {a.title || "Untitled"}
              </a>

              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                {a.source ? `${a.source}` : ""}
                {a.publishedAt
                  ? ` • ${new Date(a.publishedAt).toLocaleString()}`
                  : ""}
              </div>

              {a.summary ? (
                <p
                  style={{
                    margin: "6px 0 0 0",
                    color: "#333",
                    fontSize: 14,
                  }}
                >
                  {a.summary}
                </p>
              ) : null}

              <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
                Fetched:{" "}
                {a.fetchedAt
                  ? new Date(a.fetchedAt).toLocaleString()
                  : "—"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
