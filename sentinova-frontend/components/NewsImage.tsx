// src/components/NewsImage.tsx
"use client"

import { useState, useEffect, useRef } from "react"

interface NewsImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  placeholder?: string
  backendProxyBase?: string
}

const DEFAULT_PLACEHOLDER = "/default-article.jpg" // your fallback in /public

export function NewsImage({
  imageUrl,
  alt,
  className,
  placeholder = DEFAULT_PLACEHOLDER,
  backendProxyBase = "http://localhost:8000",
}: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(placeholder)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const normalize = (u?: string | null) => {
    if (!u) return undefined
    const s = u.trim()
    if (!s) return undefined
    // handle protocol-relative URLs like //example.com/img.jpg
    if (s.startsWith("//")) return "https:" + s
    return s
  }

  const buildProxyUrl = (remote: string) => {
    try {
      const base = backendProxyBase.replace(/\/+$/, "")
      return `${base}/api/images/proxy?url=${encodeURIComponent(remote)}`
    } catch {
      return placeholder
    }
  }

  const preload = (url: string) =>
    new Promise<void>((resolve, reject) => {
      const img = new Image()
      // do not set crossOrigin/referrerPolicy here — many CDNs block anonymous/cors loads
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("failed to load"))
      img.src = url
    })

  const tryLoadSequence = async () => {
    const remote = normalize(imageUrl)
    if (!remote) {
      if (mountedRef.current) setImgSrc(placeholder)
      return
    }

    // candidates: original -> swapped protocol -> proxy -> placeholder
    const candidates: string[] = [remote]

    // if remote has http/https, add swapped version
    try {
      const u = new URL(remote)
      if (u.protocol === "http:") candidates.push(remote.replace(/^http:/, "https:"))
      else if (u.protocol === "https:") candidates.push(remote.replace(/^https:/, "http:"))
    } catch {
      // ignore
    }

    // proxy fallback
    candidates.push(buildProxyUrl(remote))

    for (const candidate of candidates) {
      try {
        // try preload first to avoid rendering broken <img>
        await preload(candidate)
        if (!mountedRef.current) return
        setImgSrc(candidate)
        // success — stop
        if (candidate === buildProxyUrl(remote)) {
          console.info("NewsImage: loaded via proxy:", candidate)
        } else {
          console.info("NewsImage: loaded direct:", candidate)
        }
        return
      } catch (err) {
        // continue to next candidate
        console.warn("NewsImage: candidate failed:", candidate)
      }
    }

    // all failed -> placeholder
    if (mountedRef.current) {
      console.warn("NewsImage: all candidates failed, using placeholder")
      setImgSrc(placeholder)
    }
  }

  useEffect(() => {
    // whenever imageUrl changes, attempt the sequence
    tryLoadSequence()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, backendProxyBase, placeholder])

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
}

export default NewsImage
