import { Header } from "@/components/header/header"
import { CategoryNav } from "@/components/header/category-nav"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { getProductsByCategory } from "@/lib/products-data"
import { notFound } from "next/navigation"

type PageProps = {
  params: {
    type: string
    category: string
  }
}

const categoryNames: Record<string, string> = {
  "ao-thun": "Áo Thun",
  "ao-so-mi": "Áo Sơ Mi",
  "quan-jean": "Quần Jean",
  "ao-khoac": "Áo Khoác",
  "quan-short": "Quần Short",
  "ao-hoodie": "Áo Hoodie",
  vay: "Váy",
  "chan-vay": "Chân Váy",
  "ao-croptop": "Áo Croptop",
  "bo-do": "Bộ Đồ",
}

export default async function  CategoryPage({ params }: PageProps) {
  const { type, category } = params

  // Validate type
  if (!["male", "female", "kids"].includes(type)) {
    notFound()
  }

  const products = getProductsByCategory(type, category)
  const categoryName = categoryNames[category] || category

  return (
    <div className="min-h-screen">
      <Header />
      <CategoryNav isHeaderHidden={false}/>
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{categoryName}</h1>
            <p className="text-lg text-gray-600">{products.length} sản phẩm</p>
          </div>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
