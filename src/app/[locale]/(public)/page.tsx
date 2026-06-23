import Hero from "@/components/landing/Hero"
import FeaturedGrid from "@/components/landing/FeaturedGrid"
import FeaturedGridSkeleton from "@/components/landing/FeaturedGridSkeleton"
import CategoriesSection from "@/components/landing/CategoriesSection"
import HowItWorks from "@/components/landing/HowItWorks"
import Testimonials from "@/components/landing/Testimonials"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="font-sans bg-background text-foreground flex flex-col w-full">
      {/* 1. Hero — Full-screen CTA with search */}
      <Hero />

      {/* 2. Categories — Algerian fashion specialties */}
      <CategoriesSection />

      {/* 3. Featured Créatrices — Top-rated professionals */}
      <Suspense fallback={<FeaturedGridSkeleton />}>
        <FeaturedGrid />
      </Suspense>

      {/* 4. How it works — 3-step process */}
      <HowItWorks />

      {/* 5. Testimonials — Social proof */}
      <Testimonials />
    </div>
  )
}
