"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="overflow-hidden rounded-lg border bg-card">
            <Skeleton className="h-48 w-full animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 animate-pulse" />
                <Skeleton className="h-4 w-12 animate-pulse" />
              </div>
              <Skeleton className="h-6 w-full animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full animate-pulse" />
                <Skeleton className="h-4 w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
