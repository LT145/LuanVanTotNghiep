import { Header } from "@/components/header/header"
import { CategoryNav } from "@/components/header/category-nav"
import { ScrollBanners } from "@/components/scroll-banners"
import { CategoriesGrid } from "@/components/categories-grid"
import { BrandStory } from "@/components/brand-story"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function FemalePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <CategoryNav />
      <main className="pt-30">
        <ScrollBanners category="female" />
        <CategoriesGrid type="female" />
        <BrandStory />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
