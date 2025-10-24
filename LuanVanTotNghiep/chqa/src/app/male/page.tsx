// male/page.tsx
"use client"
import { useState } from "react"
import { Header } from "@/components/header/header"
import { CategoryNav } from "@/components/header/category-nav"
import { ScrollBanners } from "@/components/scroll-banners"
import { CategoriesGrid } from "@/components/categories-grid"
import { BrandStory } from "@/components/brand-story"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function MalePage() {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)

  return (
    <div className="min-h-screen">
      <Header onHiddenChange={setIsHeaderHidden} />
      <CategoryNav isHeaderHidden={isHeaderHidden} />
      <main className="pt-30">
        <ScrollBanners category="male" />
        <CategoriesGrid type="male" />
        <BrandStory />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
