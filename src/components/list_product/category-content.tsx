// app/(root)/[gender]/[category]/category-content.tsx

import { ProductHeader } from "@/components/list_product/product-header"
import { ProductGrid } from "@/components/list_product/product-grid"
import { getProductsByCategory } from "@/lib/api/product_category"

export default async function CategoryContent({
  gender,
  category
}: {
  gender: string
  category: string
}) {
  
  const data = await getProductsByCategory(gender, category)

  return (
    <>
      <ProductHeader
        gender={gender}
        categoryName={data?.category?.name}
        productCount={data?.products?.length || 0}
      />

      <ProductGrid 
  products={data?.products || []}
  gender={gender}
  category={category}
/>

    </>
  )
}
