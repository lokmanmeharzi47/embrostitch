import Hero from "@/components/landing/Hero"
import FeaturedGrid from "@/components/landing/FeaturedGrid"
import FeaturedGridSkeleton from "@/components/landing/FeaturedGridSkeleton"
import AIAssistant from "@/components/shared/AIAssistant"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="font-sans bg-background text-foreground flex flex-col w-full">
      <Hero />
      <Suspense fallback={<FeaturedGridSkeleton />}>
        <FeaturedGrid />
      </Suspense>
      
      {/* We keep the old AI Assistant placeholder for now, will rewrite it in Phase 5 */}
      <AIAssistant />
    </div>
  )
}
