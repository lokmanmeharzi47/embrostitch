import React from "react"

export default function CreatorLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded-xl w-64" />
          <div className="h-4 bg-muted rounded-lg w-96 opacity-60" />
        </div>
        <div className="h-11 bg-muted rounded-xl w-40" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl shadow-sm border border-border/5" />
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[400px] bg-muted rounded-3xl shadow-sm border border-border/5" />
        </div>
        <div className="space-y-6">
          <div className="h-[400px] bg-muted rounded-3xl shadow-sm border border-border/5" />
        </div>
      </div>
    </div>
  )
}
