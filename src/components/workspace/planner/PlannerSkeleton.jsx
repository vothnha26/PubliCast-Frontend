import React from "react"

export default function PlannerSkeleton() {
  return (
    <div className="flex flex-col h-full w-full space-y-4 animate-fade-in select-none">
      {/* SubHeader Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-7 w-44 rounded-lg skeleton-shimmer" />
          <div className="h-7 w-28 rounded-lg skeleton-shimmer" />
        </div>
        <div className="h-8 w-64 rounded-xl skeleton-shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded-lg skeleton-shimmer" />
          <div className="h-9 w-28 rounded-lg skeleton-shimmer" />
        </div>
      </div>

      {/* Main Area Skeleton */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Calendar Grid Skeleton */}
        <div className="flex-1 border border-border rounded-2xl bg-card p-4 space-y-4 shadow-2xs">
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg skeleton-shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3 h-[calc(100%-4rem)]">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>

        {/* Insights Panel Skeleton */}
        <div className="w-80 border-l border-border bg-card p-5 space-y-5 rounded-2xl">
          <div className="h-6 w-36 rounded skeleton-shimmer" />
          <div className="h-32 rounded-xl skeleton-shimmer" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl skeleton-shimmer" />
            <div className="h-16 rounded-xl skeleton-shimmer" />
          </div>
          <div className="h-28 rounded-xl skeleton-shimmer" />
          <div className="h-24 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
